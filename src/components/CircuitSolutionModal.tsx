import React from 'react'
import styled from 'styled-components'
import { BlockMath } from 'react-katex'
import 'katex/dist/katex.min.css'
import { CircuitSolutionResult, SolutionItem } from '../services/api'

// Стили для попапа
const PopupOverlay = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 2000;
`

const PopupContent = styled.div`
	background-color: white;
	padding: 20px;
	border-radius: 8px;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
	width: 550px;
	max-width: 90%;
	max-height: 80vh;
	display: flex;
	flex-direction: column;
	overflow: hidden;
`

const PopupHeader = styled.div`
	font-size: 18px;
	font-weight: 600;
	margin-bottom: 15px;
	padding-bottom: 10px;
	border-bottom: 1px solid #eaeaea;
	display: flex;
	justify-content: space-between;
	align-items: center;
`

const PopupBody = styled.div`
	overflow-y: auto;
	padding-right: 5px;
	flex: 1;
`

const PopupCloseButton = styled.button`
	background: none;
	border: none;
	font-size: 18px;
	width: 28px;
	height: 28px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	color: #666;
	border-radius: 50%;
	transition: all 0.2s;

	&:hover {
		background-color: #f0f0f0;
		color: #333;
	}
`

const ResultTable = styled.table`
	width: 100%;
	border-collapse: collapse;
	margin-top: 15px;
`

const ResultRow = styled.tr`
	&:nth-child(odd) {
		background-color: rgba(0, 128, 0, 0.05);
	}
`

const ResultCell = styled.td`
	padding: 8px;
	border: 1px solid #ddd;
`

const ResultHeader = styled.th`
	padding: 10px;
	background-color: rgba(0, 128, 0, 0.1);
	color: #006400;
	font-weight: 500;
	text-align: left;
	border: 1px solid #ddd;
`

// Стили для отображения формул
const EquationCard = styled.div`
	margin-bottom: 16px;
	border: 1px solid #e0e0e0;
	border-radius: 8px;
	overflow: hidden;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`

const EquationHeader = styled.div`
	background-color: rgba(0, 128, 0, 0.1);
	padding: 10px 16px;
	font-weight: 600;
	border-bottom: 1px solid #e0e0e0;
	color: #006400;
`

const EquationBody = styled.div`
	padding: 16px;
	background-color: white;
`

const EquationRow = styled.div`
	display: flex;
	margin-bottom: 12px;
	align-items: center;
`

const EquationLabel = styled.div`
	width: 100px;
	font-weight: 500;
	color: #333;
`

const EquationValue = styled.div`
	flex: 1;
	padding-left: 16px;

	/* Стили для формул KaTeX */
	.katex {
		color: #000000;
		font-size: 1.1em;
	}

	.katex-display {
		margin: 0.5em 0;
		overflow-x: auto;
		padding: 5px 0;
	}
`

// Компонент для отображения уравнений
const EquationDisplay = ({ tex }: { tex: string }) => {
	// Обрабатываем формулу здесь
	const processedTex = formatEquation(tex)

	// Для отладки
	console.log('Исходная формула:', tex)
	console.log('Обработанная формула:', processedTex)

	return <BlockMath math={processedTex} />
}

// Функция для преобразования уравнения в формат LaTeX
const formatEquation = (equation: string): string => {
	// Если это просто число, вернем его без изменений
	if (/^-?\d+(\.\d+)?$/.test(equation.trim())) {
		return equation.trim()
	}

	// Заменяем входные паттерны на корректный LaTeX
	let texEquation = equation.trim()

	// Исправляем особые случаи в данных, которые видны на скриншоте
	if (texEquation.includes('\\cdot e^{\\frac{')) {
		// Формат вида "5\\cdot e^{\\frac{ - 20000t}{3}}/3"
		texEquation = texEquation.replace(
			/(\d+)\s*\+\s*(\d+)\\cdot e\^\{\\frac\{\s*-\s*(\d+)t\}\{(\d+)\}\}\/(\d+)/g,
			'$1 + \\frac{$2e^{-\\frac{$3t}{$4}}}{$5}'
		)

		texEquation = texEquation.replace(
			/(\d+)\\cdot e\^\{\\frac\{\s*-\s*(\d+)t\}\{(\d+)\}\}\/(\d+)/g,
			'\\frac{$1e^{-\\frac{$2t}{$3}}}{$4}'
		)

		texEquation = texEquation.replace(
			/-(\d+)\s*\+\s*(\d+)\\cdot e\^\{\\frac\{\s*-\s*(\d+)t\}\{(\d+)\}\}\/(\d+)/g,
			'-$1 + \\frac{$2e^{-\\frac{$3t}{$4}}}{$5}'
		)

		texEquation = texEquation.replace(
			/(\d+)\s*[+-]\s*(\d+)\\cdot e\^\{\\frac\{\s*-\s*(\d+)t\}\{(\d+)\}\}/g,
			'$1 $2e^{-\\frac{$3t}{$4}}'
		)
	}

	// Убираем неправильные экранирования и добавляем корректные пробелы
	texEquation = texEquation
		.replace(/\\\\/g, '\\') // Исправляем двойные экранирования
		.replace(/\s+/g, ' ') // Нормализуем пробелы
		.trim()

	return texEquation
}

interface CircuitSolutionModalProps {
	isOpen: boolean
	onClose: () => void
	error: string | null
	solutionEquations: CircuitSolutionResult | null
	solutionResult: string | null
	formattedResult: SolutionItem[]
	debugInfo: string | null
	isLoading?: boolean // Оставляем для совместимости, но не будем использовать
	onSolveClick?: () => void // Оставляем для совместимости, но не будем использовать
}

const CircuitSolutionModal: React.FC<CircuitSolutionModalProps> = ({
	isOpen,
	onClose,
	error,
	solutionEquations,
	solutionResult,
	formattedResult,
	debugInfo,
}) => {
	if (!isOpen) return null

	// Рендеринг результатов с уравнениями
	const renderEquations = () => {
		if (!solutionEquations) return null

		return (
			<div>
				<h3>Результаты расчета:</h3>
				{Object.entries(solutionEquations).map(([elementName, equations]) => (
					<EquationCard key={elementName}>
						<EquationHeader>Элемент: {elementName}</EquationHeader>
						<EquationBody>
							{Object.entries(equations).map(([eqName, eqValue]) => (
								<EquationRow key={eqName}>
									<EquationLabel>
										{eqName === 'i(t)' ? 'Ток:' : 'Напряжение:'}
									</EquationLabel>
									<EquationValue>
										<EquationDisplay tex={String(eqValue)} />
									</EquationValue>
								</EquationRow>
							))}
						</EquationBody>
					</EquationCard>
				))}
			</div>
		)
	}

	return (
		<PopupOverlay>
			<PopupContent>
				<PopupHeader>
					<div>Результаты расчета</div>
					<PopupCloseButton onClick={onClose}>×</PopupCloseButton>
				</PopupHeader>
				<PopupBody>
					{error ? (
						<p style={{ color: 'red' }}>{error}</p>
					) : solutionEquations ? (
						renderEquations()
					) : solutionResult ? (
						<div>
							<p>Результаты расчета:</p>
							{formattedResult.length > 0 ? (
								<ResultTable>
									<thead>
										<tr>
											<ResultHeader>Элемент</ResultHeader>
											<ResultHeader>Значение</ResultHeader>
											<ResultHeader>Единица измерения</ResultHeader>
										</tr>
									</thead>
									<tbody>
										{formattedResult.map((item, index) => (
											<ResultRow key={item.id || item.name || index}>
												<ResultCell>{item.name}</ResultCell>
												<ResultCell>{item.value}</ResultCell>
												<ResultCell>{item.unit}</ResultCell>
											</ResultRow>
										))}
									</tbody>
								</ResultTable>
							) : (
								<pre>{solutionResult}</pre>
							)}
						</div>
					) : (
						<p>Нет данных для отображения.</p>
					)}

					{/* Отладочная информация */}
					{debugInfo && (
						<div
							style={{
								marginTop: '20px',
								borderTop: '1px solid #ddd',
								paddingTop: '10px',
							}}
						>
							<details>
								<summary>Отладочная информация</summary>
								<pre
									style={{
										backgroundColor: '#f5f5f5',
										padding: '10px',
										borderRadius: '4px',
										fontSize: '12px',
										overflowX: 'auto',
									}}
								>
									{debugInfo}
								</pre>
							</details>
						</div>
					)}
				</PopupBody>
			</PopupContent>
		</PopupOverlay>
	)
}

export default CircuitSolutionModal
