import React, { memo, useMemo } from 'react'
import styled from 'styled-components'
import { InductorElement, Node, FIXED_ELEMENT_LENGTH } from '../../types'
import CircuitValue from '../CircuitValue'
import { formatValue } from '../../utils/formatters'

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

const Inductor: React.FC<InductorProps> = memo(
	({ element, startNode, endNode, selected }) => {
		// Вычисляем все характеристики элемента с мемоизацией
		const elementProps = useMemo(() => {
			// Вычисляем центр для размещения катушки
			const centerX = (startNode.position.x + endNode.position.x) / 2
			const centerY = (startNode.position.y + endNode.position.y) / 2

			// Используем угол поворота из элемента (уже рассчитан по направлению)
			const angle = element.rotation

			// Размер тела катушки
			const inductorBodySize = 30
			const coilRadius = 6
			const coilCount = 4

			// Вычисляем длину проводов по обе стороны от тела катушки
			const wireLength = (FIXED_ELEMENT_LENGTH - inductorBodySize) / 2

			// Создаем трансформацию для поворота компонента
			const transform = `translate(${centerX}, ${centerY}) rotate(${angle})`

			// Создаем путь для спиралей катушки
			let coilPath = ''
			const coilSpacing = inductorBodySize / coilCount
			for (let i = 0; i < coilCount; i++) {
				const x = -inductorBodySize / 2 + i * coilSpacing + coilSpacing / 2
				coilPath += `M ${
					x - coilRadius
				},0 A ${coilRadius},${coilRadius} 0 0,1 ${x + coilRadius},0 `
			}

			return {
				angle,
				centerX,
				centerY,
				inductorBodySize,
				wireLength,
				transform,
				coilPath,
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
			<InductorContainer selected={selected} transform={elementProps.transform}>
				{/* Левый провод */}
				<line
					x1={-elementProps.inductorBodySize / 2 - elementProps.wireLength}
					y1='0'
					x2={-elementProps.inductorBodySize / 2}
					y2='0'
				/>

				{/* Спирали катушки */}
				<path
					d={elementProps.coilPath}
					stroke={selected ? 'var(--primary-color)' : 'var(--text-primary)'}
					strokeWidth={2}
					fill='none'
				/>

				{/* Правый провод */}
				<line
					x1={elementProps.inductorBodySize / 2}
					y1='0'
					x2={elementProps.inductorBodySize / 2 + elementProps.wireLength}
					y2='0'
				/>

				{/* Значение текстом с фоном */}
				<CircuitValue
					value={valueText}
					angle={elementProps.angle}
					yOffset={20}
				/>
			</InductorContainer>
		)
	}
)

export default Inductor
