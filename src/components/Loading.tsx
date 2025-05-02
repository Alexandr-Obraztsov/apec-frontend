import React from 'react'
import {
	LoadingContainer,
	LoadingText,
	LoadingSpinner,
} from '../styles/components/CircuitSolutionModal.styles'

interface LoadingProps {
	text?: string
}

/**
 * Компонент для отображения индикатора загрузки
 */
export const Loading: React.FC<LoadingProps> = ({
	text = 'Выполняется расчет электрической схемы...',
}) => {
	return (
		<LoadingContainer>
			<LoadingSpinner />
			<LoadingText>{text}</LoadingText>
		</LoadingContainer>
	)
}

export default Loading
