import React from 'react'
import { MathJaxContext } from 'better-react-mathjax'
import { CircuitSolutionResult } from '../services/api'
import { mathJaxConfig } from '../utils/mathConfig'
import Loading from './Loading'
import EquationList from './EquationList'
import ErrorMessage from './ErrorMessage'

// Импорт стилей
import {
	PopupOverlay,
	PopupContent,
	PopupHeader,
	PopupBody,
	PopupCloseButton,
} from '../styles/components/CircuitSolutionModal.styles'

interface CircuitSolutionModalProps {
	isOpen: boolean
	onClose: () => void
	isLoading: boolean
	error: string | null
	solutionEquations: CircuitSolutionResult | null
}

/**
 * Компонент модального окна для отображения результатов расчета схемы
 */
const CircuitSolutionModal: React.FC<CircuitSolutionModalProps> = ({
	isOpen,
	onClose,
	isLoading,
	error,
	solutionEquations,
}) => {
	if (!isOpen) return null

	return (
		<MathJaxContext config={mathJaxConfig}>
			<PopupOverlay>
				<PopupContent>
					<PopupHeader>
						<div>{isLoading ? 'Расчет схемы' : 'Результаты расчета'}</div>
						<PopupCloseButton onClick={onClose}>×</PopupCloseButton>
					</PopupHeader>
					<PopupBody>
						{isLoading ? (
							<Loading />
						) : error ? (
							<ErrorMessage message={error} title='Ошибка расчета' />
						) : (
							<EquationList equations={solutionEquations!} />
						)}
					</PopupBody>
				</PopupContent>
			</PopupOverlay>
		</MathJaxContext>
	)
}

export default CircuitSolutionModal
