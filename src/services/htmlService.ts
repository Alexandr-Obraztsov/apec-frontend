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
								acc[elementName] = { 'i(t)': '', 'V(t)': '' }
							}
							if (values.current && elementSolution.type === 'i') {
								acc[elementName]['i(t)'] = elementSolution.expr
							}
							if (values.voltage && elementSolution.type === 'v') {
								acc[elementName]['V(t)'] = elementSolution.expr
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
			* { box-sizing: border-box; }
			
			body { 
				font-family: 'Times New Roman', 'Georgia', serif; 
				margin: 0; 
				padding: 0;
				background: #ffffff;
				color: #000000;
				line-height: 1.6;
			}
			
			.container {
				max-width: 1000px;
				margin: 0 auto;
				padding: 2rem;
			}
			
			.header {
				text-align: center;
				margin-bottom: 3rem;
				border-bottom: 3px solid #000000;
				padding-bottom: 1rem;
			}
			
			.header h1 {
				font-size: 2.5rem;
				margin: 0;
				color: #000000;
				font-weight: bold;
			}
			
			.header p {
				font-size: 1.1rem;
				margin: 1rem 0 0 0;
				color: #333333;
				font-style: italic;
			}
			
			.task, .solution-task {
				background: #ffffff;
				border: 2px solid #000000;
				margin: 2rem 0;
				padding: 2rem;
				page-break-inside: avoid;
			}
			
			.task-number, .solution-number {
				display: inline-block;
				background: #000000;
				color: #ffffff;
				padding: 0.5rem 1.5rem;
				font-size: 1.2rem;
				font-weight: bold;
				margin-bottom: 1.5rem;
			}
			
			.circuit-image {
				text-align: center;
				margin: 2rem 0;
				padding: 1.5rem;
				border: 1px solid #cccccc;
				background: #f9f9f9;
			}
			
			.circuit-image img {
				max-width: 100%;
				height: auto;
				max-height: 300px;
				border: 1px solid #000000;
			}
			
			.section-title {
				font-size: 1.3rem;
				color: #000000;
				margin: 2rem 0 1rem 0;
				padding-bottom: 0.5rem;
				border-bottom: 2px solid #000000;
				font-weight: bold;
				text-transform: uppercase;
			}
			
			.component-values {
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
				gap: 1rem;
				margin: 1.5rem 0;
			}
			
			.component-item {
				background: #f5f5f5;
				padding: 1rem;
				border: 1px solid #000000;
				font-weight: 500;
			}
			
			.conditions {
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
				gap: 1rem;
				margin: 1.5rem 0;
			}
			
			.condition-item {
				background: #f0f0f0;
				padding: 1rem;
				border: 1px solid #000000;
				font-weight: 500;
			}
			
			.solution-details {
				margin: 2rem 0;
			}
			
			.solution-block {
				background: #fafafa;
				border: 2px solid #000000;
				padding: 1.5rem;
				margin: 1rem 0;
			}
			
			.solution-block h4 {
				margin: 0 0 1rem 0;
				color: #000000;
				font-size: 1.1rem;
				font-weight: bold;
				padding-bottom: 0.5rem;
				border-bottom: 1px solid #000000;
				text-transform: uppercase;
			}
			
			.poly-block {
				background: #f8f8f8;
				border-left: 5px solid #000000;
			}
			
			.roots-block {
				background: #f5f5f5;
				border-left: 5px solid #333333;
			}
			
			.initial-values-block {
				background: #f2f2f2;
				border-left: 5px solid #666666;
			}
			
			.solution-block ul {
				list-style: none;
				padding: 0;
				margin: 0;
			}
			
			.solution-block li {
				background: #ffffff;
				margin: 0.5rem 0;
				padding: 0.8rem;
				border: 1px solid #cccccc;
				font-family: 'Courier New', monospace;
			}
			
			.answers {
				margin: 2rem 0;
			}
			
			.answer-item {
				background: #ffffff;
				border: 2px solid #000000;
				padding: 1.5rem;
				margin: 1rem 0;
			}
			
			.answer-item strong {
				color: #000000;
				font-size: 1.1rem;
				display: block;
				margin-bottom: 0.5rem;
			}
			
			.steady-state {
				display: inline-block;
				background: #e0e0e0;
				color: #000000;
				padding: 0.3rem 0.8rem;
				font-size: 0.9rem;
				margin-top: 0.5rem;
				border: 1px solid #000000;
				font-style: italic;
			}
			
			.print-button {
				position: fixed;
				top: 2rem;
				right: 2rem;
				background: #000000;
				color: #ffffff;
				border: 2px solid #000000;
				padding: 1rem 2rem;
				cursor: pointer;
				font-size: 1rem;
				font-weight: bold;
				z-index: 1000;
			}
			
			.print-button:hover {
				background: #ffffff;
				color: #000000;
			}
			
			.page-divider {
				height: 3px;
				background: #000000;
				margin: 4rem 0;
				page-break-before: always;
			}
			
			.equation-display {
				background: #ffffff;
				padding: 1rem;
				margin: 0.5rem 0;
				border: 1px solid #000000;
				font-family: 'Courier New', monospace;
			}

			@media print {
				body { 
					background: white !important;
					font-size: 11pt;
					line-height: 1.4;
				}
				.print-button { display: none; }
				.container { max-width: 100%; padding: 1rem; }
				.task, .solution-task {
					border: 1px solid #000000;
					page-break-inside: avoid;
					margin: 1rem 0;
					padding: 1.5rem;
				}
				.header { margin-bottom: 2rem; }
				.header h1 { font-size: 1.8rem; }
				.circuit-image { background: #ffffff; }
				.page-divider { 
					page-break-before: always; 
					height: 1px; 
					background: #000000; 
					margin: 2rem 0;
				}
				.solution-block, .answer-item, .component-item, .condition-item {
					background: #ffffff !important;
				}
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
					<div class="task-number">Задача ${index + 1}</div>
					<div class="circuit-image">
						<img src="${task.imageUrl}" alt="Схема цепи ${index + 1}" />
					</div>
					<h3 class="section-title">Исходные данные</h3>
					<div class="component-values">${component_values}</div>
					<h3 class="section-title">Требуется найти</h3>
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
						.map((root, i) => `<li>p_{${i + 1}} = ${root}</li>`)
						.join('')
					const initialValuesHtml = Object.entries(initial_values)
						.map(([key, value]) => `<li>${key} = ${value}</li>`)
						.join('')

					detailedSolutionHtml = `
					<div class="solution-details">
						<div class="solution-block poly-block">
							<h4>Характеристический многочлен</h4>
							<div class="equation-display">$$${poly}$$</div>
						</div>
						<div class="solution-block roots-block">
							<h4>Корни характеристического уравнения</h4>
							<ul>${rootsHtml}</ul>
						</div>
						<div class="solution-block initial-values-block">
							<h4>Начальные условия</h4>
							<ul>${initialValuesHtml}</ul>
						</div>
					</div>
				`
				}

				// Получаем все уравнения из detailedSolution для полного отображения
				let allEquationsHtml = ''
				if (task.detailedSolution?.elements) {
					const equationElements = Object.entries(
						task.detailedSolution.elements
					)
						.map(([elementName, elemSolution]) => {
							const steadyStateHtml = `<span class="steady-state">установившийся режим: ${elemSolution.steady_state}</span>`
							const typeLabel = elemSolution.type === 'i' ? 'Ток' : 'Напряжение'
							const symbol = elemSolution.type === 'i' ? 'i(t)' : 'V(t)'

							return `
								<div class="answer-item">
									<strong>${typeLabel} ${symbol} для элемента ${elementName}:</strong>
									<div class="equation-display">$$${elemSolution.expr}$$</div>
									${steadyStateHtml}
								</div>
							`
						})
						.join('')

					allEquationsHtml = `
						<div class="answers">
							<h3 class="section-title">Результаты расчета</h3>
							${equationElements}
						</div>
					`
				}

				// Отображаем только требуемые параметры
				const requiredAnswersHtml = Object.entries(task.requiredParameters)
					.map(([elementName, params]) => {
						let answer = ''
						if (task.detailedSolution?.elements[elementName]) {
							const elemSolution = task.detailedSolution.elements[elementName]
							const steadyStateHtml = `<span class="steady-state">установившийся режим: ${elemSolution.steady_state}</span>`

							if (params.current && elemSolution.type === 'i') {
								answer += `
									<div class="answer-item">
										<strong>Ток i(t) для элемента ${elementName}:</strong>
										<div class="equation-display">$$${elemSolution.expr}$$</div>
										${steadyStateHtml}
									</div>
								`
							}
							if (params.voltage && elemSolution.type === 'v') {
								answer += `
									<div class="answer-item">
										<strong>Напряжение V(t) для элемента ${elementName}:</strong>
										<div class="equation-display">$$${elemSolution.expr}$$</div>
										${steadyStateHtml}
									</div>
								`
							}
						}
						return answer
					})
					.join('')

				return `
				<div class="solution-task">
					<div class="solution-number">Решение задачи ${index + 1}</div>
					<h3 class="section-title">Подробное решение</h3>
					${detailedSolutionHtml}
					${allEquationsHtml}
					${
						requiredAnswersHtml
							? `
						<div class="answers">
							<h3 class="section-title">Требуемые ответы</h3>
							${requiredAnswersHtml}
						</div>
					`
							: ''
					}
				</div>
			`
			})
			.join('')

		return `
			<!DOCTYPE html>
			<html lang="ru">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Задачи по электрическим цепям</title>
				<script>
					window.MathJax = {
						tex: {
							inlineMath: [['$', '$']],
							displayMath: [['$$', '$$']],
							processEscapes: true,
							processEnvironments: true
						},
						svg: {
							fontCache: 'global',
							displayAlign: 'left',
							displayIndent: '0'
						},
						startup: {
							ready: () => {
								MathJax.startup.defaultReady();
								MathJax.startup.promise.then(() => {
									console.log('MathJax готов к работе!');
								});
							}
						}
					};
				</script>
				<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js" id="MathJax-script" async></script>
				<style>${styles}</style>
			</head>
			<body>
				<button class="print-button" onclick="window.print()">Печать</button>
				
				<div class="container">
					<div class="header">
						<h1>Задачи по электрическим цепям</h1>
						<p>Переходные процессы в RLC-цепях</p>
					</div>
					
					<div class="tasks-section">
						${tasksHtml}
					</div>
					
					<div class="page-divider"></div>
					
					<div class="header">
						<h1>Решения задач</h1>
						<p>Подробные решения с пошаговыми вычислениями</p>
					</div>
					
					<div class="solutions-section">
						${solutionsHtml}
					</div>
				</div>
			</body>
			</html>
		`
	},
}
