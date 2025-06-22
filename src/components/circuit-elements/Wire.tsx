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
	const { formattedValue, angle, centerX, centerY } = useMemo(() => {
		// Вычисляем центр между узлами для отображения значения
		const centerX = (startNode.position.x + endNode.position.x) / 2
		const centerY = (startNode.position.y + endNode.position.y) / 2

		// Используем угол поворота из элемента (уже рассчитан по направлению)
		const angle = element.rotation

		// Получаем форматированное значение с именем
		const formattedValue = `${formatValue(element.value, element.unit)} ${
			element.name
		}`

		return { formattedValue, angle, centerX, centerY }
	}, [
		startNode,
		endNode,
		element.rotation,
		element.value,
		element.unit,
		element.name,
	])

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
						cx={centerX}
						cy={centerY}
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
