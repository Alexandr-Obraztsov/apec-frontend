import axios from 'axios'
import {
	AnyCircuitElement,
	Direction,
	LCapyCircuit,
	LCapyElement,
	Node,
	SavedCircuit,
} from '../types'

// Базовый URL API
export const API_BASE_URL = 'http://localhost:8000/api'

// Интерфейсы для работы с базой данных топологий и схем
export interface Topology {
	id: number
	image_base64: string
	created_at: string
	updated_at?: string
}

export interface Circuit {
	id: number
	topology_id: number
	circuit_string: string
	order: number
	created_at: string
	updated_at?: string
}

export interface TopologyListResponse {
	topologies: Topology[]
	total: number
	page: number
	per_page: number
}

export interface CircuitListResponse {
	circuits: Circuit[]
	total: number
	page: number
	per_page: number
}

// Интерфейсы для создания топологий и схем
export interface CreateTopologyRequest {
	image_base64: string
}

export interface CreateTopologyResponse {
	id: number
	image_base64: string
	created_at: string
}

export interface CreateCircuitRequest {
	topology_id: number
	circuit_string: string
	order: number
}

export interface CreateCircuitResponse {
	id: number
	topology_id: number
	circuit_string: string
	order: number
	created_at: string
}

// Интерфейсы для генерации изображений
export interface GenerateImageRequest {
	circuit_string: string
}

export interface GenerateImageResponse {
	image_base64: string
}

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
	'V(t)': string
	[key: string]: string
}

// Интерфейс для результата решения с уравнениями
export interface CircuitSolutionResult {
	[elementName: string]: ElementEquations
}

// Интерфейс для ответа с решением
export interface SolutionResponse {
	status?: string
	solution?: CircuitSolutionResult
	lcapyCircuit?: LCapyCircuit
}

export enum RootType {
	COMPLEX = '<',
	DIFFERENT = '>',
}

// Новое перечисление для уровня сложности
export enum DifficultyLevel {
	BASIC = 'basic', // Поиск токов на индуктивностях и напряжений на катушках
	ADVANCED = 'advanced', // Поиск токов и напряжений на резисторах в определенный момент времени
}

// Интерфейс для запроса генерации цепи
export interface GenerateCircuitRequest {
	rootType?: RootType
	order: number
	difficulty?: DifficultyLevel // Добавляем параметр сложности
	resistors_count?: number // Количество резисторов для исследования (только для advanced)
	topology_id?: number // ID конкретной топологии (опционально)
	circuit_string?: string // Строка схемы (для использования конкретной схемы)
}

// Интерфейс для запроса генерации PDF с множественными цепями
export interface GenerateCircuitsPdfRequest {
	count: number
	order: number
	rootType?: RootType
}

// Интерфейс для ответа с генерацией цепи
export interface GenerateCircuitResponse {
	status?: string
	circuit?: string
	message?: string
}

// Интерфейс для параметров элемента с временными условиями
export interface ElementParameters {
	current: boolean
	voltage: boolean
	at_time?: number
	description?: string
	show_in_conditions?: boolean
}

// Интерфейс для ответа с генерацией задачи
export interface GenerateTaskResponse {
	circuit: string
	image: string
	componentValues: Record<string, number>
	detailedSolution: {
		roots: string[]
		poly: string
		initial_values: Record<string, number>
		elements: Record<
			string,
			{
				type: 'i' | 'v'
				expr: string
				steady_state: number
				coefficients: Array<{
					type: 'phi' | 'A'
					value: number
				}>
				at_time?: number
				value_at_time?: number
			}
		>
	} | null
	requiredParameters: Record<string, ElementParameters>
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

		if (element.type === 'switch') {
			lineValue = `${element.name} ${startNode.name} ${endNode.name} ${
				element.isOpen ? 'no' : 'nc'
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

// Функция для преобразования цепи в формат LCapy с учетом направлений
export const formatCircuitToLCapy = (
	nodes: Node[],
	elements: AnyCircuitElement[],
	with_values: boolean = true
): LCapyCircuit => {
	const lcapyElements: LCapyElement[] = []
	const nodeNames = nodes.map(node => node.name)

	// Преобразуем каждый элемент
	elements.forEach(element => {
		const startNode = nodes.find(n => n.id === element.startNodeId)
		const endNode = nodes.find(n => n.id === element.endNodeId)

		if (!startNode || !endNode) return

		// Определяем направление элемента на основе позиций узлов
		let direction: Direction
		const dx = endNode.position.x - startNode.position.x
		const dy = endNode.position.y - startNode.position.y

		// Определяем основное направление
		if (Math.abs(dx) > Math.abs(dy)) {
			direction = dx > 0 ? 'right' : 'left'
		} else {
			direction = dy > 0 ? 'down' : 'up'
		}

		// Если элемент имеет свойство direction, используем его
		if ('direction' in element) {
			direction = element.direction as Direction
		}

		const lcapyElement: LCapyElement = {
			name: element.name,
			type: element.type,
			startNode: startNode.name,
			endNode: endNode.name,
			value: element.value,
			direction: direction,
		}

		// Добавляем специальные свойства для определенных типов элементов
		if (element.type === 'switch') {
			lcapyElement.isOpen = element.isOpen
		}

		lcapyElements.push(lcapyElement)
	})

	// Создаем строковое представление для LCapy
	const circuitString = formatLCapyElementsToString(lcapyElements, with_values)

	// Анализируем топологию цепи
	const topology = analyzeCircuitTopology(lcapyElements, nodeNames)

	return {
		elements: lcapyElements,
		nodes: nodeNames,
		circuitString,
		topology,
	}
}

// Функция для преобразования LCapy элементов в строковое представление
const formatLCapyElementsToString = (
	elements: LCapyElement[],
	with_values: boolean = true
): string => {
	const circuitLines: string[] = []

	elements.forEach(element => {
		let valueStr: string

		if (typeof element.value === 'number') {
			valueStr = element.value.toString()
		} else {
			const stringValue = element.value.toString().trim()
			valueStr = isNumericString(stringValue) ? stringValue : `{${stringValue}}`
		}

		let line: string

		if (element.type === 'switch') {
			line = `${element.name} ${element.startNode} ${element.endNode} ${
				element.isOpen ? 'no' : 'nc'
			}; ${element.direction}`
		} else if (element.type === 'wire') {
			line = `W ${element.startNode} ${element.endNode}; ${element.direction}`
		} else {
			line = `${element.name} ${element.startNode} ${element.endNode} ${
				with_values ? valueStr : ''
			}; ${element.direction}`
		}

		circuitLines.push(line)
	})

	return circuitLines.join('\n')
}

// Функция для анализа топологии цепи
const analyzeCircuitTopology = (elements: LCapyElement[], nodes: string[]) => {
	// Создаем граф соединений
	const connections: Map<string, string[]> = new Map()

	// Инициализируем все узлы
	nodes.forEach(node => {
		connections.set(node, [])
	})

	// Добавляем соединения
	elements.forEach(element => {
		const startConnections = connections.get(element.startNode) || []
		const endConnections = connections.get(element.endNode) || []

		startConnections.push(element.endNode)
		endConnections.push(element.startNode)

		connections.set(element.startNode, startConnections)
		connections.set(element.endNode, endConnections)
	})

	// Простой алгоритм для поиска петель (можно улучшить)
	const loops: string[][] = []
	const branches: string[][] = []

	// Добавляем ветви
	elements.forEach(element => {
		branches.push([element.startNode, element.endNode])
	})

	// TODO: Реализовать более сложный алгоритм поиска петель
	// Пока возвращаем простую структуру

	return {
		loops,
		branches,
	}
}

// Функция для создания сохраненной цепи
export const createSavedCircuit = (
	name: string,
	nodes: Node[],
	elements: AnyCircuitElement[],
	description?: string
): SavedCircuit => {
	const now = new Date().toISOString()

	return {
		id: `circuit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
		name,
		description,
		createdAt: now,
		updatedAt: now,
		circuit: {
			nodes: [...nodes], // создаем копии
			elements: [...elements],
		},
		metadata: {
			canvasSize: { width: 1200, height: 800 }, // можно получать из компонента
			viewBox: { x: 0, y: 0, width: 1200, height: 800 },
			version: '1.0.0',
		},
	}
}

// Функция для восстановления цепи из сохраненного формата
export const restoreCircuitFromSaved = (savedCircuit: SavedCircuit) => {
	return {
		nodes: savedCircuit.circuit.nodes,
		elements: savedCircuit.circuit.elements,
		metadata: savedCircuit.metadata,
	}
}

// Сервис для работы с API
export const circuitApi = {
	// Метод для решения схемы
	solveCircuit: async (
		circuitData: CircuitData,
		latex: boolean = true
	): Promise<SolutionResponse> => {
		try {
			// Используем новую функцию с учетом направлений
			const lcapyCircuit = formatCircuitToLCapy(
				circuitData.nodes,
				circuitData.elements
			)

			console.log('LCapy цепь с направлениями:', lcapyCircuit)
			console.log('Отправляемые данные схемы:', lcapyCircuit.circuitString)

			// Отправляем POST запрос с требуемой структурой
			const response = await axios.post<SolutionResponse>(
				`${API_BASE_URL}/solve`,
				{
					circuit: lcapyCircuit.circuitString,
					latex: latex,
				}
			)

			// Добавляем LCapy данные к ответу
			return {
				...response.data,
				lcapyCircuit, // добавляем информацию о направлениях для отладки
			}
		} catch (error) {
			console.error('Ошибка при запросе к API:', error)
			throw error
		}
	},

	// Метод для генерации схемы
	generateCircuit: async (
		params: GenerateCircuitRequest
	): Promise<GenerateCircuitResponse> => {
		try {
			console.log('Отправляем запрос на генерацию цепи с параметрами:', params)

			// Если указана конкретная топология, используем схему из базы данных
			if (params.topology_id) {
				console.log(
					'Используем схему из базы данных для топологии:',
					params.topology_id
				)

				const circuit = await circuitApi.getCircuitFromDB(
					params.topology_id,
					params.order
				)

				if (circuit) {
					console.log('Найдена схема в базе данных:', circuit)
					return {
						status: 'success',
						circuit: circuit.circuit_string,
						message: 'Схема получена из базы данных',
					}
				} else {
					console.log('Схема не найдена в базе данных, используем генерацию')
				}
			}

			// Отправляем POST запрос для генерации цепи
			const response = await axios.post<GenerateCircuitResponse>(
				`${API_BASE_URL}/generate_circuit`,
				params
			)

			console.log('Получен ответ от сервера:', response.data)

			if (!response.data.circuit) {
				console.error('Ошибка: в ответе сервера отсутствует circuit')
				return {
					status: 'error',
					message: 'В ответе сервера отсутствует описание цепи',
				}
			}

			return response.data
		} catch (error) {
			console.error('Ошибка при запросе генерации цепи:', error)
			throw error
		}
	},

	// Метод для генерации PDF с множественными цепями
	generateCircuitsPdf: async (
		params: GenerateCircuitsPdfRequest
	): Promise<Blob> => {
		try {
			console.log('Отправляем запрос на генерацию PDF с цепями:', params)

			// Отправляем POST запрос для генерации PDF с цепями с настройкой responseType: 'blob'
			const response = await axios.post(
				`${API_BASE_URL}/generate_circuits_pdf`,
				params,
				{ responseType: 'blob' }
			)

			return response.data
		} catch (error) {
			console.error('Ошибка при запросе генерации PDF с цепями:', error)
			throw error
		}
	},

	// Метод для генерации задачи
	generateTask: async (
		params: GenerateCircuitRequest
	): Promise<GenerateTaskResponse> => {
		try {
			console.log(
				'Отправляем запрос на генерацию задачи с параметрами:',
				params
			)

			// Если указана конкретная топология, используем схему из базы данных
			if (params.topology_id) {
				console.log(
					'Используем схему из базы данных для топологии:',
					params.topology_id
				)

				const circuit = await circuitApi.getCircuitFromDB(
					params.topology_id,
					params.order
				)

				if (circuit) {
					console.log('Найдена схема в базе данных:', circuit)
					// Отправляем запрос на генерацию задачи с конкретной схемой
					const response = await axios.post<GenerateTaskResponse>(
						`${API_BASE_URL}/generate_task`,
						{
							...params,
							circuit_string: circuit.circuit_string, // Передаем строку схемы
						}
					)
					return response.data
				} else {
					console.log('Схема не найдена в базе данных, используем генерацию')
				}
			}

			const response = await axios.post<GenerateTaskResponse>(
				`${API_BASE_URL}/generate_task`,
				params
			)

			return response.data
		} catch (error) {
			console.error('Ошибка при запросе генерации задачи:', error)
			throw error
		}
	},

	// Новый метод для сохранения цепи
	saveCircuit: async (
		savedCircuit: SavedCircuit
	): Promise<{ success: boolean; id: string }> => {
		try {
			// В будущем здесь будет запрос к API для сохранения в базе данных
			// Пока сохраняем в localStorage
			const savedCircuits = JSON.parse(
				localStorage.getItem('savedCircuits') || '[]'
			)
			savedCircuits.push(savedCircuit)
			localStorage.setItem('savedCircuits', JSON.stringify(savedCircuits))

			console.log('Цепь сохранена:', savedCircuit)

			return { success: true, id: savedCircuit.id }
		} catch (error) {
			console.error('Ошибка при сохранении цепи:', error)
			throw error
		}
	},

	// Метод для загрузки сохраненных цепей
	loadSavedCircuits: async (): Promise<SavedCircuit[]> => {
		try {
			// В будущем здесь будет запрос к API
			// Пока загружаем из localStorage
			const savedCircuits = JSON.parse(
				localStorage.getItem('savedCircuits') || '[]'
			)
			return savedCircuits
		} catch (error) {
			console.error('Ошибка при загрузке сохраненных цепей:', error)
			return []
		}
	},

	// Метод для удаления сохраненной цепи
	deleteSavedCircuit: async (
		circuitId: string
	): Promise<{ success: boolean }> => {
		try {
			const savedCircuits = JSON.parse(
				localStorage.getItem('savedCircuits') || '[]'
			)
			const filteredCircuits = savedCircuits.filter(
				(circuit: SavedCircuit) => circuit.id !== circuitId
			)
			localStorage.setItem('savedCircuits', JSON.stringify(filteredCircuits))

			return { success: true }
		} catch (error) {
			console.error('Ошибка при удалении цепи:', error)
			throw error
		}
	},

	// Методы для работы с базой данных топологий и схем

	// Получить список топологий
	getTopologies: async (): Promise<TopologyListResponse> => {
		try {
			const response = await axios.get<TopologyListResponse>(
				'http://localhost:8000/circuits/topologies/'
			)
			return response.data
		} catch (error) {
			console.error('Ошибка при получении топологий:', error)
			throw error
		}
	},

	// Получить топологии, которые имеют схемы определенного порядка
	getTopologiesWithOrder: async (order: number): Promise<Topology[]> => {
		try {
			// Сначала получаем все схемы с нужным порядком
			const circuitsResponse = await axios.get<CircuitListResponse>(
				`http://localhost:8000/circuits/?order=${order}`
			)

			// Извлекаем уникальные topology_id
			const topologyIds = [
				...new Set(circuitsResponse.data.circuits.map(c => c.topology_id)),
			]

			// Получаем все топологии
			const topologiesResponse = await axios.get<TopologyListResponse>(
				'http://localhost:8000/circuits/topologies/'
			)

			// Фильтруем топологии, которые имеют схемы нужного порядка
			const filteredTopologies = topologiesResponse.data.topologies.filter(
				topology => topologyIds.includes(topology.id)
			)

			return filteredTopologies
		} catch (error) {
			console.error(
				'Ошибка при получении топологий с определенным порядком:',
				error
			)
			throw error
		}
	},

	// Получить схему из базы данных по топологии и порядку
	getCircuitFromDB: async (
		topologyId: number,
		order: number
	): Promise<Circuit | null> => {
		try {
			const response = await axios.get<Circuit[]>(
				`http://localhost:8000/circuits/topologies/${topologyId}/circuits/?order=${order}`
			)

			// Возвращаем первую найденную схему
			return response.data.length > 0 ? response.data[0] : null
		} catch (error) {
			console.error('Ошибка при получении схемы из БД:', error)
			throw error
		}
	},

	// Получить случайную схему определенного порядка
	getRandomCircuitFromDB: async (
		order: number,
		topologyId?: number
	): Promise<Circuit | null> => {
		try {
			let url = `http://localhost:8000/circuits/?order=${order}`
			if (topologyId) {
				url = `http://localhost:8000/circuits/topologies/${topologyId}/circuits/?order=${order}`
			}

			const response = await axios.get<CircuitListResponse | Circuit[]>(url)

			// Определяем, какой формат ответа мы получили
			const circuits = Array.isArray(response.data)
				? response.data
				: (response.data as CircuitListResponse).circuits

			if (circuits.length === 0) {
				return null
			}

			// Возвращаем случайную схему
			const randomIndex = Math.floor(Math.random() * circuits.length)
			return circuits[randomIndex]
		} catch (error) {
			console.error('Ошибка при получении случайной схемы из БД:', error)
			throw error
		}
	},

	// Создать новую топологию
	createTopology: async (
		request: CreateTopologyRequest
	): Promise<CreateTopologyResponse> => {
		try {
			const response = await axios.post<CreateTopologyResponse>(
				'http://localhost:8000/circuits/topologies/',
				request
			)
			return response.data
		} catch (error) {
			console.error('Ошибка при создании топологии:', error)
			throw error
		}
	},

	// Создать новую схему
	createCircuit: async (
		request: CreateCircuitRequest
	): Promise<CreateCircuitResponse> => {
		try {
			const response = await axios.post<CreateCircuitResponse>(
				'http://localhost:8000/circuits/',
				request
			)
			return response.data
		} catch (error) {
			console.error('Ошибка при создании схемы:', error)
			throw error
		}
	},

	// Сгенерировать изображение схемы
	generateCircuitImage: async (
		request: GenerateImageRequest
	): Promise<GenerateImageResponse> => {
		try {
			const response = await axios.post<GenerateImageResponse>(
				'http://localhost:8000/circuits/generate-image/',
				request
			)
			return response.data
		} catch (error) {
			console.error('Ошибка при генерации изображения схемы:', error)
			throw error
		}
	},

	// Получить схемы по топологии
	getCircuitsByTopology: async (
		topologyId: number,
		skip: number = 0,
		limit: number = 100
	): Promise<Circuit[]> => {
		try {
			const response = await axios.get<Circuit[]>(
				`http://localhost:8000/circuits/topologies/${topologyId}/circuits/?skip=${skip}&limit=${limit}`
			)
			return response.data
		} catch (error) {
			console.error('Ошибка при получении схем по топологии:', error)
			throw error
		}
	},

	// Удалить топологию
	deleteTopology: async (topologyId: number): Promise<void> => {
		try {
			await axios.delete(
				`http://localhost:8000/circuits/topologies/${topologyId}`
			)
		} catch (error) {
			console.error('Ошибка при удалении топологии:', error)
			throw error
		}
	},

	// Удалить схему
	deleteCircuit: async (circuitId: number): Promise<void> => {
		try {
			await axios.delete(`http://localhost:8000/circuits/${circuitId}`)
		} catch (error) {
			console.error('Ошибка при удалении схемы:', error)
			throw error
		}
	},
}

export default circuitApi
