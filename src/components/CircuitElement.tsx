import React, { useState } from 'react'
import { AnyCircuitElement } from '../types'
import { useCircuitStore } from '../store/circuitStore'
import Wire from './circuit-elements/Wire'
import Resistor from './circuit-elements/Resistor'
import Capacitor from './circuit-elements/Capacitor'
import Inductor from './circuit-elements/Inductor'
import Voltage from './circuit-elements/Voltage'

interface CircuitElementProps {
	element: AnyCircuitElement
	isHighlighted?: boolean
}

const CircuitElement: React.FC<CircuitElementProps> = ({
	element,
	isHighlighted = false,
}) => {
	const selectedElementId = useCircuitStore(state => state.selectedElementId)
	const highlightedElementId = useCircuitStore(
		state => state.highlightedElementId
	)
	const selectElement = useCircuitStore(state => state.selectElement)
	const nodes = useCircuitStore(state => state.nodes)
	const [isHovered, setIsHovered] = useState(false)

	const selected = selectedElementId === element.id
	const highlighted = highlightedElementId === element.id

	// Находим узлы для элемента
	const startNode = nodes.find(node => node.id === element.startNodeId)
	const endNode = nodes.find(node => node.id === element.endNodeId)

	// Если узлы не найдены, не рендерим элемент
	if (!startNode || !endNode) {
		return null
	}

	// Обработчик клика по элементу
	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation()

		// Выделяем элемент
		selectElement(element.id)
	}

	// Обработчики наведения
	const handleMouseEnter = () => {
		setIsHovered(true)
	}

	const handleMouseLeave = () => {
		setIsHovered(false)
	}

	// Рендер конкретного компонента на основе типа элемента
	const renderElement = () => {
		switch (element.type) {
			case 'wire':
				return (
					<Wire
						element={element}
						startNode={startNode}
						endNode={endNode}
						selected={selected}
						isHighlighted={isHighlighted || isHovered || highlighted}
					/>
				)
			case 'resistor':
				return (
					<Resistor
						element={element}
						startNode={startNode}
						endNode={endNode}
						selected={selected || isHovered || highlighted}
					/>
				)
			case 'capacitor':
				return (
					<Capacitor
						element={element}
						startNode={startNode}
						endNode={endNode}
						selected={selected || isHovered || highlighted}
					/>
				)
			case 'inductor':
				return (
					<Inductor
						element={element}
						startNode={startNode}
						endNode={endNode}
						selected={selected || isHovered || highlighted}
					/>
				)
			case 'voltage':
				return (
					<Voltage
						element={element}
						startNode={startNode}
						endNode={endNode}
						selected={selected || isHovered || highlighted}
					/>
				)
			default:
				return null
		}
	}

	return (
		<g
			onClick={handleClick}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			style={{
				cursor: 'pointer',
				pointerEvents: 'all',
			}}
		>
			{renderElement()}
		</g>
	)
}

export default CircuitElement
