export type ElementType =
	| 'wire'
	| 'resistor'
	| 'capacitor'
	| 'inductor'
	| 'voltage'
	| 'switch'

export interface Position {
	x: number
	y: number
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
	value: number
	unit: string
	rotation: number
	name: string // Имя элемента, например "R1", "C2", и т.д.
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
	| SwitchElement

// Префиксы имен для различных типов элементов
export const ELEMENT_NAME_PREFIXES: Record<ElementType, string> = {
	wire: 'W',
	resistor: 'R',
	capacitor: 'C',
	inductor: 'L',
	voltage: 'V',
	switch: 'SW',
}

// Префикс для имен узлов
export const NODE_NAME_PREFIX = ''
