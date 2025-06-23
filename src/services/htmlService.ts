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
				line-height: 1.5;
			}
			
			.container {
				max-width: 1000px;
				margin: 0 auto;
				padding: 1.5rem;
			}
			
			.header {
				text-align: center;
				margin-bottom: 2rem;
				border-bottom: 3px solid #000000;
				padding-bottom: 1rem;
			}
			
			.header h1 {
				font-size: 2rem;
				margin: 0;
				color: #000000;
				font-weight: bold;
			}
			
			.header p {
				font-size: 1rem;
				margin: 0.5rem 0 0 0;
				color: #333333;
				font-style: italic;
			}
			
			.task, .solution-task {
				background: #ffffff;
				border: 1px solid #000000;
				margin: 1.5rem 0;
				padding: 1.5rem;
				page-break-inside: avoid;
			}
			
			.task-number, .solution-number {
				display: inline-block;
				background: #000000;
				color: #ffffff;
				padding: 0.4rem 1rem;
				font-size: 1.1rem;
				font-weight: bold;
				margin-bottom: 1rem;
			}
			
			.circuit-image {
				text-align: center;
				margin: 1.5rem 0;
				padding: 1rem;
				background: #ffffff;
			}
			
			.circuit-image img {
				max-width: 100%;
				height: auto;
				max-height: 400px;
			}
			
			.section-title {
				font-size: 1.2rem;
				color: #000000;
				margin: 1.5rem 0 0.8rem 0;
				padding-bottom: 0.3rem;
				border-bottom: 1px solid #000000;
				font-weight: bold;
				text-transform: uppercase;
			}
			
			.component-values {
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
				gap: 0.8rem;
				margin: 1rem 0;
			}
			
			.component-item {
				background: #f5f5f5;
				padding: 0.8rem;
				font-weight: 500;
				font-size: 0.9rem;
			}
			
			.conditions {
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
				gap: 0.8rem;
				margin: 1rem 0;
			}
			
			.condition-item {
				background: #f0f0f0;
				padding: 0.8rem;
				font-weight: 500;
				font-size: 0.9rem;
			}
			
			.solution-details {
				margin: 1.5rem 0;
			}
			
			.solution-block {
				background: #fafafa;
				border: 1px solid #000000;
				padding: 1rem;
				margin: 0.8rem 0;
			}
			
			.solution-block h4 {
				margin: 0 0 0.8rem 0;
				color: #000000;
				font-size: 1rem;
				font-weight: bold;
				padding-bottom: 0.3rem;
				border-bottom: 1px solid #000000;
				text-transform: uppercase;
			}
			
			.poly-block {
				background: #f8f8f8;
			}
			
			.roots-block {
				background: #f5f5f5;
			}
			
			.initial-values-block {
				background: #f2f2f2;
			}
			
			.coefficients-block {
				background: #f0f0f0;
			}
			
			.solution-block ul {
				list-style: none;
				padding: 0;
				margin: 0;
			}
			
			.solution-block li {
				background: #ffffff;
				margin: 0.4rem 0;
				padding: 0.6rem;
				font-family: 'Courier New', monospace;
				font-size: 0.9rem;
			}
			
			.answers {
				margin: 1.5rem 0;
			}
			
			.answer-item {
				background: #ffffff;
				border: 1px solid #000000;
				padding: 1rem;
				margin: 0.8rem 0;
			}
			
			.answer-item strong {
				color: #000000;
				font-size: 1rem;
				display: block;
				margin-bottom: 0.5rem;
			}
			
			.steady-state {
				display: inline-block;
				background: #e0e0e0;
				color: #000000;
				padding: 0.2rem 0.6rem;
				font-size: 0.85rem;
				margin-top: 0.4rem;
				font-style: italic;
			}
			
			.print-button {
				position: fixed;
				top: 1.5rem;
				right: 1.5rem;
				background: #000000;
				color: #ffffff;
				border: 2px solid #000000;
				padding: 0.8rem 1.5rem;
				cursor: pointer;
				font-size: 0.9rem;
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
				margin: 3rem 0;
				page-break-before: always;
			}
			
			.equation-display {
				background: #ffffff;
				padding: 0.8rem;
				margin: 0.4rem 0;
				border: 1px solid #cccccc;
				font-family: 'Courier New', monospace;
				font-size: 0.9rem;
			}
			
			.element-solution {
				display: flex;
				flex-direction: column;
				gap: 0.8rem;
			}
			
			.solution-step {
				font-size: 0.95rem;
				line-height: 1.4;
			}
			
			.solution-step ul {
				margin: 0.5rem 0 0 1rem;
				padding: 0;
			}
			
			.solution-step li {
				margin: 0.3rem 0;
				font-family: 'Courier New', monospace;
			}

			@media print {
				body { 
					background: white !important;
					font-size: 10pt;
					line-height: 1.3;
				}
				.print-button { display: none; }
				.container { max-width: 100%; padding: 1rem; }
				.task, .solution-task {
					border: 1px solid #000000;
					page-break-inside: avoid;
					margin: 0.8rem 0;
					padding: 1rem;
				}
				.header { margin-bottom: 1.5rem; }
				.header h1 { font-size: 1.6rem; }
				.circuit-image { 
					background: #ffffff; 
					padding: 0.5rem; 
				}
				.circuit-image img {
					max-height: 350px;
				}
				.page-divider { 
					page-break-before: always; 
					height: 1px; 
					background: #000000; 
					margin: 1.5rem 0;
				}
				.solution-block, .answer-item, .component-item, .condition-item {
					background: #ffffff !important;
					padding: 0.6rem;
				}
				.section-title { font-size: 1rem; margin: 1rem 0 0.5rem 0; }
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
					const { poly, roots, initial_values, elements } =
						task.detailedSolution

					const rootsHtml = roots
						.map((root, i) => `<li>$$p_{${i + 1}} = ${root}$$</li>`)
						.join('')
					const initialValuesHtml = Object.entries(initial_values)
						.map(([key, value]) => `<li>$$${key} = ${value}$$</li>`)
						.join('')

					// Собираем все коэффициенты A из всех элементов
					let allCoefficientsHtml = ''
					const allCoefficients: Array<{
						element: string
						type: string
						value: number
					}> = []

					Object.entries(elements).forEach(([elementName, elemSolution]) => {
						elemSolution.coefficients.forEach(coeff => {
							if (coeff.type === 'A') {
								allCoefficients.push({
									element: elementName,
									type: coeff.type,
									value: coeff.value,
								})
							}
						})
					})

					if (allCoefficients.length > 0) {
						const coefficientsListHtml = allCoefficients
							.map(
								(coeff, i) =>
									`<li>$$A_{${i + 1}} \\text{ (для ${coeff.element})} = ${
										coeff.value
									}$$</li>`
							)
							.join('')

						allCoefficientsHtml = `
							<div class="solution-block coefficients-block">
								<h4>Коэффициенты A</h4>
								<ul>${coefficientsListHtml}</ul>
							</div>
						`
					}

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
						${allCoefficientsHtml}
					</div>
				`
				}

				// Получаем промежуточные результаты (как в TaskModal)
				let intermediateResultsHtml = ''
				if (task.detailedSolution?.elements) {
					const intermediateElements = Object.entries(
						task.detailedSolution.elements
					)
						.filter(([element]) => {
							// Фильтруем элементы по флагу show_in_conditions (как в TaskModal)
							const params = task.requiredParameters?.[element]
							const isReactive =
								element.startsWith('L') || element.startsWith('C')
							return params?.show_in_conditions === true || isReactive
						})
						.sort((a, b) => {
							const isReactiveA = a[0].startsWith('L') || a[0].startsWith('C')
							const isReactiveB = b[0].startsWith('L') || b[0].startsWith('C')
							return isReactiveA ? 1 : isReactiveB ? -1 : 0
						})
						.map(([elementName, elemSolution]) => {
							const isReactive =
								elementName.startsWith('L') || elementName.startsWith('C')
							const isResistor = elementName.startsWith('R')

							let content = ''

							if (isReactive) {
								// Для L и C: установившееся → начальное → коэффициенты → уравнение
								const initialValue =
									task.detailedSolution.initial_values[elementName]
								const coefficientsHtml =
									elemSolution.coefficients.length > 0
										? elemSolution.coefficients
												.map(
													(coeff, idx) =>
														`<li>$$${coeff.type}_{${idx + 1}} = ${
															coeff.value
														} \\text{ ${
															coeff.type === 'A'
																? elemSolution.type === 'i'
																	? 'А'
																	: 'В'
																: 'рад'
														}}$$</li>`
												)
												.join('')
										: ''

								content = `
									<div class="element-solution">
										<div class="solution-step">1. Установившееся значение: $$${
											elemSolution.steady_state
										} \\text{ ${elemSolution.type === 'i' ? 'А' : 'В'}}$$</div>
										<div class="solution-step">2. Начальное значение: $$${initialValue} \\text{ ${
									elementName.startsWith('L') ? 'А' : 'В'
								}}$$</div>
										${
											coefficientsHtml
												? `<div class="solution-step">3. Коэффициенты:<ul>${coefficientsHtml}</ul></div>`
												: ''
										}
										<div class="solution-step">4. ${
											elemSolution.type === 'i' ? 'i(t)' : 'V(t)'
										} = <div class="equation-display">$$${
									elemSolution.expr
								}$$</div></div>
									</div>
								`
							} else if (isResistor) {
								// Для резисторов: уравнение → значение в момент времени
								const atTimeHtml =
									elemSolution.at_time !== undefined &&
									elemSolution.value_at_time !== undefined
										? `<div class="solution-step">2. Значение в момент t = ${
												elemSolution.at_time
										  } с: $$${elemSolution.value_at_time} \\text{ ${
												elemSolution.type === 'i' ? 'А' : 'В'
										  }}$$</div>`
										: ''

								content = `
									<div class="element-solution">
										<div class="solution-step">1. ${
											elemSolution.type === 'i' ? 'i(t)' : 'V(t)'
										} = <div class="equation-display">$$${
									elemSolution.expr
								}$$</div></div>
										${atTimeHtml}
									</div>
								`
							}

							return `
								<div class="answer-item">
									<strong>${elementName}:</strong>
									${content}
								</div>
							`
						})
						.join('')

					if (intermediateElements) {
						intermediateResultsHtml = `
							<div class="answers">
								<h3 class="section-title">Промежуточные результаты</h3>
								${intermediateElements}
							</div>
						`
					}
				}

				// Отображаем только требуемые финальные ответы
				const finalAnswersHtml = Object.entries(task.requiredParameters)
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
					${intermediateResultsHtml}
					${
						finalAnswersHtml
							? `
						<div class="answers">
							<h3 class="section-title">Требуемые ответы</h3>
							${finalAnswersHtml}
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
