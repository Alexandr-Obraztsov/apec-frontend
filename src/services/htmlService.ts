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
				font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
				margin: 0; 
				padding: 0;
				background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
				min-height: 100vh;
				color: #333;
				line-height: 1.6;
			}
			
			.container {
				max-width: 1200px;
				margin: 0 auto;
				padding: 2rem;
			}
			
			.header {
				text-align: center;
				margin-bottom: 3rem;
				color: white;
			}
			
			.header h1 {
				font-size: 3rem;
				margin: 0;
				text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
				font-weight: 300;
			}
			
			.header p {
				font-size: 1.2rem;
				margin: 1rem 0 0 0;
				opacity: 0.9;
			}
			
			.task, .solution-task {
				background: white;
				border-radius: 20px;
				margin: 2rem 0;
				padding: 2.5rem;
				box-shadow: 0 20px 40px rgba(0,0,0,0.1);
				transition: transform 0.3s ease, box-shadow 0.3s ease;
				position: relative;
				overflow: hidden;
			}
			
			.task::before, .solution-task::before {
				content: '';
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				height: 5px;
				background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c);
			}
			
			.task:hover, .solution-task:hover {
				transform: translateY(-5px);
				box-shadow: 0 30px 60px rgba(0,0,0,0.15);
			}
			
			.task-number, .solution-number {
				display: inline-block;
				background: linear-gradient(135deg, #667eea, #764ba2);
				color: white;
				padding: 0.5rem 1.5rem;
				border-radius: 50px;
				font-size: 1.1rem;
				font-weight: 600;
				margin-bottom: 1.5rem;
				box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
			}
			
			.circuit-image {
				text-align: center;
				margin: 2rem 0;
				padding: 1.5rem;
				background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
				border-radius: 15px;
				box-shadow: inset 0 2px 10px rgba(0,0,0,0.1);
			}
			
			.circuit-image img {
				max-width: 100%;
				height: auto;
				max-height: 300px;
				border-radius: 10px;
				box-shadow: 0 10px 30px rgba(0,0,0,0.2);
			}
			
			.section-title {
				font-size: 1.4rem;
				color: #2c3e50;
				margin: 2rem 0 1rem 0;
				padding-bottom: 0.5rem;
				border-bottom: 3px solid transparent;
				background: linear-gradient(90deg, #667eea, #764ba2) padding-box,
							linear-gradient(90deg, #667eea, #764ba2) border-box;
				border-image: linear-gradient(90deg, #667eea, #764ba2) 1;
				border-bottom: 3px solid;
				display: inline-block;
				font-weight: 600;
			}
			
			.component-values {
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
				gap: 1rem;
				margin: 1.5rem 0;
			}
			
			.component-item {
				background: linear-gradient(135deg, #e3f2fd, #bbdefb);
				padding: 1rem;
				border-radius: 12px;
				border-left: 4px solid #2196f3;
				font-weight: 500;
				transition: all 0.3s ease;
				box-shadow: 0 2px 10px rgba(33, 150, 243, 0.1);
			}
			
			.component-item:hover {
				transform: translateY(-2px);
				box-shadow: 0 5px 20px rgba(33, 150, 243, 0.2);
			}
			
			.conditions {
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
				gap: 1rem;
				margin: 1.5rem 0;
			}
			
			.condition-item {
				background: linear-gradient(135deg, #fff3e0, #ffe0b2);
				padding: 1rem;
				border-radius: 12px;
				border-left: 4px solid #ff9800;
				font-weight: 500;
				transition: all 0.3s ease;
				box-shadow: 0 2px 10px rgba(255, 152, 0, 0.1);
			}
			
			.condition-item:hover {
				transform: translateY(-2px);
				box-shadow: 0 5px 20px rgba(255, 152, 0, 0.2);
			}
			
			.solution-details {
				margin: 2rem 0;
			}
			
			.solution-block {
				background: linear-gradient(135deg, #f8f9fa, #e9ecef);
				border: 1px solid #dee2e6;
				border-radius: 15px;
				padding: 1.5rem;
				margin: 1rem 0;
				box-shadow: 0 5px 15px rgba(0,0,0,0.05);
				transition: all 0.3s ease;
			}
			
			.solution-block:hover {
				transform: translateY(-2px);
				box-shadow: 0 10px 25px rgba(0,0,0,0.1);
			}
			
			.solution-block h4 {
				margin: 0 0 1rem 0;
				color: #495057;
				font-size: 1.1rem;
				font-weight: 600;
				padding-bottom: 0.5rem;
				border-bottom: 2px solid #e9ecef;
			}
			
			.poly-block {
				background: linear-gradient(135deg, #e8f5e8, #c8e6c9);
				border-left: 4px solid #4caf50;
			}
			
			.roots-block {
				background: linear-gradient(135deg, #fff8e1, #ffecb3);
				border-left: 4px solid #ffc107;
			}
			
			.initial-values-block {
				background: linear-gradient(135deg, #fce4ec, #f8bbd9);
				border-left: 4px solid #e91e63;
			}
			
			.solution-block ul {
				list-style: none;
				padding: 0;
				margin: 0;
			}
			
			.solution-block li {
				background: rgba(255,255,255,0.7);
				margin: 0.5rem 0;
				padding: 0.8rem;
				border-radius: 8px;
				border-left: 3px solid currentColor;
				font-family: 'Consolas', 'Monaco', monospace;
			}
			
			.answers {
				margin: 2rem 0;
			}
			
			.answer-item {
				background: linear-gradient(135deg, #e8f5e8, #c8e6c9);
				border: 1px solid #4caf50;
				border-radius: 15px;
				padding: 1.5rem;
				margin: 1rem 0;
				box-shadow: 0 5px 15px rgba(76, 175, 80, 0.1);
				transition: all 0.3s ease;
			}
			
			.answer-item:hover {
				transform: translateY(-2px);
				box-shadow: 0 10px 25px rgba(76, 175, 80, 0.2);
			}
			
			.answer-item strong {
				color: #2e7d32;
				font-size: 1.1rem;
			}
			
			.steady-state {
				display: inline-block;
				background: rgba(76, 175, 80, 0.1);
				color: #2e7d32;
				padding: 0.3rem 0.8rem;
				border-radius: 20px;
				font-size: 0.9rem;
				margin-left: 1rem;
				border: 1px solid rgba(76, 175, 80, 0.3);
			}
			
			.print-button {
				position: fixed;
				top: 2rem;
				right: 2rem;
				background: linear-gradient(135deg, #667eea, #764ba2);
				color: white;
				border: none;
				padding: 1rem 2rem;
				border-radius: 50px;
				cursor: pointer;
				font-size: 1rem;
				font-weight: 600;
				box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
				transition: all 0.3s ease;
				z-index: 1000;
			}
			
			.print-button:hover {
				transform: translateY(-3px);
				box-shadow: 0 15px 40px rgba(102, 126, 234, 0.6);
			}
			
			.page-divider {
				height: 3px;
				background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c);
				margin: 4rem 0;
				border-radius: 2px;
			}
			
			.equation-display {
				background: rgba(255,255,255,0.9);
				padding: 1rem;
				border-radius: 10px;
				margin: 0.5rem 0;
				border-left: 4px solid #2196f3;
				font-family: 'Consolas', 'Monaco', monospace;
				box-shadow: 0 2px 10px rgba(0,0,0,0.05);
			}

			@media print {
				body { 
					background: white !important;
					font-size: 10pt;
					line-height: 1.4;
				}
				.print-button { display: none; }
				.container { max-width: 100%; padding: 1rem; }
				.task, .solution-task {
					box-shadow: 0 0 0 1px #ddd;
					page-break-inside: avoid;
					margin: 1rem 0;
					padding: 1.5rem;
				}
				.task::before, .solution-task::before { display: none; }
				.header { color: #333 !important; margin-bottom: 2rem; }
				.header h1 { font-size: 2rem; text-shadow: none; }
				.circuit-image { background: #f5f5f5; }
				.page-divider { page-break-before: always; height: 1px; background: #ddd; }
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
						.map((root, i) => `<li>$p_{${i + 1}} = ${root}$</li>`)
						.join('')
					const initialValuesHtml = Object.entries(initial_values)
						.map(([key, value]) => `<li>$${key} = ${value}$</li>`)
						.join('')

					detailedSolutionHtml = `
					<div class="solution-details">
						<div class="solution-block poly-block">
							<h4>📐 Характеристический многочлен</h4>
							<div class="equation-display">$$${poly}$$</div>
						</div>
						<div class="solution-block roots-block">
							<h4>🔢 Корни характеристического уравнения</h4>
							<ul>${rootsHtml}</ul>
						</div>
						<div class="solution-block initial-values-block">
							<h4>⚡ Начальные условия</h4>
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
									<strong>🔋 ${typeLabel} ${symbol} для элемента ${elementName}:</strong>
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
										<strong>⚡ Ток i(t) для элемента ${elementName}:</strong>
										<div class="equation-display">$$${elemSolution.expr}$$</div>
										${steadyStateHtml}
									</div>
								`
							}
							if (params.voltage && elemSolution.type === 'v') {
								answer += `
									<div class="answer-item">
										<strong>🔌 Напряжение V(t) для элемента ${elementName}:</strong>
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
				<button class="print-button" onclick="window.print()">🖨️ Печать</button>
				
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
