import React from 'react'
import styled from 'styled-components'
import { VoltageElement, Node } from '../../types'
import CircuitValue from '../CircuitValue'

interface VoltageProps {
	element: VoltageElement
	startNode: Node
	endNode: Node
	selected: boolean
}

const VoltageContainer = styled.g<{ selected: boolean }>`
	stroke: ${({ selected }) =>
		selected ? 'var(--primary-color)' : 'var(--text-primary)'};
	stroke-width: 2px;
	fill: none;
`

const VoltageCircle = styled.circle`
	fill: white;
	stroke-width: 2px;
`

const Arrow = styled.polygon`
	fill: var(--text-primary);
	stroke: none;
`

const Voltage: React.FC<VoltageProps> = ({
	element,
	startNode,
	endNode,
	selected,
}) => {
	// Вычисляем угол между узлами
	const dx = endNode.position.x - startNode.position.x
	const dy = endNode.position.y - startNode.position.y
	const angle = (Math.atan2(dy, dx) * 180) / Math.PI

	// Вычисляем центр для размещения источника напряжения
	const centerX = (startNode.position.x + endNode.position.x) / 2
	const centerY = (startNode.position.y + endNode.position.y) / 2

	// Расчет длины линии (расстояние между узлами)
	const length = Math.sqrt(dx * dx + dy * dy)

	// Размер источника напряжения
	const voltageBodySize = 30
	const circleRadius = 15

	// Вычисляем длину проводов по обе стороны от источника
	const wireLength = (length - voltageBodySize) / 2

	// Создаем трансформацию для поворота компонента
	const transform = `translate(${centerX}, ${centerY}) rotate(${angle})`

	// Форматирование значения напряжения в единицах СИ (В)
	const formatValue = (value: number, unit: string) => {
		if (unit === 'В') {
			if (value >= 1000) {
				return `${(value / 1000).toFixed(1)} кВ`
			} else if (value < 1 && value >= 0.001) {
				return `${(value * 1000).toFixed(0)} мВ`
			} else if (value < 0.001) {
				return `${(value * 1000000).toFixed(0)} мкВ`
			}
		}
		return `${value} ${unit}`
	}

	const valueText = formatValue(element.value, element.unit)

	return (
		<VoltageContainer selected={selected} transform={transform}>
			{/* Левый провод */}
			<line
				x1={-voltageBodySize / 2 - wireLength}
				y1='0'
				x2={-circleRadius}
				y2='0'
			/>

			{/* Круг батареи */}
			<VoltageCircle cx='0' cy='0' r={circleRadius} />

			{/* Стрелка внутри источника напряжения */}
			<line x1='-10' y1='0' x2='10' y2='0' strokeWidth='1.5' />
			<Arrow
				points='0,-6 10,0 0,6'
				style={{
					fill: selected ? 'var(--primary-color)' : 'var(--text-primary)',
				}}
			/>

			{/* Правый провод */}
			<line
				x1={circleRadius}
				y1='0'
				x2={voltageBodySize / 2 + wireLength}
				y2='0'
			/>

			{/* Значение текстом с фоном */}
			<CircuitValue value={valueText} angle={angle} yOffset={20} width={40} />
		</VoltageContainer>
	)
}

export default Voltage
