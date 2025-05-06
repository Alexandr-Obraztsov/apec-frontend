import React, { useMemo } from 'react'
import styled from 'styled-components'
import { WireElement, Node } from '../../types'
import CircuitValue from '../CircuitValue'
import { formatValue } from '../../utils/formatters'

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
	element,
	startNode,
	endNode,
	selected,
	isHighlighted = false,
}) => {
	// Вычисляем форматированное значение и угол для отображения
	const { formattedValue, angle } = useMemo(() => {
		// Вычисляем угол между узлами для отображения значения
		const dx = endNode.position.x - startNode.position.x
		const dy = endNode.position.y - startNode.position.y
		const angle = parseFloat(((Math.atan2(dy, dx) * 180) / Math.PI).toFixed(2))

		// Получаем форматированное значение с именем
		const formattedValue = `${formatValue(element.value, element.unit)} ${
			element.name
		}`

		return { formattedValue, angle }
	}, [startNode, endNode, element.value, element.unit, element.name])

	return (
		<>
			<WirePath
				d={`M ${startNode.position.x} ${startNode.position.y} L ${endNode.position.x} ${endNode.position.y}`}
				selected={selected}
				highlighted={isHighlighted}
			/>
			{selected && (
				<>
					<circle
						cx={(startNode.position.x + endNode.position.x) / 2}
						cy={(startNode.position.y + endNode.position.y) / 2}
						r={5}
						fill='var(--primary-color)'
						opacity={0.7}
					/>
					<CircuitValue value={formattedValue} angle={angle} yOffset={-25} />
				</>
			)}
		</>
	)
}

export default Wire
