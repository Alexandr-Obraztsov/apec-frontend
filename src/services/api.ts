import axios from 'axios'
import { AnyCircuitElement, Node } from '../types'

// Базовый URL API
const API_BASE_URL = 'http://localhost:8000/api'

// Интерфейс для данных схемы
export interface CircuitData {
	nodes: Node[]
	elements: any[]
}

// Интерфейс для результата решения
export interface SolutionItem {
	name: string
	value: number | string
	unit: string
	id?: string
}

// Интерфейс для ответа с решением
export interface SolutionResponse {
	solution: string
	formattedSolution?: SolutionItem[]
}

// Функция для преобразования элементов схемы в текстовый формат
export const formatCircuitToString = (
	nodes: Node[],
	elements: AnyCircuitElement[]
): string => {
	// Результирующая строка
	const circuitLines: string[] = []

	// Перебираем элементы
	elements.forEach(element => {
		// Получаем начальный и конечный узлы
		const startNode = nodes.find(n => n.id === element.startNodeId)
		const endNode = nodes.find(n => n.id === element.endNodeId)

		if (!startNode || !endNode) return

		let lineValue: string
		if (element.type === 'switch') {
			lineValue = `${element.name} ${startNode.name} ${endNode.name} ${
				element.isOpen ? 'no 0' : 'nc 0'
			};`
		} else if (element.type === 'wire') {
			lineValue = `${element.name} ${startNode.name} ${endNode.name};`
		} else {
			lineValue = `${element.name} ${startNode.name} ${endNode.name} ${element.value};`
		}

		circuitLines.push(lineValue)
	})

	return circuitLines.join('\n')
}

// Сервис для работы с API
export const circuitApi = {
	// Метод для решения схемы
	solveCircuit: async (circuitData: CircuitData): Promise<SolutionResponse> => {
		try {
			// Форматируем данные схемы в нужный формат
			const circuitString = formatCircuitToString(
				circuitData.nodes,
				circuitData.elements
			)

			console.log('Отправляемые данные схемы:', circuitString)

			// Отправляем POST запрос с требуемой структурой
			const response = await axios.post<SolutionResponse>(
				`${API_BASE_URL}/process`,
				{
					circuit: circuitString,
				}
			)

			// Добавляем форматированные данные к ответу
			return {
				...response.data,
			}
		} catch (error) {
			console.error('Ошибка при запросе к API:', error)
			throw error
		}
	},
}

export default circuitApi
