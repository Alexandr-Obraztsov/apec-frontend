import axios from 'axios'
import { API_BASE_URL, CircuitSolutionResult } from './api'
import { Task } from '../store/tasksStore'
import { generateConditions } from '../utils/generateConditions'
import { getElementUnit } from '../utils/getElementUnit'

export interface TaskData {
	image: string
	conditions: string[]
	component_values: Record<string, string>
	solutions: CircuitSolutionResult
	detailedSolution?: Task['detailedSolution']
}

export const htmlService = {
	async generateTasksHtml(tasks: Task[]): Promise<Blob> {
		try {
			const tasksData: TaskData[] = tasks.map(task => {
				const component_values = Object.entries(task.componentValues).reduce(
					(acc, [key, value]) => {
						acc[key] = value + ' ' + getElementUnit(key)
						return acc
					},
					{} as Record<string, string>
				)
				const solutions: CircuitSolutionResult = Object.entries(
					task.requiredParameters
				).reduce((acc, [elementName, values]) => {
					if (task.detailedSolution && task.detailedSolution.elements) {
						const elementSolution = task.detailedSolution.elements[elementName]
						if (elementSolution) {
							if (!acc[elementName]) {
								acc[elementName] = { 'i(t)': '', 'U(t)': '' }
							}
							if (values.current && elementSolution.type === 'i') {
								acc[elementName]['i(t)'] = elementSolution.expr
							}
							if (values.voltage && elementSolution.type === 'v') {
								acc[elementName]['U(t)'] = elementSolution.expr
							}
						}
					}
					return acc
				}, {} as CircuitSolutionResult)
				return {
					image: task.imageUrl,
					component_values,
					conditions: generateConditions(task) || [],
					solutions,
					detailedSolution: task.detailedSolution,
				}
			})
			const response = await axios.post(
				`${API_BASE_URL}/generate_html`,
				{ tasks: tasksData },
				{
					responseType: 'blob',
				}
			)

			return new Blob([response.data], { type: 'text/html' })
		} catch (error) {
			console.error('Error generating HTML:', error)
			throw error
		}
	},

	downloadHtml(htmlBlob: Blob, filename: string = 'tasks.html'): void {
		const url = window.URL.createObjectURL(htmlBlob)
		const link = document.createElement('a')
		link.href = url
		link.setAttribute('download', filename)
		document.body.appendChild(link)
		link.click()
		link.remove()
		window.URL.revokeObjectURL(url)
	},

	generateHtmlFromTasks(tasks: Task[]): string {
		const styles = `
			body { font-family: sans-serif; margin: 2em; background-color: #f4f4f9; color: #333; }
			.page { padding: 1.5em; }
			.tasks-container, .solutions-container { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5em; }
			.task { display: flex; flex-direction: column; background-color: #fff; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 1em; padding: 1em; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
			.solution-task { background-color: #fff; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 1em; padding: 1em; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
			h1 { color: #2c3e50; text-align: center; }
			h2 { font-size: 1.1rem; color: #34495e; border-bottom: 2px solid #3498db; padding-bottom: 0.3em; margin-top: 1em; }
			h3 { font-size: 0.9rem; color: #555; margin-bottom: 0.5em; }
			img { max-width: 100%; height: auto; max-height: 200px; object-fit: contain; margin: 0 auto 1em; border-radius: 4px; }
			.conditions, .component-values { display: grid; grid-template-columns: 1fr; gap: 0.5em; margin-bottom: 1em; }
			.condition-item, .component-item { font-size: 0.8em; background-color: #ecf0f1; padding: 0.5em; border-radius: 4px; }
			.solution-details { display: flex; flex-direction: column; gap: 1em; }
			.solution-block { background-color: #f8f9fa; padding: 0.8em; border: 1px solid #e9ecef; border-radius: 4px; }
			.answers { margin-top: 1em; }
			.answer-item { background: #e8f6f3; padding: 0.8em; border: 1px solid #d1e9e3; border-radius: 4px; margin-bottom: 0.5em; font-size: 0.9em;}
			.print-button { position: fixed; top: 1em; right: 1em; padding: 0.5em 1em; background-color: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer; z-index: 100; }

			@media print {
				body { margin: 0.5em; background-color: #fff; font-size: 10pt; }
				.print-button { display: none; }
				.solutions-page { page-break-before: always; }
				.tasks-container, .solutions-container { grid-template-columns: 1fr 1fr; gap: 1em; }
				.task, .solution-task { border: 1px solid #ccc; box-shadow: none; page-break-inside: avoid; margin: 0; }
				.solutions-container .solution-task:nth-child(2n) { page-break-after: always; }
				.solutions-container .solution-task:last-child { page-break-after: auto; }
			}
		`

		const tasksHtml = tasks
			.map((task, index) => {
				const component_values = Object.entries(task.componentValues)
					.map(
						([key, value]) => `
				<div class="component-item">${key}: ${value} ${getElementUnit(key)}</div>
			`
					)
					.join('')

				const conditions = (generateConditions(task) || [])
					.map(
						condition => `
				<div class="condition-item">${condition}</div>
			`
					)
					.join('')

				return `
				<div class="task">
					<h2>Задача ${index + 1}</h2>
					<img src="${task.imageUrl}" alt="Схема цепи" />
					<h3>Условия:</h3>
					<div class="component-values">${component_values}</div>
					<h3>Требуется найти:</h3>
					<div class="conditions">${conditions}</div>
				</div>
			`
			})
			.join('')

		const solutionsHtml = tasks
			.map((task, index) => {
				let detailedSolutionHtml = ''
				if (task.detailedSolution) {
					const { poly, roots, initial_values } = task.detailedSolution

					const rootsHtml = roots
						.map((root, i) => `<li>$p_{${i + 1}} = ${root}$</li>`)
						.join('')
					const initialValuesHtml = Object.entries(initial_values)
						.map(([key, value]) => `<li>$${key} = ${value}$</li>`)
						.join('')

					detailedSolutionHtml = `
					<div class="solution-details">
						<div class="solution-block">
							<h4>Характеристический многочлен</h4>
							<p>$$${poly}$$</p>
						</div>
						<div class="solution-block">
							<h4>Корни уравнения</h4>
							<ul>${rootsHtml}</ul>
						</div>
						<div class="solution-block">
							<h4>Начальные значения</h4>
							<ul>${initialValuesHtml}</ul>
						</div>
					</div>
				`
				}

				const answersHtml = Object.entries(task.requiredParameters)
					.map(([elementName, params]) => {
						let answer = ''
						if (task.detailedSolution?.elements[elementName]) {
							const elemSolution = task.detailedSolution.elements[elementName]
							if (params.current && elemSolution.type === 'i') {
								answer += `<div class="answer-item"><strong>Ток i(t) для ${elementName}:</strong> $$${elemSolution.expr}$$</div>`
							}
							if (params.voltage && elemSolution.type === 'v') {
								answer += `<div class="answer-item"><strong>Напряжение U(t) для ${elementName}:</strong> $$${elemSolution.expr}$$</div>`
							}
						}
						return answer
					})
					.join('')

				return `
				<div class="solution-task">
					<h2>Решение задачи ${index + 1}</h2>
					<h3>Подробное решение:</h3>
					${detailedSolutionHtml}
					<div class="answers">
						<h3>Ответы:</h3>
						${answersHtml}
					</div>
				</div>
			`
			})
			.join('')

		return `
			<!DOCTYPE html>
			<html lang="ru">
			<head>
				<meta charset="UTF-8">
				<title>Задачи по электрическим цепям</title>
				<script>
					window.MathJax = {
						tex: {
							inlineMath: [['$', '$']],
							displayMath: [['$$', '$$']]
						},
						svg: {
							fontCache: 'global'
						}
					};
				</script>
				<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js" id="MathJax-script" async></script>
				<style>${styles}</style>
			</head>
			<body>
				<button class="print-button" onclick="window.print()">Печать</button>
				<div class="tasks-page page">
					<h1>Задачи</h1>
					<div class="tasks-container">
					${tasksHtml}
					</div>
				</div>
				<div class="solutions-page page">
					<h1>Решения</h1>
					<div class="solutions-container">
					${solutionsHtml}
					</div>
				</div>
			</body>
			</html>
		`