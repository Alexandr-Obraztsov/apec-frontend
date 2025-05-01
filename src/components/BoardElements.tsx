import { memo } from 'react'
import { AnyCircuitElement, Node } from '../types'
import CircuitElement from './CircuitElement'
import NodeComponent from './NodeComponent'

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

// Мемоизированный компонент для отображения временного узла
interface TempNodeProps {
	position: { x: number; y: number } | null
}

export const TempNode = memo(({ position }: TempNodeProps) => {
	if (!position) return null

	return (
		<>
			<circle
				cx={position.x}
				cy={position.y}
				r={6}
				fill='var(--primary-light)'
				stroke='var(--primary-color)'
				strokeWidth={2}
				opacity={0.9}
			/>
			<circle
				cx={position.x}
				cy={position.y}
				r={10}
				fill='none'
				stroke='var(--primary-color)'
				strokeWidth={1}
				opacity={0.5}
				strokeDasharray='2 2'
			/>
		</>
	)
})

// Мемоизированный компонент для отображения точки притяжения к проводу
interface WireSnapPointProps {
	position: { x: number; y: number } | null
}

export const WireSnapPoint = memo(({ position }: WireSnapPointProps) => {
	if (!position) return null

	return (
		<>
			<circle
				cx={position.x}
				cy={position.y}
				r={6}
				fill='var(--accent-light)'
				stroke='var(--accent-color)'
				strokeWidth={2}
				opacity={0.9}
			/>
			<circle
				cx={position.x}
				cy={position.y}
				r={12}
				fill='none'
				stroke='var(--accent-color)'
				strokeWidth={1}
				opacity={0.6}
				strokeDasharray='3 3'
			/>
		</>
	)
})

// Мемоизированный компонент для отображения линии предпросмотра при размещении
interface PlacementLineProps {
	startNode: Node | null
	endPosition: { x: number; y: number } | null
}

export const PlacementLineComponent = memo(
	({ startNode, endPosition }: PlacementLineProps) => {
		if (!startNode || !endPosition) return null

		return (
			<line
				x1={startNode.position.x}
				y1={startNode.position.y}
				x2={endPosition.x}
				y2={endPosition.y}
				stroke='var(--primary-color)'
				strokeWidth={2}
				strokeDasharray='5, 5'
			/>
		)
	}
)
