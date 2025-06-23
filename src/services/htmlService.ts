import axios from 'axios'
import { API_BASE_URL } from './api'
import { Task } from '../store/tasksStore'
import { generateConditions } from '../utils/generateConditions'
import { getElementUnit } from '../utils/getElementUnit'

export interface TaskData {
	image: string
	conditions: string[]
	component_values: Record<string, string>
	detailed_solution: Task['detailedSolution']
	required_parameters: Task['requiredParameters']
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

				return {
					image: task.imageUrl,
					component_values,
					conditions: generateConditions(task) || [],
					detailed_solution: task.detailedSolution,
					required_parameters: task.requiredParameters,
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
				line-height: 1.4;
			}
			
			.container {
				max-width: 1000px;
				margin: 0 auto;
				padding: 1rem;
			}
			
			.header {
				text-align: center;
				margin-bottom: 1.5rem;
				border-bottom: 2px solid #000000;
				padding-bottom: 0.5rem;
			}
			
			.header h1 {
				font-size: 1.8rem;
				margin: 0;
				color: #000000;
				font-weight: bold;
			}
			
			.header p {
				font-size: 0.9rem;
				margin: 0.3rem 0 0 0;
				color: #333333;
				font-style: italic;
			}
			
			.task, .solution-task {
				background: #ffffff;
				border: 1px solid #000000;
				margin: 1rem 0;
				padding: 1rem;
				page-break-inside: avoid;
			}
			
			.task-number, .solution-number {
				display: inline-block;
				background: #000000;
				color: #ffffff;
				padding: 0.3rem 0.8rem;
				font-size: 1rem;
				font-weight: bold;
				margin-bottom: 0.8rem;
			}
			
			.circuit-image {
				text-align: center;
				margin: 1rem 0;
				padding: 0.5rem;
				background: #ffffff;
			}
			
			.circuit-image img {
				max-width: 100%;
				height: auto;
				max-height: 400px;
			}
			
			.section-title {
				font-size: 1rem;
				color: #000000;
				margin: 1rem 0 0.5rem 0;
				padding-bottom: 0.2rem;
				border-bottom: 1px solid #000000;
				font-weight: bold;
				text-transform: uppercase;
			}
			
			.component-values {
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
				gap: 0.5rem;
				margin: 0.8rem 0;
			}
			
			.component-item {
				background: #f5f5f5;
				padding: 0.5rem;
				font-weight: 500;
				font-size: 0.85rem;
				text-align: center;
			}
			
			.conditions {
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
				gap: 0.5rem;
				margin: 0.8rem 0;
			}
			
			.condition-item {
				background: #f0f0f0;
				padding: 0.5rem;
				font-weight: 500;
				font-size: 0.85rem;
				text-align: center;
			}
			
			.solution-table {
				width: 100%;
				border-collapse: collapse;
				margin: 0.8rem 0;
				font-size: 0.9rem;
			}
			
			.solution-table th {
				background: #f0f0f0;
				border: 1px solid #000000;
				padding: 0.5rem;
				text-align: left;
				font-weight: bold;
			}
			
			.solution-table td {
				border: 1px solid #000000;
				padding: 0.5rem;
				vertical-align: top;
			}
			
			.equation-cell {
				font-family: 'Courier New', monospace;
				font-size: 0.85rem;
			}
			
			.elements-table {
				width: 100%;
				border-collapse: collapse;
				margin: 0.8rem 0;
				font-size: 0.85rem;
			}
			
			.elements-table th {
				background: #f8f8f8;
				border: 1px solid #000000;
				padding: 0.4rem;
				text-align: center;
				font-weight: bold;
			}
			
			.elements-table td {
				border: 1px solid #000000;
				padding: 0.4rem;
				text-align: center;
			}
			
			.elements-table .equation-col {
				text-align: left;
				font-family: 'Courier New', monospace;
				font-size: 0.8rem;
			}
			
			.results-table {
				width: 100%;
				border-collapse: collapse;
				margin: 0.5rem 0;
				font-size: 0.85rem;
			}
			
			.results-table th {
				background: #e0e0e0;
				border: 1px solid #000000;
				padding: 0.4rem;
				text-align: center;
				font-weight: bold;
			}
			
			.results-table td {
				border: 1px solid #000000;
				padding: 0.4rem;
				text-align: center;
			}
			
			.print-button {
				position: fixed;
				top: 1rem;
				right: 1rem;
				background: #000000;
				color: #ffffff;
				border: 2px solid #000000;
				padding: 0.5rem 1rem;
				cursor: pointer;
				font-size: 0.8rem;
				font-weight: bold;
				z-index: 1000;
			}
			
			.print-button:hover {
				background: #ffffff;
				color: #000000;
			}
			
			.page-divider {
				height: 2px;
				background: #000000;
				margin: 2rem 0;
				page-break-before: always;
			}

			@media print {
				body { 
					background: white !important;
					font-size: 9pt;
					line-height: 1.2;
				}
				.print-button { display: none; }
				.container { max-width: 100%; padding: 0.5rem; }
				.task, .solution-task {
					border: 1px solid #000000;
					page-break-inside: avoid;
					margin: 0.5rem 0;
					padding: 0.8rem;
				}
				.header { margin-bottom: 1rem; }
				.header h1 { font-size: 1.4rem; }
				.circuit-image { padding: 0.3rem; }
				.circuit-image img { max-height: 300px; }
				.page-divider { 
					page-break-before: always; 
					height: 1px; 
					background: #000000; 
					margin: 1rem 0;
				}
				.section-title { font-size: 0.9rem; margin: 0.8rem 0 0.3rem 0; }
				.solution-table, .results-table, .elements-table { font-size: 8pt; }
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
				let solutionHtml = ''
				if (task.detailedSolution) {
					const { poly, roots, initial_values } = task.detailedSolution

					// Основные результаты расчета без коэффициентов
					const rootsRows = roots
						.map(
							(root, i) =>
								`<tr><td>$$p_{${
									i + 1
								}}$$</td><td class="equation-cell">$$${root}$$</td></tr>`
						)
						.join('')

					const initialRows = Object.entries(initial_values)
						.map(
							([key, value]) =>
								`<tr><td>$$${key}_0$$</td><td class="equation-cell">$$${value}$$</td></tr>`
						)
						.join('')

					solutionHtml = `
						<table class="solution-table">
							<tr><th>Характеристический многочлен</th><td class="equation-cell">$$${poly}$$</td></tr>
							${rootsRows}
							${initialRows}
						</table>
					`
				}

				// Промежуточные результаты: уравнения для L, C и резисторов
				let elementsHtml = ''
				if (task.detailedSolution?.elements) {
					const elementsToShow = Object.entries(task.detailedSolution.elements)
						.filter(([elementName]) => {
							// Показываем L, C и резисторы (R)
							return (
								elementName.startsWith('L') ||
								elementName.startsWith('C') ||
								elementName.startsWith('R')
							)
						})
						.sort((a, b) => {
							// Сортировка: L, C, потом R
							const getOrder = (name: string) => {
								if (name.startsWith('L')) return 1
								if (name.startsWith('C')) return 2
								if (name.startsWith('R')) return 3
								return 4
							}
							return getOrder(a[0]) - getOrder(b[0])
						})

					if (elementsToShow.length > 0) {
						const elementsRows = elementsToShow
							.map(([elementName, elemSolution]) => {
								const paramType =
									elemSolution.type === 'i' ? 'Ток' : 'Напряжение'
								return `
									<tr>
										<td><strong>${elementName}</strong></td>
										<td>${paramType}</td>
										<td class="equation-col">$$${elemSolution.expr}$$</td>
									</tr>
								`
							})
							.join('')

						elementsHtml = `
							<h3 class="section-title">Уравнения элементов</h3>
							<table class="elements-table">
								<tr>
									<th>Элемент</th>
									<th>Параметр</th>
									<th>Уравнение</th>
								</tr>
								${elementsRows}
							</table>
						`
					}
				}

				// Только требуемые окончательные ответы
				const requiredAnswers: Array<{
					element: string
					type: string
					expr: string
					value?: string
				}> = []

				Object.entries(task.requiredParameters).forEach(
					([elementName, params]) => {
						// Проверяем флаг show_in_conditions - показываем только те элементы, где он true
						if (
							params.show_in_conditions &&
							task.detailedSolution?.elements[elementName]
						) {
							const elemSolution = task.detailedSolution.elements[elementName]

							if (params.current && elemSolution.type === 'i') {
								if (
									params.at_time !== undefined &&
									elemSolution.value_at_time !== undefined
								) {
									// Если нужно значение в момент времени
									requiredAnswers.push({
										element: elementName,
										type: `Ток i(${params.at_time})`,
										expr: `${elemSolution.value_at_time}`,
										value: `А при t = ${params.at_time} с`,
									})
								} else {
									// Если нужна функция
									requiredAnswers.push({
										element: elementName,
										type: 'Ток i(t)',
										expr: elemSolution.expr,
										value: 'А',
									})
								}
							}

							if (params.voltage && elemSolution.type === 'v') {
								if (
									params.at_time !== undefined &&
									elemSolution.value_at_time !== undefined
								) {
									// Если нужно значение в момент времени
									requiredAnswers.push({
										element: elementName,
										type: `Напряжение V(${params.at_time})`,
										expr: `${elemSolution.value_at_time}`,
										value: `В при t = ${params.at_time} с`,
									})
								} else {
									// Если нужна функция
									requiredAnswers.push({
										element: elementName,
										type: 'Напряжение V(t)',
										expr: elemSolution.expr,
										value: 'В',
									})
								}
							}
						}
					}
				)

				const answersRows = requiredAnswers
					.map(
						answer => `
						<tr>
							<td><strong>${answer.element}</strong></td>
							<td>${answer.type}</td>
							<td class="equation-cell">$$${answer.expr}$$</td>
							<td>${answer.value}</td>
						</tr>
					`
					)
					.join('')

				const answersTable =
					requiredAnswers.length > 0
						? `
					<h3 class="section-title">Окончательные ответы</h3>
					<table class="results-table">
						<tr>
							<th>Элемент</th>
							<th>Что найти</th>
							<th>Результат</th>
							<th>Единицы</th>
						</tr>
						${answersRows}
					</table>
				`
						: ''

				return `
				<div class="solution-task">
					<div class="solution-number">Решение задачи ${index + 1}</div>
					<h3 class="section-title">Основные расчеты</h3>
					${solutionHtml}
					${elementsHtml}
					${answersTable}
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
