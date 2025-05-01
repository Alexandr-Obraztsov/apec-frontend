import React, { memo, useMemo } from 'react'
import styled from 'styled-components'
import { ResistorElement, Node } from '../../types'
import CircuitValue from '../CircuitValue'

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

const Resistor: React.FC<ResistorProps> = memo(
	({ element, startNode, endNode, selected }) => {
		// Вычисляем все характеристики элемента с мемоизацией
		const elementProps = useMemo(() => {
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
			const valueText = formatValue(element.value, element.unit)

			return {
				dx,
				dy,
				angle,
				centerX,
				centerY,
				length,
				resistorBodySize,
				wireLength,
				transform,
				valueText,
			}
		}, [startNode.position, endNode.position, element.value, element.unit])

		// Форматирование значения (например, 1000 Ом -> 1 кОм)
		const formatValue = (value: number, unit: string) => {
			if (unit === 'Ом' && value >= 1000) {
				return `${(value / 1000).toFixed(0)} кОм`
			}
			return `${value} ${unit}`
		}

		return (
			<ResistorContainer selected={selected} transform={elementProps.transform}>
				{/* Левый провод */}
				<line
					x1={-elementProps.resistorBodySize / 2 - elementProps.wireLength}
					y1='0'
					x2={-elementProps.resistorBodySize / 2}
					y2='0'
				/>

				{/* Тело резистора (прямоугольник) */}
				<rect
					x={-elementProps.resistorBodySize / 2}
					y={-7.5}
					width={elementProps.resistorBodySize}
					height={15}
					rx={2}
					fill={selected ? 'var(--primary-light)' : 'white'}
					stroke={selected ? 'var(--primary-color)' : 'var(--text-primary)'}
				/>

				{/* Правый провод */}
				<line
					x1={elementProps.resistorBodySize / 2}
					y1='0'
					x2={elementProps.resistorBodySize / 2 + elementProps.wireLength}
					y2='0'
				/>

				{/* Значение текстом с фоном */}
				<CircuitValue
					value={elementProps.valueText}
					angle={elementProps.angle}
					yOffset={15}
				/>
			</ResistorContainer>
		)
	}
)

export default Resistor
