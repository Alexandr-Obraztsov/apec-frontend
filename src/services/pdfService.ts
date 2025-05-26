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
}

export const pdfService = {
	async generateTasksPdf(tasks: Task[]): Promise<Blob> {
		try {
			const tasksData = tasks.map(task => {
				const component_values = Object.entries(task.componentValues).reduce(
					(acc, [key, value]) => {
						acc[key] = value + ' ' + getElementUnit(key)
						return acc
					},
					{} as Record<string, string>
				)
				const solutions = Object.entries(task.requiredParameters).reduce(
					(acc, [key, values]) => {
						if (values.current) {
							acc[key] = { ...acc[key], 'I(t)': task.answer[key]['i(t)'] }
						}
						if (values.voltage) {
							acc[key] = { ...acc[key], 'U(t)': task.answer[key]['U(t)'] }
						}
						return acc
					},
					{} as Record<string, Record<string, string>>
				)
				return {
					image: task.imageUrl,
					component_values,
					conditions: generateConditions(task),
					solutions,
				}
			})
			const response = await axios.post(
				`${API_BASE_URL}/generate_pdf`,
				{ tasks: tasksData },
				{
					responseType: 'blob',
				}
			)

			return new Blob([response.data], { type: 'application/pdf' })
		} catch (error) {
			console.error('Error generating PDF:', error)
			throw error
		}
	},

	downloadPdf(pdfBlob: Blob, filename: string = 'tasks.pdf'): void {
		const url = window.URL.createObjectURL(pdfBlob)
		const link = document.createElement('a')
		link.href = url
		link.setAttribute('download', filename)
		document.body.appendChild(link)
		link.click()
		link.remove()
		window.URL.revokeObjectURL(url)
	},
}
