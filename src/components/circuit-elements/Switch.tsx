import React, { useMemo } from 'react'
import styled from 'styled-components'
import { SwitchElement, Node } from '../../types'
import CircuitValue from '../CircuitValue'

interface SwitchProps {
	element: SwitchElement
	startNode: Node
	endNode: Node
	selected: boolean
}

const SwitchContainer = styled.g<{ selected: boolean }>`
	stroke: ${({ selected }) =>
		selected ? 'var(--primary-color)' : 'var(--text-primary)'};
	stroke-width: 2px;
	fill: none;
	transition: stroke 0.1s ease, stroke-width 0.1s ease, fill 0.1s ease;
`

const SwitchLever = styled.line<{ selected: boolean; isOpen: boolean }>`
	stroke: ${({ selected }) =>
		selected ? 'var(--primary-color)' : 'var(--text-primary)'};
	stroke-width: 3px;
	transform-origin: 0px 0px;
	stroke-linecap: round;
`

const SwitchTerminal = styled.circle<{ selected: boolean }>`
	stroke: ${({ selected }) =>
		selected ? 'var(--primary-color)' : 'var(--text-primary)'};
	fill: ${({ selected }) => (selected ? 'var(--primary-light)' : 'white')};
	stroke-width: 2px;
`

const SwitchArrow = styled.path<{ selected: boolean }>`
	stroke: ${({ selected }) =>
		selected ? 'var(--primary-color)' : 'var(--text-primary)'};
	stroke-width: 1px;
	stroke-linecap: round;
	stroke-linejoin: round;
	fill: none;
`

const SwitchComponent: React.FC<SwitchProps> = ({
	element,
	startNode,
	endNode,
	selected,
}) => {
	// Мемоизация вычислений для предотвращения повторных расчетов
	const { wireLength, switchLength, transform, leverRotation, angle } =
		useMemo(() => {
			// Вычисляем угол между узлами
			const dx = endNode.position.x - startNode.position.x
			const dy = endNode.position.y - startNode.position.y
			const angle = parseFloat(
				((Math.atan2(dy, dx) * 180) / Math.PI).toFixed(2)
			)

			// Вычисляем центр для размещения ключа (округляем для стабильности)
			const centerX = parseFloat(
				((startNode.position.x + endNode.position.x) / 2).toFixed(1)
			)
			const centerY = parseFloat(
				((startNode.position.y + endNode.position.y) / 2).toFixed(1)
			)

			// Расчет длины линии (расстояние между узлами)
			const length = Math.sqrt(dx * dx + dy * dy)

			// Размер основной части ключа (увеличен)
			const switchLength = 30

			// Вычисляем длину проводов по обе стороны от ключа
			const wireLength = parseFloat(((length - switchLength) / 2).toFixed(1))

			// Создаем трансформацию для поворота компонента
			const transform = `translate(${centerX}, ${centerY}) rotate(${angle})`

			// Угол для рычага ключа (в зависимости от состояния)
			const leverRotation = element.isOpen ? -45 : 0

			return {
				angle,
				wireLength,
				switchLength,
				transform,
				leverRotation,
			}
		}, [
			startNode.position.x,
			startNode.position.y,
			endNode.position.x,
			endNode.position.y,
			element.isOpen,
		])

	// Форматированное название элемента
	const valueText = element.name

	return (
		<SwitchContainer selected={selected} transform={transform}>
			{/* Левый провод */}
			<line
				x1={-switchLength / 2 - wireLength}
				y1='0'
				x2={-switchLength / 2}
				y2='0'
			/>

			{/* Левая клемма */}
			<SwitchTerminal cx={-switchLength / 2} cy='0' r='4' selected={selected} />

			{/* Рычаг ключа */}
			<SwitchLever
				x1={-switchLength / 2}
				y1='0'
				x2={switchLength / 2}
				y2='0'
				transform={`rotate(${leverRotation}, ${-switchLength / 2}, 0)`}
				selected={selected}
				isOpen={element.isOpen}
			/>

			{/* Стрелка направления коммутации */}
			<SwitchArrow
				// M 0 4 - перемещение в начальную точку (0,4)
				// L 0 12 - линия вниз до точки (0,12)
				// L -3 8 - линия влево-вверх до точки (-3,8)
				// L 0 12 - возврат к точке (0,12)
				// L 3 8 - линия вправо-вверх до точки (3,8)
				d={
					element.isOpen
						? `M 0 -20 L 0 4 L -3 0 L 0 4 L 3 0`
						: `M 0 12 L 0 -12 L -3 -8 L 0 -12 L 3 -8`
				}
				selected={selected}
				transform={`rotate(${
					element.isOpen ? leverRotation + 30 : leverRotation
				}, ${-switchLength / 2}, 0)`}
			/>

			{/* Правая клемма */}
			<SwitchTerminal cx={switchLength / 2} cy='0' r='4' selected={selected} />

			{/* Правый провод */}
			<line
				x1={switchLength / 2}
				y1='0'
				x2={switchLength / 2 + wireLength}
				y2='0'
			/>

			{/* Имя элемента текстом с фоном */}
			<CircuitValue value={valueText} angle={angle} yOffset={20} />
		</SwitchContainer>
	)
}

// Применяем мемоизацию к компоненту
const Switch = React.memo(SwitchComponent)

export default Switch
