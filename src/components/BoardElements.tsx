import { memo } from 'react'
import {
	AnyCircuitElement,
	Node,
	Direction,
	Position,
	ElementType,
	getRotationByDirection,
} from '../types'
import CircuitElement from './CircuitElement'
import NodeComponent from './NodeComponent'
import { useCircuitStore } from '../store/circuitStore'

// Интерфейс для предварительного элемента
interface PreviewElement {
	startPosition: Position
	endPosition: Position
	direction: Direction
	elementType: ElementType
}

interface BoardElementsProps {
	selectedNodeId: string | null
	onDirectionClick: (direction: Direction) => void
	previewElement: PreviewElement | null
}

// Компонент для отображения предварительного элемента
const PreviewElementRenderer = memo(
	({ previewElement }: { previewElement: PreviewElement }) => {
		const { direction, elementType } = previewElement

		// Создаем временный элемент для отображения
		const tempElement: AnyCircuitElement = {
			id: 'preview',
			name: 'Preview',
			type: elementType,
			startNodeId: 'preview-start',
			endNodeId: 'preview-end',
			value: elementType === 'wire' ? 0 : 1,
			rotation: getRotationByDirection(direction),
			direction: direction,
			...(elementType === 'switch' && { isOpen: false }),
		} as AnyCircuitElement

		return (
			<g opacity={0.5}>
				<CircuitElement element={tempElement} isHighlighted={false} />
			</g>
		)
	}
)

// Мемоизированный компонент для отображения узлов
interface NodesRendererProps {
	nodes: Node[]
	selectedNodeId: string | null
	hoverNodeId: string | null
	placementStartNodeId: string | null
	highlightedNodeId: string | null
}

export const NodesRenderer = memo(
	({
		nodes,
		selectedNodeId,
		hoverNodeId,
		placementStartNodeId,
		highlightedNodeId,
	}: NodesRendererProps) => {
		return (
			<>
				{nodes.map(node => {
					const isSelected = selectedNodeId === node.id
					const isHovered = hoverNodeId === node.id
					const isPlacementStart = placementStartNodeId === node.id
					const isHighlighted = highlightedNodeId === node.id

					return (
						<NodeComponent
							key={node.id}
							node={node}
							isSelected={isSelected}
							isHovered={isHovered}
							isPlacementStart={isPlacementStart}
							isHighlighted={isHighlighted}
						/>
					)
				})}
			</>
		)
	}
)

// Мемоизированный компонент для отображения элементов схемы
interface ElementsRendererProps {
	elements: AnyCircuitElement[]
	highlightedElementId: string | null
}

export const ElementsRenderer = memo(
	({ elements, highlightedElementId }: ElementsRendererProps) => {
		return (
			<>
				{elements.map(element => (
					<CircuitElement
						key={element.id}
						element={element}
						isHighlighted={element.id === highlightedElementId}
					/>
				))}
			</>
		)
	}
)

// Компонент для отображения индикаторов направлений
interface DirectionIndicatorsProps {
	centerPosition: Position
	availableDirections: Direction[]
	hoveredDirection: Direction | null
	onDirectionClick: (direction: Direction) => void
	onDirectionHover: (direction: Direction | null) => void
}

export const DirectionIndicators = memo(
	({
		centerPosition,
		availableDirections,
		hoveredDirection,
		onDirectionClick,
		onDirectionHover,
	}: DirectionIndicatorsProps) => {
		const indicatorDistance = 50

		const getIndicatorPosition = (direction: Direction): Position => {
			switch (direction) {
				case 'up':
					return {
						x: centerPosition.x,
						y: centerPosition.y - indicatorDistance,
					}
				case 'down':
					return {
						x: centerPosition.x,
						y: centerPosition.y + indicatorDistance,
					}
				case 'left':
					return {
						x: centerPosition.x - indicatorDistance,
						y: centerPosition.y,
					}
				case 'right':
					return {
						x: centerPosition.x + indicatorDistance,
						y: centerPosition.y,
					}
			}
		}

		const getArrowPath = (direction: Direction): string => {
			switch (direction) {
				case 'up':
					return 'M0,-6 L-3,0 L3,0 Z'
				case 'down':
					return 'M0,6 L-3,0 L3,0 Z'
				case 'left':
					return 'M-6,0 L0,-3 L0,3 Z'
				case 'right':
					return 'M6,0 L0,-3 L0,3 Z'
			}
		}

		return (
			<g>
				{availableDirections.map(direction => {
					const indicatorPos = getIndicatorPosition(direction)
					const isHovered = hoveredDirection === direction

					return (
						<g key={direction}>
							{/* Тонкая пунктирная линия от центра к индикатору */}
							<line
								x1={centerPosition.x}
								y1={centerPosition.y}
								x2={indicatorPos.x}
								y2={indicatorPos.y}
								stroke={
									isHovered
										? 'var(--primary-color)'
										: 'rgba(100, 116, 139, 0.4)'
								}
								strokeWidth={1}
								strokeDasharray='2 2'
								opacity={0.8}
							/>

							{/* Индикатор направления */}
							<g
								transform={`translate(${indicatorPos.x}, ${indicatorPos.y})`}
								style={{ cursor: 'pointer' }}
								onClick={() => onDirectionClick(direction)}
								onMouseEnter={() => onDirectionHover(direction)}
								onMouseLeave={() => onDirectionHover(null)}
							>
								{/* Внешний круг (только при наведении) */}
								{isHovered && (
									<circle
										r={14}
										fill='none'
										stroke='var(--primary-color)'
										strokeWidth={1}
										opacity={0.3}
									/>
								)}

								{/* Основной круг */}
								<circle
									r={8}
									fill={
										isHovered
											? 'var(--primary-color)'
											: 'rgba(255, 255, 255, 0.9)'
									}
									stroke={
										isHovered
											? 'var(--primary-color)'
											: 'rgba(100, 116, 139, 0.5)'
									}
									strokeWidth={1.5}
									style={{
										filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
										transition: 'all 0.2s ease',
									}}
								/>

								{/* Стрелка */}
								<path
									d={getArrowPath(direction)}
									fill={isHovered ? 'white' : 'var(--primary-color)'}
									stroke='none'
									style={{
										transition: 'fill 0.2s ease',
									}}
								/>
							</g>
						</g>
					)
				})}
			</g>
		)
	}
)

export const BoardElements = memo(
	({ selectedNodeId, previewElement }: BoardElementsProps) => {
		const { elements, nodes } = useCircuitStore()

		return (
			<g>
				{/* Обычные элементы */}
				{elements.map(element => (
					<CircuitElement
						key={element.id}
						element={element}
						isHighlighted={false}
					/>
				))}

				{/* Узлы */}
				{nodes.map(node => (
					<NodeComponent
						key={node.id}
						node={node}
						isSelected={selectedNodeId === node.id}
						isHovered={false}
						isPlacementStart={false}
						isHighlighted={false}
					/>
				))}

				{/* Предварительный элемент */}
				{previewElement && (
					<PreviewElementRenderer previewElement={previewElement} />
				)}
			</g>
		)
	}
)
