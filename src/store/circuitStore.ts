import { create } from 'zustand'
import {
	AnyCircuitElement,
	ElementType,
	Node,
	Position,
	WireElement,
	SwitchElement,
	ELEMENT_NAME_PREFIXES,
	NODE_NAME_PREFIX,
} from '../types'
import { v4 as uuidv4 } from 'uuid'

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
	addElement: (
		element: Omit<
			AnyCircuitElement,
			'id' | 'startNodeId' | 'endNodeId' | 'name'
		> & {
			startNodeId: string
			endNodeId: string
		}
	) => void
	removeElement: (id: string) => void
	removeSelectedElements: () => void
	updateElementValue: (id: string, value: number) => void
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
	addNodeOnWire: (position: Position, wireId: string) => string
	updateNodePosition: (id: string, position: Position) => void
	getNodeById: (id: string) => Node | undefined

	// Размещение элементов
	startPlacement: (elementType: ElementType) => void
	cancelPlacement: () => void
	setPlacementStartNode: (nodeId: string) => void
	placeElement: (endNodeId: string) => void

	// Поиск ближайшего узла
	findNodeAtPosition: (position: Position, threshold?: number) => Node | null

	// Добавляем метод для поиска ближайшей точки на линии (проводе)
	findClosestWire: (
		position: Position,
		threshold?: number
	) => {
		wire: AnyCircuitElement
		point: Position
		distance: number
	} | null

	// Добавляем методы для управления подсветкой
	setHighlightedElement: (id: string | null) => void
	setHighlightedNode: (id: string | null) => void

	// Функция для переименования узлов по порядку, начиная с 0
	renameNodes: () => void
}

// Функция для расчета угла между двумя узлами
const calculateAngle = (
	nodes: Node[],
	startNodeId: string,
	endNodeId: string
): number => {
	const startNode = nodes.find(node => node.id === startNodeId)
	const endNode = nodes.find(node => node.id === endNodeId)

	if (!startNode || !endNode) return 0

	const dx = endNode.position.x - startNode.position.x
	const dy = endNode.position.y - startNode.position.y

	// Округляем значение до 2-х знаков, чтобы избежать проблем с точностью вычислений
	// и предотвратить ошибки при отрисовке с атрибутом transform
	const angle = parseFloat(((Math.atan2(dy, dx) * 180) / Math.PI).toFixed(2))
	return angle
}

// Дефолтные значения для компонентов в единицах СИ
const DEFAULT_VALUES = {
	wire: { value: 0.1, unit: 'м' },
	resistor: { value: 1000, unit: 'Ом' },
	capacitor: { value: 0.00001, unit: 'Ф' },
	inductor: { value: 0.001, unit: 'Гн' },
	voltage: { value: 5, unit: 'В' },
	switch: { value: 0, unit: '', isOpen: true },
}

// Функция для вычисления расстояния между двумя точками
const distanceBetween = (p1: Position, p2: Position): number => {
	const dx = p2.x - p1.x
	const dy = p2.y - p1.y
	return Math.sqrt(dx * dx + dy * dy)
}

// Функция для нахождения ближайшей точки на линии (проводе)
const findClosestPointOnLine = (
	lineStart: Position,
	lineEnd: Position,
	point: Position
): Position => {
	const dx = lineEnd.x - lineStart.x
	const dy = lineEnd.y - lineStart.y
	const lineLength = Math.sqrt(dx * dx + dy * dy)

	// Проекция точки на линию
	const t = Math.max(
		0,
		Math.min(
			1,
			((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) /
				(lineLength * lineLength)
		)
	)

	return {
		x: lineStart.x + t * dx,
		y: lineStart.y + t * dy,
	}
}

// Функция для вычисления расстояния от точки до линии (провода)
const distanceToLine = (
	lineStart: Position,
	lineEnd: Position,
	point: Position
): { distance: number; closestPoint: Position } => {
	const closestPoint = findClosestPointOnLine(lineStart, lineEnd, point)
	const distance = distanceBetween(point, closestPoint)

	return { distance, closestPoint }
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

	addElement: element =>
		set(state => {
			// Увеличиваем счетчик для типа элемента
			const counter = state.nameCounters.elements[element.type] + 1

			// Создаем имя для элемента
			const elementName = `${ELEMENT_NAME_PREFIXES[element.type]}${counter}`

			const newElement = {
				...element,
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
		}),

	removeElement: id =>
		set(state => {
			// Получаем элемент, который нужно удалить
			const elementToRemove = state.elements.find(el => el.id === id)
			if (!elementToRemove) return state

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

			const updatedState = {
				elements: state.elements.filter(element => element.id !== id),
				nodes: nodesToKeep,
				// Если удаляемый элемент был выбран, снимаем выделение
				selectedElementId:
					state.selectedElementId === id ? null : state.selectedElementId,
				multiSelectedElementIds: state.multiSelectedElementIds.filter(
					elementId => elementId !== id
				),
			}

			// После удаления элемента и связанных узлов, переименовываем оставшиеся узлы
			setTimeout(() => get().renameNodes(), 0)

			return updatedState
		}),

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

			// После удаления элементов и связанных узлов, переименовываем оставшиеся узлы
			setTimeout(() => get().renameNodes(), 0)

			return {
				elements: updatedElements,
				nodes: nodesToKeep,
				selectedElementId: null,
				multiSelectedElementIds: [],
			}
		}),

	updateElementValue: (id, value) =>
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

		return nodeId
	},

	// Добавление узла на провод с разбиением провода на два
	addNodeOnWire: (position, wireId) => {
		const state = get()
		const wire = state.elements.find(el => el.id === wireId) as
			| WireElement
			| undefined

		if (!wire || wire.type !== 'wire') {
			// Если провод не найден или это не провод, просто добавляем обычный узел
			return get().addNode(position)
		}

		// Увеличиваем счетчик узлов
		const nodeCounter = state.nameCounters.nodes + 1
		// Создаем имя для узла (теперь начиная с 0)
		const nodeName = `${NODE_NAME_PREFIX}${nodeCounter}`

		// Создаем новый узел
		const nodeId = uuidv4()

		// Получаем начальный и конечный узлы провода
		const startNode = state.nodes.find(node => node.id === wire.startNodeId)
		const endNode = state.nodes.find(node => node.id === wire.endNodeId)

		if (!startNode || !endNode) {
			return get().addNode(position)
		}

		// Увеличиваем счетчик для проводов
		const wireCounter = state.nameCounters.elements.wire + 2 // +2 так как создаем два новых провода

		// Создаем два новых провода
		const wire1Id = uuidv4()
		const wire2Id = uuidv4()

		const rotation1 = calculateAngle(
			[
				startNode,
				{ id: nodeId, position, connectedElements: [], name: nodeName },
			],
			startNode.id,
			nodeId
		)

		const rotation2 = calculateAngle(
			[
				{ id: nodeId, position, connectedElements: [], name: nodeName },
				endNode,
			],
			nodeId,
			endNode.id
		)

		const wire1: WireElement = {
			id: wire1Id,
			type: 'wire',
			startNodeId: wire.startNodeId,
			endNodeId: nodeId,
			rotation: rotation1,
			value: wire.value,
			unit: wire.unit,
			name: `${ELEMENT_NAME_PREFIXES.wire}${wireCounter - 1}`,
		}

		const wire2: WireElement = {
			id: wire2Id,
			type: 'wire',
			startNodeId: nodeId,
			endNodeId: wire.endNodeId,
			rotation: rotation2,
			value: wire.value,
			unit: wire.unit,
			name: `${ELEMENT_NAME_PREFIXES.wire}${wireCounter}`,
		}

		// Обновляем состояние
		set(state => {
			// Обновляем существующие узлы
			const updatedNodes = state.nodes.map(node => {
				if (node.id === wire.startNodeId) {
					// В начальном узле заменяем старый провод на первый новый
					return {
						...node,
						connectedElements: node.connectedElements
							.filter(id => id !== wireId)
							.concat(wire1Id),
					}
				}
				if (node.id === wire.endNodeId) {
					// В конечном узле заменяем старый провод на второй новый
					return {
						...node,
						connectedElements: node.connectedElements
							.filter(id => id !== wireId)
							.concat(wire2Id),
					}
				}
				return node
			})

			// Добавляем новый узел
			const newNode = {
				id: nodeId,
				position,
				connectedElements: [wire1Id, wire2Id],
				name: nodeName,
			}

			// Удаляем старый провод и добавляем два новых
			const updatedElements = state.elements
				.filter(element => element.id !== wireId)
				.concat([wire1, wire2])

			return {
				elements: updatedElements,
				nodes: [...updatedNodes, newNode],
				// Выделяем новый узел, если мы находимся в режиме размещения элементов
				selectedElementId:
					state.selectedElementId === wireId ? null : state.selectedElementId,
				selectedNodeId: state.placementMode.active
					? null
					: state.selectedNodeId,
				// Обновляем счетчики
				nameCounters: {
					...state.nameCounters,
					nodes: nodeCounter,
					elements: {
						...state.nameCounters.elements,
						wire: wireCounter,
					},
				},
			}
		})

		return nodeId
	},

	updateNodePosition: (id, position) =>
		set(state => {
			// Проверяем, изменилась ли позиция существенно
			const currentNode = state.nodes.find(node => node.id === id)

			// Проверяем наличие узла
			if (!currentNode) return state

			// Создаем копию позиции для предотвращения мутации
			const newPosition = {
				x: position.x,
				y: position.y,
			}

			// Обновляем позицию узла
			const updatedNodes = state.nodes.map(node =>
				node.id === id ? { ...node, position: newPosition } : node
			)

			return { nodes: updatedNodes }
		}),

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
			},
		}),

	cancelPlacement: () =>
		set({
			placementMode: {
				active: false,
				elementType: null,
				startNodeId: null,
			},
		}),

	setPlacementStartNode: nodeId =>
		set(state => ({
			placementMode: {
				...state.placementMode,
				startNodeId: nodeId,
			},
		})),

	placeElement: endNodeId =>
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

			// Проверяем, что начальный и конечный узлы не совпадают
			if (startNodeId === endNodeId) {
				return state
			}

			// Увеличиваем счетчик для типа элемента
			const counter = state.nameCounters.elements[elementType] + 1

			// Создаем имя для элемента
			const elementName = `${ELEMENT_NAME_PREFIXES[elementType]}${counter}`

			// Создаем новый элемент
			const rotation = calculateAngle(state.nodes, startNodeId, endNodeId)

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
				}
			} else if (elementType === 'switch') {
				// Создаем ключ по умолчанию в выключенном состоянии
				// isOpen = true (разомкнут) соответствует value = 0 (выключен)
				newElement = {
					type: 'switch',
					startNodeId,
					endNodeId,
					rotation,
					value: 0, // 0 - выключен
					unit: '',
					name: elementName,
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
				}
			}

			// Обновляем узлы, добавляя к ним ссылку на новый элемент
			const newElementId = uuidv4()
			const updatedNodes = state.nodes.map(node => {
				if (node.id === startNodeId || node.id === endNodeId) {
					return {
						...node,
						connectedElements: [...node.connectedElements, newElementId],
					}
				}
				return node
			})

			// Обновляем счетчик
			const updatedCounters = {
				...state.nameCounters,
				elements: {
					...state.nameCounters.elements,
					[elementType]: counter,
				},
			}

			return {
				elements: [
					...state.elements,
					{ ...newElement, id: newElementId } as AnyCircuitElement,
				],
				nodes: updatedNodes,
				placementMode: {
					active: false,
					elementType: null,
					startNodeId: null,
				},
				nameCounters: updatedCounters,
			}
		}),

	findNodeAtPosition: (position, threshold = 15) => {
		const nodes = get().nodes
		for (const node of nodes) {
			if (distanceBetween(node.position, position) <= threshold) {
				return node
			}
		}
		return null
	},

	// Добавляем метод для поиска ближайшего провода
	findClosestWire: (position: Position, threshold = 10) => {
		const elements = get().elements
		const nodes = get().nodes

		// Сначала проверяем, есть ли рядом узел
		const nearbyNode = get().findNodeAtPosition(position, threshold)

		// Если узел найден, приоритезируем его и не ищем провода
		if (nearbyNode) {
			return null
		}

		let closestWire = null
		let minDistance = threshold
		let closestPoint = null

		// Ищем только провода
		const wires = elements.filter(element => element.type === 'wire')

		for (const wire of wires) {
			const startNode = nodes.find(node => node.id === wire.startNodeId)
			const endNode = nodes.find(node => node.id === wire.endNodeId)

			if (!startNode || !endNode) continue

			const { distance, closestPoint: point } = distanceToLine(
				startNode.position,
				endNode.position,
				position
			)

			if (distance < minDistance) {
				minDistance = distance
				closestWire = wire
				closestPoint = point
			}
		}

		return closestWire && closestPoint
			? { wire: closestWire, point: closestPoint, distance: minDistance }
			: null
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
}))
