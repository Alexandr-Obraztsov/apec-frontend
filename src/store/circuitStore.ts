import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import {
	AnyCircuitElement,
	Node,
	Position,
	ElementType,
	WireElement,
	SwitchElement,
	Direction,
	getEndPosition,
	getRotationByDirection,
	getOppositeDirection,
} from '../types'

// Импортируем интерфейс с параметрами для генерации цепи
import { ChainOptions } from '../components/GenerateChainModal'

import { ELEMENT_NAME_PREFIXES, NODE_NAME_PREFIX } from '../types'

// Дефолтные значения для компонентов в единицах СИ
const DEFAULT_VALUES = {
	wire: { value: 0.1, unit: 'м' },
	resistor: { value: 1000, unit: 'Ом' },
	capacitor: { value: 0.00001, unit: 'Ф' },
	inductor: { value: 0.001, unit: 'Гн' },
	voltage: { value: 5, unit: 'В' },

	switch: { value: 0, unit: '', isOpen: true },
}

interface CircuitState {
	elements: AnyCircuitElement[]
	nodes: Node[]
	selectedElementId: string | null
	selectedNodeId: string | null
	multiSelectedElementIds: string[]
	multiSelectedNodeIds: string[]
	isMultiSelectMode: boolean
	placementMode: {
		active: boolean
		elementType: ElementType | null
		startNodeId: string | null
		availableDirections: Direction[] // Доступные направления для размещения
	}
	// Счетчики для генерации имен
	nameCounters: {
		elements: Record<ElementType, number>
		nodes: number
	}
	// Состояние для подсветки элементов в панели связей
	highlightedElementId: string | null
	highlightedNodeId: string | null

	// Actions
	addElement: (element: {
		type: ElementType
		value?: string
		startNodeId: string
		endNodeId: string
		direction: Direction
		isOpen?: boolean
	}) => void
	removeElement: (id: string) => void
	removeSelectedElements: () => void
	updateElementValue: (id: string, value: number | string) => void
	updateElementRotation: (id: string, rotation: number) => void
	updateSwitchState: (id: string, isOpen: boolean) => void
	selectElement: (id: string | null) => void
	selectNode: (id: string | null) => void
	toggleElementSelection: (id: string) => void
	toggleNodeSelection: (id: string) => void
	clearMultiSelection: () => void
	setMultiSelectMode: (active: boolean) => void

	// Узлы
	addNode: (position: Position) => string
	getNodeById: (id: string) => Node | undefined

	// Размещение элементов с направлениями
	startPlacement: (elementType: ElementType) => void
	cancelPlacement: () => void
	setPlacementStartNode: (nodeId: string) => void
	placeElementInDirection: (direction: Direction) => void
	getAvailableDirections: (nodeId: string) => Direction[]

	// Поиск ближайшего узла
	findNodeAtPosition: (position: Position, threshold?: number) => Node | null

	// Добавляем методы для управления подсветкой
	setHighlightedElement: (id: string | null) => void
	setHighlightedNode: (id: string | null) => void

	// Функция для переименования узлов по порядку, начиная с 0
	renameNodes: () => void

	// Функция для переименования элементов каждого типа по порядку, начиная с 1
	renameElements: () => void

	// Функция для генерации цепи
	generateChain: (options: ChainOptions) => void
}

// Функция для вычисления расстояния между двумя точками
const distanceBetween = (p1: Position, p2: Position): number => {
	return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
}

// Функция для преобразования короткого типа элемента в полный
const convertElementType = (shortType: string): ElementType => {
	switch (shortType.toUpperCase()[0]) {
		case 'R':
			return 'resistor'
		case 'C':
			return 'capacitor'
		case 'L':
			return 'inductor'
		case 'V':
			return 'voltage'

		case 'W':
			return 'wire'
		case 'S':
			return 'switch'
		default:
			// Если уже полное название, возвращаем как есть
			if (
				[
					'resistor',
					'capacitor',
					'inductor',
					'voltage',
					'wire',
					'switch',
				].includes(shortType)
			) {
				return shortType as ElementType
			}
			// Если неизвестный тип, по умолчанию провод
			console.warn(
				`Неизвестный тип элемента: ${shortType}, используется тип "wire"`
			)
			return 'wire'
	}
}

export const useCircuitStore = create<CircuitState>((set, get) => ({
	elements: [],
	nodes: [],
	selectedElementId: null,
	selectedNodeId: null,
	multiSelectedElementIds: [],
	multiSelectedNodeIds: [],
	isMultiSelectMode: false,
	placementMode: {
		active: false,
		elementType: null,
		startNodeId: null,
		availableDirections: [],
	},
	// Инициализация счетчиков имен
	nameCounters: {
		elements: {
			wire: 0,
			resistor: 0,
			capacitor: 0,
			inductor: 0,
			voltage: 0,

			switch: 0,
		},
		nodes: -1,
	},
	// Состояние для подсветки элементов в панели связей
	highlightedElementId: null,
	highlightedNodeId: null,

	addElement: element => {
		console.log(element)
		set(state => {
			// Увеличиваем счетчик для типа элемента
			const counter = state.nameCounters.elements[element.type] + 1

			// Создаем имя для элемента
			const elementName = `${ELEMENT_NAME_PREFIXES[element.type]}${counter}`

			// Получаем единицу измерения из DEFAULT_VALUES
			const unit = DEFAULT_VALUES[element.type].unit

			const newElement = {
				...element,
				unit,
				id: uuidv4(),
				name: elementName,
			} as AnyCircuitElement

			// Обновляем узлы, добавляя к ним ссылку на новый элемент
			const updatedNodes = state.nodes.map(node => {
				if (node.id === element.startNodeId || node.id === element.endNodeId) {
					return {
						...node,
						connectedElements: [...node.connectedElements, newElement.id],
					}
				}
				return node
			})

			// Обновляем счетчик
			const updatedCounters = {
				...state.nameCounters,
				elements: {
					...state.nameCounters.elements,
					[element.type]: counter,
				},
			}

			return {
				elements: [...state.elements, newElement],
				nodes: updatedNodes,
				nameCounters: updatedCounters,
			}
		})

		// После добавления элемента, переименовываем элементы
		setTimeout(() => get().renameElements(), 0)
	},

	removeElement: (id: string) => {
		set(state => {
			// Получаем элемент, который нужно удалить
			const elementToRemove = state.elements.find(el => el.id === id)
			if (!elementToRemove) return state

			// Сначала снимаем выделение, если элемент был выбран
			const updatedState = {
				...state,
				selectedElementId:
					state.selectedElementId === id ? null : state.selectedElementId,
				multiSelectedElementIds: state.multiSelectedElementIds.filter(
					elementId => elementId !== id
				),
			}

			// Обновляем узлы, удаляя ссылки на удаляемый элемент
			const updatedNodes = state.nodes.map(node => {
				if (
					node.id === elementToRemove.startNodeId ||
					node.id === elementToRemove.endNodeId
				) {
					return {
						...node,
						connectedElements: node.connectedElements.filter(
							elId => elId !== id
						),
					}
				}
				return node
			})

			// Удаляем узлы, которые больше не связаны с элементами
			const nodesToKeep = updatedNodes.filter(
				node => node.connectedElements.length > 0
			)

			// Обновляем состояние синхронно
			const finalState = {
				...updatedState,
				elements: state.elements.filter(element => element.id !== id),
				nodes: nodesToKeep,
			}

			// Запускаем переименование в следующем микротаске
			queueMicrotask(() => {
				const store = get()
				store.renameNodes()
				store.renameElements()
			})

			return finalState
		})
	},

	removeSelectedElements: () =>
		set(state => {
			// Получаем все ID выбранных элементов (включая одиночное выделение)
			const allSelectedIds = [...state.multiSelectedElementIds]
			if (
				state.selectedElementId &&
				!allSelectedIds.includes(state.selectedElementId)
			) {
				allSelectedIds.push(state.selectedElementId)
			}

			if (allSelectedIds.length === 0) return state

			// Удаляем все выбранные элементы
			let updatedElements = [...state.elements]
			let updatedNodes = [...state.nodes]

			for (const id of allSelectedIds) {
				const elementToRemove = updatedElements.find(el => el.id === id)
				if (!elementToRemove) continue

				// Удаляем элемент
				updatedElements = updatedElements.filter(element => element.id !== id)

				// Обновляем узлы, удаляя ссылки на удаляемый элемент
				updatedNodes = updatedNodes.map(node => {
					if (
						node.id === elementToRemove.startNodeId ||
						node.id === elementToRemove.endNodeId
					) {
						return {
							...node,
							connectedElements: node.connectedElements.filter(
								elId => elId !== id
							),
						}
					}
					return node
				})
			}

			// Удаляем узлы, которые больше не связаны с элементами
			const nodesToKeep = updatedNodes.filter(
				node => node.connectedElements.length > 0
			)

			// После удаления элементов и связанных узлов, переименовываем оставшиеся узлы и элементы
			setTimeout(() => {
				get().renameNodes()
				get().renameElements()
			}, 0)

			return {
				elements: updatedElements,
				nodes: nodesToKeep,
				selectedElementId: null,
				multiSelectedElementIds: [],
			}
		}),

	updateElementValue: (id: string, value: number | string) =>
		set(state => ({
			elements: state.elements.map(element =>
				element.id === id ? { ...element, value } : element
			),
		})),

	updateElementRotation: (id, rotation) =>
		set(state => ({
			elements: state.elements.map(element =>
				element.id === id ? { ...element, rotation } : element
			),
		})),

	updateSwitchState: (id, isOpen) =>
		set(state => ({
			elements: state.elements.map(element =>
				element.id === id && element.type === 'switch'
					? {
							...element,
							isOpen,
							// Устанавливаем value в соответствии с состоянием ключа:
							// isOpen = true (разомкнут) -> value = 0 (выключен)
							// isOpen = false (замкнут) -> value = 1 (включен)
							value: isOpen ? 0 : 1,
					  }
					: element
			),
		})),

	selectElement: id =>
		set(state => {
			// Если нажата клавиша Ctrl или включен режим множественного выбора,
			// сохраняем текущий multiSelectedElementIds
			if (state.isMultiSelectMode) {
				return {
					selectedElementId: id,
					selectedNodeId: null,
				}
			}

			// Иначе, сбрасываем множественный выбор
			return {
				selectedElementId: id,
				selectedNodeId: null,
				multiSelectedElementIds: [],
				multiSelectedNodeIds: [],
			}
		}),

	selectNode: id =>
		set(state => {
			// Если нажата клавиша Ctrl или включен режим множественного выбора,
			// сохраняем текущий multiSelectedNodeIds
			if (state.isMultiSelectMode) {
				return {
					selectedNodeId: id,
					selectedElementId: null,
				}
			}

			// Иначе, сбрасываем множественный выбор
			return {
				selectedNodeId: id,
				selectedElementId: null,
				multiSelectedElementIds: [],
				multiSelectedNodeIds: [],
			}
		}),

	toggleElementSelection: id =>
		set(state => {
			// Если элемент уже выбран, удаляем его из выбранных
			if (state.multiSelectedElementIds.includes(id)) {
				return {
					multiSelectedElementIds: state.multiSelectedElementIds.filter(
						elementId => elementId !== id
					),
				}
			}

			// Иначе добавляем его к выбранным
			return {
				multiSelectedElementIds: [...state.multiSelectedElementIds, id],
			}
		}),

	toggleNodeSelection: id =>
		set(state => {
			// Если узел уже выбран, удаляем его из выбранных
			if (state.multiSelectedNodeIds.includes(id)) {
				return {
					multiSelectedNodeIds: state.multiSelectedNodeIds.filter(
						nodeId => nodeId !== id
					),
				}
			}

			// Иначе добавляем его к выбранным
			return {
				multiSelectedNodeIds: [...state.multiSelectedNodeIds, id],
			}
		}),

	clearMultiSelection: () =>
		set({
			multiSelectedElementIds: [],
			multiSelectedNodeIds: [],
		}),

	setMultiSelectMode: active =>
		set({
			isMultiSelectMode: active,
		}),

	// Узлы
	addNode: position => {
		const nodeId = uuidv4()

		set(state => {
			// Увеличиваем счетчик узлов
			const counter = state.nameCounters.nodes + 1
			// Создаем имя для узла (теперь начиная с 0)
			const nodeName = `${NODE_NAME_PREFIX}${counter}`

			return {
				nodes: [
					...state.nodes,
					{
						id: nodeId,
						position,
						connectedElements: [],
						name: nodeName,
					},
				],
				nameCounters: {
					...state.nameCounters,
					nodes: counter,
				},
			}
		})

		// Вызываем переименование узлов после каждого добавления узла
		setTimeout(() => get().renameNodes(), 0)

		return nodeId
	},

	getNodeById: id => {
		return get().nodes.find(node => node.id === id)
	},

	// Размещение элементов
	startPlacement: elementType =>
		set({
			placementMode: {
				active: true,
				elementType,
				startNodeId: null,
				availableDirections: [],
			},
		}),

	cancelPlacement: () =>
		set({
			placementMode: {
				active: false,
				elementType: null,
				startNodeId: null,
				availableDirections: [],
			},
		}),

	setPlacementStartNode: nodeId =>
		set(state => ({
			placementMode: {
				...state.placementMode,
				startNodeId: nodeId,
			},
		})),

	placeElementInDirection: direction => {
		set(state => {
			if (
				!state.placementMode.active ||
				!state.placementMode.elementType ||
				!state.placementMode.startNodeId
			) {
				return state
			}

			const elementType = state.placementMode.elementType
			const startNodeId = state.placementMode.startNodeId

			// Получаем начальный узел
			const startNode = state.nodes.find(node => node.id === startNodeId)
			if (!startNode) {
				return state
			}

			// Вычисляем конечную позицию по направлению
			const endPosition = getEndPosition(startNode.position, direction)

			// Проверяем, есть ли уже узел в конечной позиции (с небольшим допуском)
			const existingEndNode = state.nodes.find(node => {
				const distance = Math.sqrt(
					Math.pow(node.position.x - endPosition.x, 2) +
						Math.pow(node.position.y - endPosition.y, 2)
				)
				return distance < 10 // Допуск 10 пикселей
			})

			let endNodeId: string
			let endNodeName: string
			let nodeCounter: number
			let updatedNodes: Node[]

			if (existingEndNode) {
				// Используем существующий узел
				endNodeId = existingEndNode.id
				endNodeName = existingEndNode.name
				nodeCounter = state.nameCounters.nodes
				updatedNodes = state.nodes
			} else {
				// Создаем новый узел в конечной позиции
				endNodeId = uuidv4()
				nodeCounter = state.nameCounters.nodes + 1
				endNodeName = `${NODE_NAME_PREFIX}${nodeCounter}`

				// Создаем новый конечный узел
				const endNode: Node = {
					id: endNodeId,
					position: endPosition,
					connectedElements: [],
					name: endNodeName,
				}

				updatedNodes = [...state.nodes, endNode]
			}

			// Увеличиваем счетчик для типа элемента
			const elementCounter = state.nameCounters.elements[elementType] + 1

			// Создаем имя для элемента
			const elementName = `${ELEMENT_NAME_PREFIXES[elementType]}${elementCounter}`

			// Получаем угол поворота по направлению
			const rotation = getRotationByDirection(direction)

			let newElement: Omit<AnyCircuitElement, 'id'>

			// Создаем разные типы элементов в зависимости от выбранного
			if (elementType === 'wire') {
				newElement = {
					type: 'wire',
					startNodeId,
					endNodeId,
					rotation,
					value: DEFAULT_VALUES[elementType].value,
					unit: DEFAULT_VALUES[elementType].unit,
					name: elementName,
					direction,
				} as WireElement
			} else if (elementType === 'resistor') {
				newElement = {
					type: 'resistor',
					startNodeId,
					endNodeId,
					rotation,
					value: DEFAULT_VALUES[elementType].value,
					unit: DEFAULT_VALUES[elementType].unit,
					name: elementName,
					direction,
				}
			} else if (elementType === 'capacitor') {
				newElement = {
					type: 'capacitor',
					startNodeId,
					endNodeId,
					rotation,
					value: DEFAULT_VALUES[elementType].value,
					unit: DEFAULT_VALUES[elementType].unit,
					name: elementName,
					direction,
				}
			} else if (elementType === 'inductor') {
				newElement = {
					type: 'inductor',
					startNodeId,
					endNodeId,
					rotation,
					value: DEFAULT_VALUES[elementType].value,
					unit: DEFAULT_VALUES[elementType].unit,
					name: elementName,
					direction,
				}
			} else if (elementType === 'switch') {
				newElement = {
					type: 'switch',
					startNodeId,
					endNodeId,
					rotation,
					value: 0, // 0 - выключен
					unit: '',
					name: elementName,
					direction,
					isOpen: true, // true = разомкнут (ВЫКЛ)
				} as SwitchElement
			} else {
				newElement = {
					type: 'voltage',
					startNodeId,
					endNodeId,
					rotation,
					value: DEFAULT_VALUES[elementType].value,
					unit: DEFAULT_VALUES[elementType].unit,
					name: elementName,
					direction,
				}
			}

			// Создаем новый элемент с ID
			const newElementId = uuidv4()
			const elementWithId = {
				...newElement,
				id: newElementId,
			} as AnyCircuitElement

			// Обновляем узлы, добавляя к ним ссылку на новый элемент
			const finalNodes = updatedNodes.map(node => {
				if (node.id === startNodeId || node.id === endNodeId) {
					return {
						...node,
						connectedElements: [...node.connectedElements, newElementId],
					}
				}
				return node
			})

			// Обновляем счетчики
			const updatedCounters = {
				...state.nameCounters,
				nodes: nodeCounter,
				elements: {
					...state.nameCounters.elements,
					[elementType]: elementCounter,
				},
			}

			return {
				elements: [...state.elements, elementWithId],
				nodes: finalNodes,
				placementMode: {
					active: false,
					elementType: null,
					startNodeId: null,
					availableDirections: [],
				},
				nameCounters: updatedCounters,
			}
		})

		// После добавления элемента, переименовываем элементы
		setTimeout(() => {
			get().renameNodes()
			get().renameElements()
		}, 0)
	},

	findNodeAtPosition: (position, threshold = 15) => {
		const nodes = get().nodes
		for (const node of nodes) {
			if (distanceBetween(node.position, position) <= threshold) {
				return node
			}
		}
		return null
	},

	// Добавляем методы для управления подсветкой
	setHighlightedElement: (id: string | null) =>
		set({ highlightedElementId: id }),

	setHighlightedNode: (id: string | null) => set({ highlightedNodeId: id }),

	// Функция для переименования узлов по порядку, начиная с 0
	renameNodes: () => {
		const state = get()
		const nodes = [...state.nodes]

		// Если узлов нет, ничего не делаем
		if (nodes.length === 0) return

		// Получаем текущие имена узлов как числа
		const nodeNumbers = nodes.map(node => parseInt(node.name) || 0)

		// Проверяем, есть ли узел с номером 0
		const hasZeroNode = nodeNumbers.includes(0)

		// Находим пропущенные номера в последовательности
		const sortedNodeNumbers = [...nodeNumbers].sort((a, b) => a - b)
		const maxNodeNumber = sortedNodeNumbers[sortedNodeNumbers.length - 1]

		// Создаем массив всех номеров, которые должны быть
		const expectedNumbers = Array.from(
			{ length: maxNodeNumber + 1 },
			(_, i) => i
		)

		// Находим отсутствующие номера
		const missingNumbers = expectedNumbers.filter(
			num => !nodeNumbers.includes(num)
		)

		// Если нет узла с номером 0 или есть пропуски в последовательности
		if (!hasZeroNode || missingNumbers.length > 0) {
			// Получаем узлы, которые нужно переименовать (с наибольшими номерами)
			const nodesToRename = [...nodes]
				.sort((a, b) => {
					const numA = parseInt(a.name) || 0
					const numB = parseInt(b.name) || 0
					return numB - numA // Сортируем в порядке убывания номеров
				})
				.slice(0, missingNumbers.length)

			// Создаем карту переименований
			const renameMap: Record<string, string> = {}

			// Заполняем пропуски, начиная с наименьшего пропущенного номера
			missingNumbers.sort((a, b) => a - b)

			nodesToRename.forEach((node, index) => {
				if (index < missingNumbers.length) {
					renameMap[node.id] = `${missingNumbers[index]}`
				}
			})

			// Применяем переименования
			const renamedNodes = nodes.map(node => ({
				...node,
				name: renameMap[node.id] !== undefined ? renameMap[node.id] : node.name,
			}))

			// Обновляем счетчик узлов на максимальный номер
			set({
				nodes: renamedNodes,
				nameCounters: {
					...state.nameCounters,
					nodes: maxNodeNumber,
				},
			})
		}
	},

	// Функция для переименования элементов каждого типа по порядку, начиная с 1
	renameElements: () => {
		const state = get()
		const elements = [...state.elements]

		// Если элементов нет, ничего не делаем
		if (elements.length === 0) return

		// Группируем элементы по типу
		const elementsByType: Record<ElementType, AnyCircuitElement[]> = {
			wire: [],
			resistor: [],
			capacitor: [],
			inductor: [],
			voltage: [],
			switch: [],
		}

		// Заполняем группы
		elements.forEach(element => {
			elementsByType[element.type].push(element)
		})

		// Обрабатываем каждый тип элементов
		let updatedElements: AnyCircuitElement[] = []
		const updatedCounters = { ...state.nameCounters.elements }

		// Обрабатываем каждый тип элементов
		Object.keys(elementsByType).forEach(type => {
			const elementsOfType = elementsByType[type as ElementType]

			// Если нет элементов этого типа, пропускаем
			if (elementsOfType.length === 0) {
				updatedCounters[type as ElementType] = 0
				return
			}

			// Сортируем элементы по текущим именам/номерам (извлекаем номер из имени)
			const sortedElements = [...elementsOfType].sort((a, b) => {
				const numA =
					parseInt(a.name.replace(ELEMENT_NAME_PREFIXES[a.type], '')) || 0
				const numB =
					parseInt(b.name.replace(ELEMENT_NAME_PREFIXES[b.type], '')) || 0
				return numA - numB
			})

			// Переименовываем элементы в порядке от 1 до N
			const renamedElements = sortedElements.map((element, index) => {
				const newNumber = index + 1 // Начинаем с 1
				return {
					...element,
					name: `${ELEMENT_NAME_PREFIXES[element.type]}${newNumber}`,
				}
			})

			// Обновляем счетчик для этого типа элементов
			updatedCounters[type as ElementType] = renamedElements.length

			// Добавляем переименованные элементы к результату
			updatedElements = [...updatedElements, ...renamedElements]
		})

		// Обновляем состояние с переименованными элементами и обновленными счетчиками
		set({
			elements: updatedElements,
			nameCounters: {
				...state.nameCounters,
				elements: updatedCounters,
			},
		})
	},

	// Функция для генерации цепи
	generateChain: (options: ChainOptions) => {
		const { nodes, elements } = get()

		// Очищаем существующую схему
		elements.forEach(element => get().removeElement(element.id))
		nodes.forEach(node => {
			const state = get() as unknown as { removeNode?: (id: string) => void }
			if (state.removeNode) state.removeNode(node.id)
		})

		const SPACING = 200 // Уменьшим расстояние для более компактной схемы

		// 1. Парсер строки конфигурации
		const circuitLines = options.circuit.split('\n').filter(line => line.trim())
		const parsedElements = circuitLines.map(line => {
			const parts = line.split(';')
			const elementDef = parts[0].trim()

			let direction = 'right'
			if (parts.length > 1 && parts[1].trim()) {
				direction = parts[1].trim()
			}

			const elementParts = elementDef.split(/\s+/)
			const name = elementParts[0]
			const startNodeNum = parseInt(elementParts[1], 10)
			const endNodeNum = parseInt(elementParts[2], 10)
			const value = elementParts.length > 3 ? elementParts[3] : undefined

			const typeMatch = name.match(/^([A-Z]+)/)
			const type = typeMatch ? typeMatch[1] : 'W'

			return { name, type, startNodeNum, endNodeNum, direction, value }
		})

		// 2. Расчет позиций узлов (DFS)
		const connections = new Map<number, { next: number; dir: string }[]>()
		parsedElements.forEach(({ startNodeNum, endNodeNum, direction }) => {
			if (!connections.has(startNodeNum)) connections.set(startNodeNum, [])
			if (!connections.has(endNodeNum)) connections.set(endNodeNum, [])
			connections.get(startNodeNum)!.push({ next: endNodeNum, dir: direction })
			connections
				.get(endNodeNum)!
				.push({ next: startNodeNum, dir: 'reverse_' + direction })
		})

		const relativePositions = new Map<number, Position>([[0, { x: 0, y: 0 }]])
		const nodesToProcess = [0]
		const visited = new Set([0])

		while (nodesToProcess.length > 0) {
			const point = nodesToProcess.pop()! // DFS

			connections.get(point)?.forEach(({ next, dir }) => {
				if (!relativePositions.has(next)) {
					const currentPos = relativePositions.get(point)!
					let nextPos: Position = { ...currentPos }

					switch (dir) {
						case 'up':
							nextPos = { x: currentPos.x, y: currentPos.y - SPACING }
							break
						case 'down':
							nextPos = { x: currentPos.x, y: currentPos.y + SPACING }
							break
						case 'left':
							nextPos = { x: currentPos.x - SPACING, y: currentPos.y }
							break
						case 'right':
							nextPos = { x: currentPos.x + SPACING, y: currentPos.y }
							break
						case 'reverse_up':
							nextPos = { x: currentPos.x, y: currentPos.y + SPACING }
							break
						case 'reverse_down':
							nextPos = { x: currentPos.x, y: currentPos.y - SPACING }
							break
						case 'reverse_left':
							nextPos = { x: currentPos.x + SPACING, y: currentPos.y }
							break
						case 'reverse_right':
							nextPos = { x: currentPos.x - SPACING, y: currentPos.y }
							break
					}
					relativePositions.set(next, nextPos)
				}
				if (!visited.has(next)) {
					visited.add(next)
					nodesToProcess.push(next)
				}
			})
		}

		// 3. Нормализация и смещение позиций
		let minX = Infinity,
			minY = Infinity
		for (const pos of relativePositions.values()) {
			if (pos.x < minX) minX = pos.x
			if (pos.y < minY) minY = pos.y
		}

		const finalPositions = new Map<number, Position>()
		relativePositions.forEach((pos, key) => {
			finalPositions.set(key, {
				x: pos.x - minX + 2800,
				y: pos.y - minY + 2700,
			})
		})

		// 4. Создание узлов и элементов в хранилище
		const nodeIds: Record<number, string> = {}
		finalPositions.forEach((pos, nodeNum) => {
			nodeIds[nodeNum] = get().addNode(pos)
		})

		parsedElements.forEach(
			({ name, startNodeNum, endNodeNum, value, direction }) => {
				const elementType = convertElementType(name)
				const startNodeId = nodeIds[startNodeNum]
				const endNodeId = nodeIds[endNodeNum]

				if (!startNodeId || !endNodeId) {
					console.warn(
						`Skipping element ${name} because one of its nodes was not found.`
					)
					return
				}

				// Преобразуем строковое направление в Direction
				const elementDirection = direction as Direction

				// Получаем угол поворота по направлению
				const rotation = getRotationByDirection(elementDirection)

				interface ElementData {
					type: ElementType
					startNodeId: string
					endNodeId: string
					value: string
					direction: Direction
					rotation: number
					isOpen?: boolean
				}

				const elementData: ElementData = {
					type: elementType,
					startNodeId,
					endNodeId,
					value: value || DEFAULT_VALUES[elementType]?.value.toString() || '0',
					direction: elementDirection,
					rotation: rotation,
				}

				if (elementType === 'switch') {
					elementData.isOpen = value === 'no'
					elementData.value = value === 'nc' ? '1' : '0'
				}

				get().addElement(elementData)
			}
		)

		// Переименовываем узлы и элементы
		get().renameNodes()
		get().renameElements()
	},

	// Функция для получения доступных направлений от узла
	getAvailableDirections: (nodeId: string) => {
		const state = get()
		const node = state.nodes.find(n => n.id === nodeId)
		if (!node) return []

		// Получаем все занятые направления от данного узла
		const occupiedDirections: Direction[] = []

		// Проверяем все элементы, подключенные к узлу
		for (const elementId of node.connectedElements) {
			const element = state.elements.find(el => el.id === elementId)
			if (element && 'direction' in element) {
				// Если элемент начинается от этого узла, добавляем его направление
				if (element.startNodeId === nodeId) {
					occupiedDirections.push(element.direction as Direction)
				}
				// Если элемент заканчивается в этом узле, добавляем противоположное направление
				else if (element.endNodeId === nodeId) {
					const oppositeDirection = getOppositeDirection(
						element.direction as Direction
					)
					occupiedDirections.push(oppositeDirection)
				}
			}
		}

		// Возвращаем все направления, которые не заняты
		const allDirections: Direction[] = ['up', 'down', 'left', 'right']
		return allDirections.filter(dir => !occupiedDirections.includes(dir))
	},
}))
