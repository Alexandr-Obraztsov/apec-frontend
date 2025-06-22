import React, { memo, useMemo } from 'react'
import styled from 'styled-components'
import { ResistorElement, Node, FIXED_ELEMENT_LENGTH } from '../../types'
import CircuitValue from '../CircuitValue'
import { formatValue } from '../../utils/formatters'

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
	transition: stroke 0.1s ease, stroke-width 0.1s ease, fill 0.1s ease;
`

const Resistor: React.FC<ResistorProps> = memo(
	({ element, startNode, endNode, selected }) => {
		// Вычисляем все характеристики элемента с мемоизацией
		const elementProps = useMemo(() => {
			// Вычисляем центр для размещения резистора
			const centerX = (startNode.position.x + endNode.position.x) / 2
			const centerY = (startNode.position.y + endNode.position.y) / 2

			// Используем угол поворота из элемента (уже рассчитан по направлению)
			const angle = element.rotation

			// Размер тела резистора
			const resistorBodySize = 30

			// Вычисляем длину проводов по обе стороны от тела резистора
			const wireLength = (FIXED_ELEMENT_LENGTH - resistorBodySize) / 2

			// Создаем трансформацию для поворота компонента
			const transform = `translate(${centerX}, ${centerY}) rotate(${angle})`

			return {
				angle,
				centerX,
				centerY,
				resistorBodySize,
				wireLength,
				transform,
			}
		}, [
			startNode.position.x,
			startNode.position.y,
			endNode.position.x,
			endNode.position.y,
			element.rotation,
		])

		// Мемоизируем форматированное значение
		const valueText = useMemo(
			() => `${formatValue(element.value, element.unit)} ${element.name}`,
			[element.name, element.value, element.unit]
		)

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
					value={valueText}
					angle={elementProps.angle}
					yOffset={15}
				/>
			</ResistorContainer>
		)
	}
)

export default Resistor
