import React from 'react'
import styled from 'styled-components'
import { WireElement, Node } from '../../types'

interface WireProps {
	element: WireElement
	startNode: Node
	endNode: Node
	selected: boolean
	isHighlighted?: boolean
}

const StyledWire = styled.line<{ selected: boolean; isHighlighted?: boolean }>`
	stroke: ${({ selected, isHighlighted }) =>
		selected
			? 'var(--primary-color)'
			: isHighlighted
			? 'var(--accent-color)'
			: 'var(--text-primary)'};
	stroke-width: ${({ selected, isHighlighted }) =>
		selected ? '3px' : isHighlighted ? '3px' : '2px'};
	transition: var(--transition);
	stroke-linecap: round;
`

const Wire: React.FC<WireProps> = ({
	startNode,
	endNode,
	selected,
	isHighlighted = false,
}) => {
	return (
		<>
			<StyledWire
				x1={startNode.position.x}
				y1={startNode.position.y}
				x2={endNode.position.x}
				y2={endNode.position.y}
				selected={selected}
				isHighlighted={isHighlighted}
			/>
			{selected && (
				<circle
					cx={(startNode.position.x + endNode.position.x) / 2}
					cy={(startNode.position.y + endNode.position.y) / 2}
					r={5}
					fill='var(--primary-color)'
					opacity={0.7}
				/>
			)}
		</>
	)
}

export default Wire
