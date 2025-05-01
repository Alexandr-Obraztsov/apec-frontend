import React from 'react'
import styled from 'styled-components'
import { CapacitorElement, Node } from '../../types'

interface CapacitorProps {
	element: CapacitorElement
	startNode: Node
	endNode: Node
	selected: boolean
}

const CapacitorContainer = styled.g<{ selected: boolean }>`
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
	font-weight: 600;
`

const ValueBackground = styled.rect`
	fill: white;
	stroke: var(--border-color);
	stroke-width: 1px;
	rx: 4px;
	opacity: 0.85;
`

const CapacitorPlate = styled.line<{ selected: boolean }>`
	stroke: ${({ selected }) =>
		selected ? 'var(--primary-color)' : 'var(--text-primary)'};
	stroke-width: 3px;
	stroke-linecap: round;
`

const Capacitor: React.FC<CapacitorProps> = ({
	element,
	startNode,
	endNode,
	selected,
}) => {
	// Вычисляем угол между узлами
	const dx = endNode.position.x - startNode.position.x
	const dy = endNode.position.y - startNode.position.y
	const angle = (Math.atan2(dy, dx) * 180) / Math.PI

	// Вычисляем центр для размещения конденсатора
	const centerX = (startNode.position.x + endNode.position.x) / 2
	const centerY = (startNode.position.y + endNode.position.y) / 2

	// Расчет длины линии (расстояние между узлами)
	const length = Math.sqrt(dx * dx + dy * dy)

	// Размер тела конденсатора
	const capacitorBodySize = 10

	// Вычисляем длину проводов по обе стороны от тела конденсатора
	const wireLength = (length - capacitorBodySize) / 2

	// Создаем трансформацию для поворота компонента
	const transform = `translate(${centerX}, ${centerY}) rotate(${angle})`

	// Форматирование значения
	const formatValue = (value: number, unit: string) => {
		if (unit === 'мкФ') {
			if (value >= 1000) {
				return `${(value / 1000).toFixed(1)} мФ`
			} else if (value < 1) {
				return `${(value * 1000).toFixed(0)} нФ`
			}
		}
		return `${value} ${unit}`
	}

	const valueText = formatValue(element.value, element.unit)

	return (
		<CapacitorContainer selected={selected} transform={transform}>
			{/* Левый провод */}
			<line
				x1={-capacitorBodySize / 2 - wireLength}
				y1='0'
				x2={-capacitorBodySize / 2}
				y2='0'
			/>

			{/* Пластины конденсатора */}
			<CapacitorPlate
				x1={-capacitorBodySize / 2}
				y1='-12'
				x2={-capacitorBodySize / 2}
				y2='12'
				selected={selected}
			/>
			<CapacitorPlate
				x1={capacitorBodySize / 2}
				y1='-12'
				x2={capacitorBodySize / 2}
				y2='12'
				selected={selected}
			/>

			{/* Правый провод */}
			<line
				x1={capacitorBodySize / 2}
				y1='0'
				x2={capacitorBodySize / 2 + wireLength}
				y2='0'
			/>

			{/* Значение текстом с фоном */}
			<g transform={`rotate(-${angle})`}>
				<ValueBackground x='-30' y='20' width='60' height='20' />
				<ValueText x='0' y='35'>
					{valueText}
				</ValueText>
			</g>
		</CapacitorContainer>
	)
}

export default Capacitor
