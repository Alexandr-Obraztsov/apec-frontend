import React from 'react'
import styled from 'styled-components'
import { ResistorElement, Node } from '../../types'

interface ResistorProps {
	element: ResistorElement
	startNode: Node
	endNode: Node
	selected: boolean
}

const ResistorContainer = styled.g<{ selected: boolean }>`
	stroke: ${({ selected }) =>
		selected ? 'var(--primary-color)' : 'var(--text-primary)'};
	stroke-width: 2px;
	fill: none;
	transition: var(--transition);
`

const ValueText = styled.text`
	font-family: var(--font-family);
	font-size: 14px;
	fill: var(--text-primary);
	text-anchor: middle;
	font-weight: 400;
`

const ValueBackground = styled.rect`
	fill: white;
	stroke: var(--border-color);
	stroke-width: 1px;
	rx: 4px;
	opacity: 0.85;
`

const Resistor: React.FC<ResistorProps> = ({
	element,
	startNode,
	endNode,
	selected,
}) => {
	// Вычисляем угол между узлами
	const dx = endNode.position.x - startNode.position.x
	const dy = endNode.position.y - startNode.position.y
	const angle = (Math.atan2(dy, dx) * 180) / Math.PI

	// Вычисляем центр для размещения резистора
	const centerX = (startNode.position.x + endNode.position.x) / 2
	const centerY = (startNode.position.y + endNode.position.y) / 2

	// Расчет длины линии (расстояние между узлами)
	const length = Math.sqrt(dx * dx + dy * dy)

	// Размер тела резистора
	const resistorBodySize = 30

	// Вычисляем длину проводов по обе стороны от тела резистора
	const wireLength = (length - resistorBodySize) / 2

	// Создаем трансформацию для поворота компонента
	const transform = `translate(${centerX}, ${centerY}) rotate(${angle})`

	// Форматирование значения (например, 1000 Ом -> 1 кОм)
	const formatValue = (value: number, unit: string) => {
		if (unit === 'Ом' && value >= 1000) {
			return `${(value / 1000).toFixed(0)} кОм`
		}
		return `${value} ${unit}`
	}

	const valueText = formatValue(element.value, element.unit)

	return (
		<ResistorContainer selected={selected} transform={transform}>
			{/* Левый провод */}
			<line
				x1={-resistorBodySize / 2 - wireLength}
				y1='0'
				x2={-resistorBodySize / 2}
				y2='0'
			/>

			{/* Тело резистора (прямоугольник) */}
			<rect
				x={-resistorBodySize / 2}
				y={-7.5}
				width={resistorBodySize}
				height={15}
				rx={2}
				fill={selected ? 'var(--primary-light)' : 'white'}
				stroke={selected ? 'var(--primary-color)' : 'var(--text-primary)'}
			/>

			{/* Правый провод */}
			<line
				x1={resistorBodySize / 2}
				y1='0'
				x2={resistorBodySize / 2 + wireLength}
				y2='0'
			/>

			{/* Значение текстом с фоном */}
			<g transform={`rotate(-${angle})`}>
				<ValueBackground x='-30' y='15' width='60' height='20' />
				<ValueText x='0' y='30'>
					{valueText}
				</ValueText>
			</g>
		</ResistorContainer>
	)
}

export default Resistor
