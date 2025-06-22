import React, { memo, useMemo } from 'react'
import styled from 'styled-components'
import { CapacitorElement, Node, FIXED_ELEMENT_LENGTH } from '../../types'
import CircuitValue from '../CircuitValue'
import { formatValue } from '../../utils/formatters'

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

const Capacitor: React.FC<CapacitorProps> = memo(
	({ element, startNode, endNode, selected }) => {
		// Вычисляем все характеристики элемента с мемоизацией
		const elementProps = useMemo(() => {
			// Вычисляем центр для размещения конденсатора
			const centerX = (startNode.position.x + endNode.position.x) / 2
			const centerY = (startNode.position.y + endNode.position.y) / 2

			// Используем угол поворота из элемента (уже рассчитан по направлению)
			const angle = element.rotation

			// Размер тела конденсатора
			const capacitorBodySize = 20
			const plateSpacing = 4 // Расстояние между пластинами

			// Вычисляем длину проводов по обе стороны от тела конденсатора
			const wireLength = (FIXED_ELEMENT_LENGTH - capacitorBodySize) / 2

			// Создаем трансформацию для поворота компонента
			const transform = `translate(${centerX}, ${centerY}) rotate(${angle})`

			return {
				angle,
				centerX,
				centerY,
				capacitorBodySize,
				plateSpacing,
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
			<CapacitorContainer
				selected={selected}
				transform={elementProps.transform}
			>
				{/* Левый провод */}
				<line
					x1={-elementProps.capacitorBodySize / 2 - elementProps.wireLength}
					y1='0'
					x2={-elementProps.plateSpacing / 2}
					y2='0'
				/>

				{/* Левая пластина конденсатора */}
				<line
					x1={-elementProps.plateSpacing / 2}
					y1={-12}
					x2={-elementProps.plateSpacing / 2}
					y2={12}
					strokeWidth={3}
				/>

				{/* Правая пластина конденсатора */}
				<line
					x1={elementProps.plateSpacing / 2}
					y1={-12}
					x2={elementProps.plateSpacing / 2}
					y2={12}
					strokeWidth={3}
				/>

				{/* Правый провод */}
				<line
					x1={elementProps.plateSpacing / 2}
					y1='0'
					x2={elementProps.capacitorBodySize / 2 + elementProps.wireLength}
					y2='0'
				/>

				{/* Значение текстом с фоном */}
				<CircuitValue
					value={valueText}
					angle={elementProps.angle}
					yOffset={20}
				/>
			</CapacitorContainer>
		)
	}
)

export default Capacitor
