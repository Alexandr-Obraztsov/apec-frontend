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
	transition: stroke 0.1s ease, stroke-width 0.1s ease, fill 0.1s ease;
`

// Форматирование значения в единицах СИ (Ом)
const formatValue = (value: number, unit: string) => {
	if (unit === 'Ом') {
		if (value >= 1000000) {
			return `${(value / 1000000).toFixed(1)} МОм`
		} else if (value >= 1000) {
			return `${(value / 1000).toFixed(1)} кОм`
		}
	}
	return `${value} ${unit}`
}

const Resistor: React.FC<ResistorProps> = memo(
	({ element, startNode, endNode, selected }) => {
		// Вычисляем все характеристики элемента с мемоизацией
		const elementProps = useMemo(() => {
			// Вычисляем угол между узлами
			const dx = endNode.position.x - startNode.position.x
			const dy = endNode.position.y - startNode.position.y

			// Округляем угол до 2 знаков после запятой
			const angle = parseFloat(
				((Math.atan2(dy, dx) * 180) / Math.PI).toFixed(2)
			)

			// Вычисляем центр для размещения резистора (округляем для стабильности)
			const centerX = parseFloat(
				((startNode.position.x + endNode.position.x) / 2).toFixed(1)
			)
			const centerY = parseFloat(
				((startNode.position.y + endNode.position.y) / 2).toFixed(1)
			)

			// Расчет длины линии (расстояние между узлами)
			const length = Math.sqrt(dx * dx + dy * dy)

			// Размер тела резистора
			const resistorBodySize = 30

			// Вычисляем длину проводов по обе стороны от тела резистора (с округлением)
			const wireLength = parseFloat(
				((length - resistorBodySize) / 2).toFixed(1)
			)

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
		])

		// Мемоизируем форматированное значение
		const valueText = useMemo(
			() => formatValue(element.value, element.unit),
			[element.value, element.unit]
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
