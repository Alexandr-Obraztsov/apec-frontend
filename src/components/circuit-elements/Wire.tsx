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

const WirePath = styled.path<{ selected: boolean; highlighted: boolean }>`
	stroke: ${({ selected, highlighted }) => {
		if (selected) return 'var(--primary-color)'
		if (highlighted) return 'var(--accent-color)'
		return 'var(--text-primary)'
	}};
	stroke-width: ${({ selected, highlighted }) =>
		selected || highlighted ? 2.5 : 2};
	fill: none;
	stroke-linecap: round;
	transition: stroke 0.1s ease, stroke-width 0.1s ease;
`

const Wire: React.FC<WireProps> = ({
	startNode,
	endNode,
	selected,
	isHighlighted = false,
}) => {
	return (
		<>
			<WirePath
				d={`M ${startNode.position.x} ${startNode.position.y} L ${endNode.position.x} ${endNode.position.y}`}
				selected={selected}
				highlighted={isHighlighted}
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
