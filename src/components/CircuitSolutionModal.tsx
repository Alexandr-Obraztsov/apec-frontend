import React from 'react'
import { createPortal } from 'react-dom'
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

	return createPortal(
		<MathJaxContext config={mathJaxConfig}>
			<PopupOverlay onClick={onClose}>
				<PopupContent onClick={e => e.stopPropagation()}>
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
		</MathJaxContext>,
		document.body
	)
}

export default CircuitSolutionModal
