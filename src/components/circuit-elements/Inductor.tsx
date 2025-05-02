import React, { useMemo } from 'react'
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
	transition: stroke 0.1s ease, stroke-width 0.1s ease, fill 0.1s ease;
`

const InductorPath = styled.path<{ selected: boolean }>`
	stroke: ${({ selected }) =>
		selected ? 'var(--primary-color)' : 'var(--text-primary)'};
	fill: none;
	stroke-width: 2px;
`

// Форматирование значения индуктора в единицах СИ (Гн)
const formatValue = (value: number, unit: string) => {
	if (unit === 'Гн') {
		if (value >= 1) {
			return `${value.toFixed(2)} Гн`
		} else if (value >= 0.001) {
			return `${(value * 1000).toFixed(0)} мГн`
		} else if (value >= 0.000001) {
			return `${(value * 1000000).toFixed(0)} мкГн`
		} else {
			return `${(value * 1000000000).toFixed(0)} нГн`
		}
	}
	return `${value} ${unit}`
}

const InductorComponent = ({
	element,
	startNode,
	endNode,
	selected,
}: InductorProps) => {
	// Мемоизируем все вычисления
	const {
		angle,
		wireLength,
		inductorBodySize,
		transform,
		inductorPath,
		valueText,
	} = useMemo(() => {
		// Вычисляем угол между узлами
		const dx = endNode.position.x - startNode.position.x
		const dy = endNode.position.y - startNode.position.y
		// Округляем угол до 2 знаков после запятой
		const angle = parseFloat(((Math.atan2(dy, dx) * 180) / Math.PI).toFixed(2))

		// Вычисляем центр для размещения индуктора (округляем для стабильности)
		const centerX = parseFloat(
			((startNode.position.x + endNode.position.x) / 2).toFixed(1)
		)
		const centerY = parseFloat(
			((startNode.position.y + endNode.position.y) / 2).toFixed(1)
		)

		// Расчет длины линии (расстояние между узлами)
		const length = Math.sqrt(dx * dx + dy * dy)

		// Размер тела катушки индуктивности
		const inductorBodySize = 40

		// Вычисляем длину проводов по обе стороны от тела катушки
		const wireLength = parseFloat(((length - inductorBodySize) / 2).toFixed(1))

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

		// Форматированное значение
		const valueText = `${formatValue(element.value, element.unit)} ${
			element.name
		}`

		return {
			angle,
			wireLength,
			inductorBodySize,
			transform,
			inductorPath,
			valueText,
		}
	}, [
		startNode.position.x,
		startNode.position.y,
		endNode.position.x,
		endNode.position.y,
		element.value,
		element.unit,
		element.name,
	])

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

// Применяем мемоизацию к компоненту
const Inductor = React.memo(InductorComponent)

export default Inductor
