import React from 'react'
import styled from 'styled-components'

interface CircuitValueProps {
	value: string
	angle: number
	yOffset?: number
	width?: number
	height?: number
}

const ValueText = styled.text`
	font-family: var(--font-family);
	font-size: 12px;
	text-anchor: middle;
	font-weight: 300;
	letter-spacing: 3px;
`

const ValueBackground = styled.rect`
	fill: white;
	stroke: var(--border-color);
	stroke-width: 1px;
	rx: 4px;
	opacity: 0.85;
`

const CircuitValue: React.FC<CircuitValueProps> = ({
	value,
	angle,
	yOffset = 15,
	width = 60,
	height = 20,
}) => {
	// Убедимся, что angle - число и округлим его до 2 знаков после запятой
	// для предотвращения проблем с точностью вычислений
	const safeAngle = typeof angle === 'number' ? parseFloat(angle.toFixed(2)) : 0

	return (
		<g transform={`rotate(${safeAngle})`}>
			<ValueBackground
				x={-width / 2}
				y={yOffset}
				width={width}
				height={height}
			/>
			<ValueText x='0' y={yOffset + height / 2 + 5}>
				{value}
			</ValueText>
		</g>
	)
}

export default CircuitValue
