import React, { useRef } from 'react'
import styled from 'styled-components'
import { Node } from '../types'
import { useCircuitStore } from '../store/circuitStore'

interface NodeComponentProps {
	node: Node
	isSelected: boolean
	isHovered: boolean
	isPlacementStart: boolean
	isHighlighted?: boolean
}

interface NodeCircleProps {
	isSelected: boolean
	isHovered: boolean
	isPlacementStart: boolean
	isHighlighted?: boolean
}

const NodeCircle = styled.circle<NodeCircleProps>`
	fill: ${({ isSelected, isHovered, isPlacementStart, isHighlighted }) => {
		if (isPlacementStart) return 'var(--primary-color)'
		if (isSelected) return 'var(--accent-color)'
		if (isHighlighted) return 'var(--accent-light)'
		if (isHovered) return 'var(--primary-light)'
		return 'var(--surface-color)'
	}};

	stroke: ${({ isSelected, isHovered, isPlacementStart, isHighlighted }) => {
		if (isPlacementStart) return 'var(--primary-dark)'
		if (isSelected) return 'var(--accent-color)'
		if (isHighlighted) return 'var(--accent-color)'
		if (isHovered) return 'var(--primary-color)'
		return 'var(--border-color)'
	}};

	stroke-width: ${({ isSelected, isPlacementStart, isHighlighted }) =>
		isSelected || isPlacementStart || isHighlighted ? 2.5 : 1.5};

	cursor: pointer;
	transition: var(--transition);

	r: ${({ isSelected, isHovered, isPlacementStart, isHighlighted }) => {
		if (isPlacementStart) return 8
		if (isSelected) return 8
		if (isHighlighted) return 8
		if (isHovered) return 7
		return 6
	}};
`

// Внешняя окружность для выделенных и активных узлов
const NodeRing = styled.circle<NodeCircleProps>`
	fill: none;
	stroke: ${({ isSelected, isPlacementStart, isHighlighted }) => {
		if (isPlacementStart) return 'var(--primary-color)'
		if (isSelected) return 'var(--accent-color)'
		if (isHighlighted) return 'var(--accent-light)'
		return 'transparent'
	}};
	stroke-width: 1;
	stroke-dasharray: 3 2;
	opacity: 0.7;
	r: 12;
`

const NodeComponent: React.FC<NodeComponentProps> = ({
	node,
	isSelected,
	isHovered,
	isPlacementStart,
	isHighlighted = false,
}) => {
	const selectNode = useCircuitStore(state => state.selectNode)
	const updateNodePosition = useCircuitStore(state => state.updateNodePosition)
	const placementMode = useCircuitStore(state => state.placementMode)
	const setPlacementStartNode = useCircuitStore(
		state => state.setPlacementStartNode
	)

	const nodeRef = useRef<SVGCircleElement>(null)
	const [isDragging, setIsDragging] = React.useState(false)
	const [dragStartPosition, setDragStartPosition] = React.useState({
		x: 0,
		y: 0,
	})

	// Обработка клика по узлу
	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation()

		// Если в режиме размещения и первый узел не выбран
		if (placementMode.active && !placementMode.startNodeId) {
			setPlacementStartNode(node.id)
			return
		}

		// Если в режиме размещения и первый узел выбран - завершаем размещение
		if (
			placementMode.active &&
			placementMode.startNodeId &&
			placementMode.startNodeId !== node.id
		) {
			// Получаем функцию placeElement из store напрямую
			useCircuitStore.getState().placeElement(node.id)
			return
		}

		// В обычном режиме просто выбираем узел
		selectNode(node.id)
	}

	// Начало перетаскивания
	const handleMouseDown = (e: React.MouseEvent) => {
		// Только левая кнопка мыши
		if (e.button !== 0 || placementMode.active) return

		e.stopPropagation()
		setIsDragging(true)
		setDragStartPosition({ x: e.clientX, y: e.clientY })
	}

	// Перемещение при перетаскивании
	const handleMouseMove = (e: React.MouseEvent) => {
		if (!isDragging) return

		const dx = e.clientX - dragStartPosition.x
		const dy = e.clientY - dragStartPosition.y

		updateNodePosition(node.id, {
			x: node.position.x + dx,
			y: node.position.y + dy,
		})

		setDragStartPosition({ x: e.clientX, y: e.clientY })
	}

	// Завершение перетаскивания
	const handleMouseUp = () => {
		if (isDragging) {
			setIsDragging(false)
		}
	}

	// Глобальные обработчики
	React.useEffect(() => {
		if (isDragging) {
			document.addEventListener('mousemove', handleMouseMoveGlobal)
			document.addEventListener('mouseup', handleMouseUp)
		}

		return () => {
			document.removeEventListener('mousemove', handleMouseMoveGlobal)
			document.removeEventListener('mouseup', handleMouseUp)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isDragging])

	// Глобальная версия handleMouseMove
	const handleMouseMoveGlobal = (e: MouseEvent) => {
		if (!isDragging) return

		const dx = e.clientX - dragStartPosition.x
		const dy = e.clientY - dragStartPosition.y

		updateNodePosition(node.id, {
			x: node.position.x + dx,
			y: node.position.y + dy,
		})

		setDragStartPosition({ x: e.clientX, y: e.clientY })
	}

	return (
		<g
			style={{
				cursor: isDragging ? 'grabbing' : 'grab',
				pointerEvents: 'all',
			}}
		>
			{(isSelected || isPlacementStart || isHighlighted) && (
				<NodeRing
					cx={node.position.x}
					cy={node.position.y}
					isSelected={isSelected}
					isHovered={isHovered}
					isPlacementStart={isPlacementStart}
					isHighlighted={isHighlighted}
				/>
			)}
			<NodeCircle
				ref={nodeRef}
				cx={node.position.x}
				cy={node.position.y}
				isSelected={isSelected}
				isHovered={isHovered}
				isPlacementStart={isPlacementStart}
				isHighlighted={isHighlighted}
				onClick={handleClick}
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
			/>

			{/* Отображение имени узла */}
			<text
				x={node.position.x}
				y={node.position.y - 15}
				textAnchor='middle'
				fill={isHighlighted ? 'var(--accent-color)' : 'var(--text-primary)'}
				fontSize='12'
				fontWeight={isHighlighted ? '600' : '500'}
			>
				{node.name}
			</text>
		</g>
	)
}

export default NodeComponent
