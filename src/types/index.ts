export type ElementType =
	| 'wire'
	| 'resistor'
	| 'capacitor'
	| 'inductor'
	| 'voltage'
	| 'current'
	| 'switch'

// Направления для размещения элементов (только 4 направления)
export type Direction = 'up' | 'down' | 'left' | 'right'

// Фиксированная длина элементов (в пикселях)
export const FIXED_ELEMENT_LENGTH = 200

export interface Position {
	x: number
	y: number
}

// Функция для получения конечной позиции по направлению
export const getEndPosition = (
	startPos: Position,
	direction: Direction
): Position => {
	switch (direction) {
		case 'up':
			return { x: startPos.x, y: startPos.y - FIXED_ELEMENT_LENGTH }
		case 'down':
			return { x: startPos.x, y: startPos.y + FIXED_ELEMENT_LENGTH }
		case 'left':
			return { x: startPos.x - FIXED_ELEMENT_LENGTH, y: startPos.y }
		case 'right':
			return { x: startPos.x + FIXED_ELEMENT_LENGTH, y: startPos.y }
		default:
			return startPos
	}
}

// Функция для получения угла поворота по направлению
export const getRotationByDirection = (direction: Direction): number => {
	switch (direction) {
		case 'up':
			return -90
		case 'down':
			return 90
		case 'left':
			return 180
		case 'right':
			return 0
		default:
			return 0
	}
}

// Функция для получения противоположного направления
export const getOppositeDirection = (direction: Direction): Direction => {
	switch (direction) {
		case 'up':
			return 'down'
		case 'down':
			return 'up'
		case 'left':
			return 'right'
		case 'right':
			return 'left'
		default:
			return direction
	}
}

export interface Node {
	id: string
	position: Position
	connectedElements: string[] // Массив ID элементов, подключенных к этому узлу
	name: string // Имя узла, например "N1", "N2", и т.д.
}

export interface CircuitElement {
	id: string
	type: ElementType
	startNodeId: string
	endNodeId: string
	value: number | string
	unit: string
	rotation: number
	name: string // Имя элемента, например "R1", "C2", и т.д.
	direction: Direction // Направление элемента
}

export interface WireElement extends CircuitElement {
	type: 'wire'
}

export interface ResistorElement extends CircuitElement {
	type: 'resistor'
}

export interface CapacitorElement extends CircuitElement {
	type: 'capacitor'
}

export interface InductorElement extends CircuitElement {
	type: 'inductor'
}

export interface VoltageElement extends CircuitElement {
	type: 'voltage'
}

export interface CurrentElement extends CircuitElement {
	type: 'current'
}

export interface SwitchElement extends CircuitElement {
	type: 'switch'
	isOpen: boolean
}

export type AnyCircuitElement =
	| WireElement
	| ResistorElement
	| CapacitorElement
	| InductorElement
	| VoltageElement
	| CurrentElement
	| SwitchElement

// Префиксы имен для различных типов элементов
export const ELEMENT_NAME_PREFIXES: Record<ElementType, string> = {
	wire: 'W',
	resistor: 'R',
	capacitor: 'C',
	inductor: 'L',
	voltage: 'V',
	current: 'I',
	switch: 'SW',
}

export const ELEMENT_UNIT = {
	wire: '',
	resistor: 'Ом',
	capacitor: 'Ф',
	inductor: 'Гн',
	voltage: 'В',
	current: 'А',
}
// Префикс для имен узлов
export const NODE_NAME_PREFIX = ''

// Интерфейсы для LCapy формата
export interface LCapyElement {
	name: string
	type: ElementType
	startNode: string
	endNode: string
	value: number | string
	direction: Direction
	isOpen?: boolean // для switch элементов
}

export interface LCapyCircuit {
	elements: LCapyElement[]
	nodes: string[]
	circuitString: string
	topology: {
		loops: string[][]
		branches: string[][]
	}
}

// Интерфейсы для сохранения цепей
export interface SavedCircuit {
	id: string
	name: string
	description?: string
	createdAt: string
	updatedAt: string
	circuit: {
		nodes: Node[]
		elements: AnyCircuitElement[]
	}
	metadata: {
		canvasSize: { width: number; height: number }
		viewBox: { x: number; y: number; width: number; height: number }
		version: string
	}
}
