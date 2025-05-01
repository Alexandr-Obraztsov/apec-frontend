import React, { memo, useState, useMemo } from 'react'
import { AnyCircuitElement } from '../types'
import { useCircuitStore } from '../store/circuitStore'
import Wire from './circuit-elements/Wire'
import Resistor from './circuit-elements/Resistor'
import Capacitor from './circuit-elements/Capacitor'
import Inductor from './circuit-elements/Inductor'
import Voltage from './circuit-elements/Voltage'
import Switch from './circuit-elements/Switch'

interface CircuitElementProps {
	element: AnyCircuitElement
	isHighlighted?: boolean
}

const CircuitElement: React.FC<CircuitElementProps> = memo(
	({ element, isHighlighted = false }) => {
		const selectedElementId = useCircuitStore(state => state.selectedElementId)
		const highlightedElementId = useCircuitStore(
			state => state.highlightedElementId
		)
		const selectElement = useCircuitStore(state => state.selectElement)
		const nodes = useCircuitStore(state => state.nodes)
		const [isHovered, setIsHovered] = useState(false)

		const selected = selectedElementId === element.id
		const highlighted = highlightedElementId === element.id

		// Находим узлы для элемента - мемоизируем для предотвращения повторных поисков
		const { startNode, endNode } = useMemo(() => {
			const start = nodes.find(node => node.id === element.startNodeId)
			const end = nodes.find(node => node.id === element.endNodeId)
			return { startNode: start, endNode: end }
		}, [nodes, element.startNodeId, element.endNodeId])

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
				case 'switch':
					return (
						<Switch
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
				className='draggable-container'
				data-element-id={element.id}
				data-start-node-id={element.startNodeId}
				data-end-node-id={element.endNodeId}
			>
				{renderElement()}
			</g>
		)
	}
)

export default CircuitElement
