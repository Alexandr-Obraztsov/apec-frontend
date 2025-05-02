import React from 'react'
import { MathJaxContext } from 'better-react-mathjax'
import { CircuitSolutionResult, SolutionItem } from '../services/api'
import { mathJaxConfig } from '../utils/mathConfig'
import { DebugInfo } from '../utils/debug'
import Loading from './Loading'
import ResultTable from './ResultTable'
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
	solutionResult: string | null
	formattedResult: SolutionItem[]
	debugInfo: string | null
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
	solutionResult,
	formattedResult,
	debugInfo,
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
						) : solutionEquations ? (
							<EquationList equations={solutionEquations} />
						) : solutionResult ? (
							<div>
								<p>Результаты расчета:</p>
								{formattedResult.length > 0 ? (
									<ResultTable formattedResult={formattedResult} />
								) : (
									<pre>{solutionResult}</pre>
								)}
							</div>
						) : (
							<p>Нет данных для отображения.</p>
						)}

						{/* Отладочная информация */}
						{!isLoading && debugInfo && <DebugInfo debugInfo={debugInfo} />}
					</PopupBody>
				</PopupContent>
			</PopupOverlay>
		</MathJaxContext>
	)
}

export default CircuitSolutionModal
