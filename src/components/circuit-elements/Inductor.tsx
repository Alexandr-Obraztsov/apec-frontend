import React from 'react'
import styled from 'styled-components'
import { InductorElement, Node } from '../../types'
import CircuitValue from '../CircuitValue'

interface InductorProps {
	element: InductorElement
	startNode: Node
	endNode: Node
	selected: boolean
}

const InductorContainer = styled.g<{ selected: boolean }>`
	stroke: ${({ selected }) =>
		selected ? 'var(--primary-color)' : 'var(--text-primary)'};
	stroke-width: 2px;
	fill: none;
	transition: var(--transition);
`

const InductorPath = styled.path<{ selected: boolean }>`
	stroke: ${({ selected }) =>
		selected ? 'var(--primary-color)' : 'var(--text-primary)'};
	fill: none;
	stroke-width: 2px;
`

const Inductor: React.FC<InductorProps> = ({
	element,
	startNode,
	endNode,
	selected,
}) => {
	// Вычисляем угол между узлами
	const dx = endNode.position.x - startNode.position.x
	const dy = endNode.position.y - startNode.position.y
	const angle = (Math.atan2(dy, dx) * 180) / Math.PI

	// Вычисляем центр для размещения катушки
	const centerX = (startNode.position.x + endNode.position.x) / 2
	const centerY = (startNode.position.y + endNode.position.y) / 2

	// Расчет длины линии (расстояние между узлами)
	const length = Math.sqrt(dx * dx + dy * dy)

	// Размер тела катушки индуктивности
	const inductorBodySize = 40

	// Вычисляем длину проводов по обе стороны от тела катушки
	const wireLength = (length - inductorBodySize) / 2

	// Создаем трансформацию для поворота компонента
	const transform = `translate(${centerX}, ${centerY}) rotate(${angle})`

	// Создаем более гладкую кривую для катушки
	const arcRadius = 6
	const inductorPath = `
		M${-inductorBodySize / 2},0 
		C${-inductorBodySize / 2 + arcRadius},-8 ${
		-inductorBodySize / 2 + arcRadius * 2
	},8 ${-inductorBodySize / 2 + arcRadius * 3},0
		C${-inductorBodySize / 2 + arcRadius * 4},-8 ${
		-inductorBodySize / 2 + arcRadius * 5
	},8 ${-inductorBodySize / 2 + arcRadius * 6},0
		C${-inductorBodySize / 2 + arcRadius * 7},-8 ${
		-inductorBodySize / 2 + arcRadius * 8
	},8 ${-inductorBodySize / 2 + arcRadius * 9},0
	`

	// Форматирование значения
	const formatValue = (value: number, unit: string) => {
		if (unit === 'мГн') {
			if (value >= 1000) {
				return `${(value / 1000).toFixed(1)} Гн`
			} else if (value < 1) {
				return `${(value * 1000).toFixed(0)} мкГн`
			}
		}
		return `${value} ${unit}`
	}

	const valueText = formatValue(element.value, element.unit)

	return (
		<InductorContainer selected={selected} transform={transform}>
			{/* Левый провод */}
			<line
				x1={-inductorBodySize / 2 - wireLength}
				y1='0'
				x2={-inductorBodySize / 2}
				y2='0'
			/>

			{/* Катушка индуктивности */}
			<InductorPath d={inductorPath} selected={selected} />

			{/* Правый провод */}
			<line
				x1={inductorBodySize / 2}
				y1='0'
				x2={inductorBodySize / 2 + wireLength}
				y2='0'
			/>

			{/* Значение текстом с фоном */}
			<CircuitValue value={valueText} angle={angle} yOffset={10} />
		</InductorContainer>
	)
}

export default Inductor
