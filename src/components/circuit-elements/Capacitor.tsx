import React, { useMemo } from 'react'
import styled from 'styled-components'
import { CapacitorElement, Node } from '../../types'
import CircuitValue from '../CircuitValue'

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
	transition: stroke 0.1s ease, stroke-width 0.1s ease, fill 0.1s ease;
`

const CapacitorPlate = styled.line<{ selected: boolean }>`
	stroke: ${({ selected }) =>
		selected ? 'var(--primary-color)' : 'var(--text-primary)'};
	stroke-width: 3px;
	stroke-linecap: round;
`

// Форматирование значения конденсатора в единицах СИ (Ф)
const formatValue = (value: number, unit: string) => {
	if (unit === 'Ф') {
		if (value >= 1) {
			return `${value.toFixed(0)} Ф`
		} else if (value >= 0.001) {
			return `${(value * 1000).toFixed(0)} мФ`
		} else if (value >= 0.000001) {
			return `${(value * 1000000).toFixed(0)} мкФ`
		} else if (value >= 0.000000001) {
			return `${(value * 1000000000).toFixed(0)} нФ`
		} else {
			return `${(value * 1000000000000).toFixed(0)} пФ`
		}
	}
	return `${value} ${unit}`
}

const CapacitorComponent = ({
	element,
	startNode,
	endNode,
	selected,
}: CapacitorProps) => {
	// Мемоизируем все вычисления
	const { angle, wireLength, capacitorBodySize, transform, valueText } =
		useMemo(() => {
			// Вычисляем угол между узлами
			const dx = endNode.position.x - startNode.position.x
			const dy = endNode.position.y - startNode.position.y
			// Округляем угол до 2 знаков после запятой
			const angle = parseFloat(
				((Math.atan2(dy, dx) * 180) / Math.PI).toFixed(2)
			)

			// Вычисляем центр для размещения конденсатора (округляем для стабильности)
			const centerX = parseFloat(
				((startNode.position.x + endNode.position.x) / 2).toFixed(1)
			)
			const centerY = parseFloat(
				((startNode.position.y + endNode.position.y) / 2).toFixed(1)
			)

			// Расчет длины линии (расстояние между узлами)
			const length = Math.sqrt(dx * dx + dy * dy)

			// Размер тела конденсатора
			const capacitorBodySize = 10

			// Вычисляем длину проводов по обе стороны от тела конденсатора
			const wireLength = parseFloat(
				((length - capacitorBodySize) / 2).toFixed(1)
			)

			// Создаем трансформацию для поворота компонента
			const transform = `translate(${centerX}, ${centerY}) rotate(${angle})`

			// Форматированное значение
			const valueText = formatValue(element.value, element.unit)

			return {
				angle,
				wireLength,
				capacitorBodySize,
				transform,
				valueText,
			}
		}, [
			startNode.position.x,
			startNode.position.y,
			endNode.position.x,
			endNode.position.y,
			element.value,
			element.unit,
		])

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
			<CircuitValue value={valueText} angle={angle} yOffset={20} />
		</CapacitorContainer>
	)
}

// Применяем мемоизацию к компоненту
const Capacitor = React.memo(CapacitorComponent)

export default Capacitor
