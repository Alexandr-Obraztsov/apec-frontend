import axios from 'axios'
import { AnyCircuitElement, Node } from '../types'

// Базовый URL API
const API_BASE_URL = 'http://localhost:8000/api'

// Интерфейс для данных схемы
export interface CircuitData {
	nodes: Node[]
	elements: AnyCircuitElement[]
}

// Интерфейс для результата решения
export interface SolutionItem {
	name: string
	value: number | string
	unit: string
	id?: string
}

// Интерфейс для уравнений элемента
export interface ElementEquations {
	'i(t)': string
	'U(t)': string
	[key: string]: string
}

// Интерфейс для результата решения с уравнениями
export interface CircuitSolutionResult {
	[elementName: string]: ElementEquations
}

// Интерфейс для ответа с решением
export interface SolutionResponse {
	status?: string
	result?: CircuitSolutionResult
	solution?: string
	formattedSolution?: SolutionItem[]
}

// Функция для проверки, содержит ли строка только число
const isNumericString = (str: string): boolean => {
	// Регулярное выражение для проверки, что строка содержит только число (целое или десятичное)
	// Допускает отрицательные числа и экспоненциальную запись
	return /^-?\d+(\.\d+)?([eE][-+]?\d+)?$/.test(str)
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
		// Проверяем значение и определяем, нужно ли заключать его в фигурные скобки
		let valueStr: string

		if (typeof element.value === 'number') {
			// Если значение - число, просто преобразуем его в строку
			valueStr = element.value.toString()
		} else {
			// Если значение - строка, проверяем её содержимое
			const stringValue = element.value.toString().trim()

			// Если строка содержит только число, используем её как есть
			// Иначе оборачиваем в фигурные скобки
			valueStr = isNumericString(stringValue) ? stringValue : `{${stringValue}}`
		}

		if (element.type === 'voltage' || element.type === 'current') {
			// Для источников напряжения и тока переворачиваем порядок узлов
			lineValue = `${element.name} ${endNode.name} ${startNode.name} ${valueStr};`
		} else if (element.type === 'switch') {
			lineValue = `${element.name} ${startNode.name} ${endNode.name} ${
				element.isOpen ? 'no 0' : 'nc 0'
			};`
		} else if (element.type === 'wire') {
			lineValue = `W ${startNode.name} ${endNode.name};`
		} else {
			lineValue = `${element.name} ${startNode.name} ${endNode.name} ${valueStr};`
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
