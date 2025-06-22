import React from 'react'
import styled from 'styled-components'
import { CurrentElement, Node } from '../../types'
import CircuitValue from '../CircuitValue'
import { formatValue } from '../../utils/formatters'

interface CurrentProps {
	element: CurrentElement
	startNode: Node
	endNode: Node
	selected: boolean
}

const CurrentContainer = styled.g<{ selected: boolean }>`
	stroke: ${({ selected }) =>
		selected ? 'var(--primary-color)' : 'var(--text-primary)'};
	stroke-width: 2px;
	fill: none;
`

const CurrentCircle = styled.circle`
	fill: white;
	stroke-width: 2px;
`

const Arrow = styled.polygon`
	fill: var(--text-primary);
	stroke: none;
`

const Current: React.FC<CurrentProps> = ({
	element,
	startNode,
	endNode,
	selected,
}) => {
	// Вычисляем угол между узлами
	const dx = endNode.position.x - startNode.position.x
	const dy = endNode.position.y - startNode.position.y
	const angle = (Math.atan2(dy, dx) * 180) / Math.PI

	// Вычисляем центр для размещения источника тока
	const centerX = (startNode.position.x + endNode.position.x) / 2
	const centerY = (startNode.position.y + endNode.position.y) / 2

	// Расчет длины линии (расстояние между узлами)
	const length = Math.sqrt(dx * dx + dy * dy)

	// Размер источника тока
	const currentBodySize = 30
	const circleRadius = 15

	// Вычисляем длину проводов по обе стороны от источника
	const wireLength = (length - currentBodySize) / 2

	// Создаем трансформацию для поворота компонента
	const transform = `translate(${centerX}, ${centerY}) rotate(${angle})`

	const valueText = `${formatValue(element.value, element.unit)} ${
		element.name
	}`

	return (
		<CurrentContainer selected={selected} transform={transform}>
			{/* Левый провод */}
			<line
				x1={-currentBodySize / 2 - wireLength}
				y1='0'
				x2={-circleRadius}
				y2='0'
			/>

			{/* Круг источника тока */}
			<CurrentCircle cx='0' cy='0' r={circleRadius} />

			{/* Символ источника тока (двойная стрелка) */}
			<Arrow
				points='-10,0 0,-6 0,6'
				style={{
					fill: selected ? 'var(--primary-color)' : 'var(--text-primary)',
				}}
			/>

			{/* Дополнительная линия - знак источника тока */}
			<line x1='-8' y1='0' x2='8' y2='0' strokeWidth='1.5' />

			{/* Правый провод */}
			<line
				x1={circleRadius}
				y1='0'
				x2={currentBodySize / 2 + wireLength}
				y2='0'
			/>

			{/* Значение текстом с фоном */}
			<CircuitValue value={valueText} angle={angle} yOffset={20} width={40} />
		</CurrentContainer>
	)
}

export default Current
