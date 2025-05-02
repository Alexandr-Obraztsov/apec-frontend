import React from 'react'
import styled from 'styled-components'
import { MathJaxContext, MathJax } from 'better-react-mathjax'
import { CircuitSolutionResult, SolutionItem } from '../services/api'

// Стили для попапа
const PopupOverlay = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.65);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 2000;
	backdrop-filter: blur(2px);
`

const PopupContent = styled.div`
	background-color: white;
	padding: 0;
	border-radius: 12px;
	box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
	width: 650px;
	max-width: 95%;
	max-height: 90vh;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	animation: fadeIn 0.3s ease-out;

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
`

const PopupHeader = styled.div`
	font-size: 18px;
	font-weight: 600;
	padding: 18px 20px;
	background: linear-gradient(135deg, #3a8040 0%, #4daf53 100%);
	color: white;
	display: flex;
	justify-content: space-between;
	align-items: center;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`

const PopupBody = styled.div`
	overflow-y: auto;
	padding: 20px;
	flex: 1;
`

const PopupCloseButton = styled.button`
	background: transparent;
	border: none;
	font-size: 18px;
	padding: 0;
	width: 30px;
	height: 30px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	color: white;
	border-radius: 50%;
	transition: all 0.2s;
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

const LoadingContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 50px 0;
	color: #333;
	text-align: center;
`

const LoadingText = styled.p`
	margin-top: 20px;
	font-size: 16px;
	color: #555;
`

const LoadingSpinner = styled.div`
	display: inline-block;
	width: 50px;
	height: 50px;
	border: 4px solid rgba(75, 175, 80, 0.1);
	border-top: 4px solid #4baf50;
	border-radius: 50%;
	animation: spin 1.2s cubic-bezier(0.5, 0.1, 0.5, 0.9) infinite;

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
`

// Стили для отображения формул
const EquationCard = styled.div`
	margin-bottom: 20px;
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
	margin-bottom: 16px;
	align-items: flex-start;
	padding: 4px 0;
`

const EquationLabel = styled.div`
	width: 120px;
	font-weight: 500;
	color: #333;
	padding-top: 8px;
`

const EquationValue = styled.div`
	flex: 1;
	padding-left: 16px;

	/* Стили для MathJax формул */
	mjx-container {
		font-size: 1.5em;
		color: #000000;
		margin: 0.5em 0;
		overflow-x: visible;
		max-width: none !important;
	}
`

// Настройка MathJax для корректного отображения формул
const mathJaxConfig = {
	tex: {
		inlineMath: [['$', '$']],
		displayMath: [['$$', '$$']],
		processEscapes: true,
		tags: 'ams',
	},
	svg: {
		fontCache: 'global',
		scale: 1.3,
		minScale: 1.0,
		matchFontHeight: false,
		mtextInheritFont: false,
	},
}

// Компонент для отображения уравнений
const EquationDisplay = ({ tex }: { tex: string }) => {
	// Преобразуем формулу в красивый LaTeX формат
	const processedTex = prettifyEquation(tex)

	return <MathJax dynamic>{`$$${processedTex}$$`}</MathJax>
}

// Функция для преобразования уравнения в красивый формат LaTeX
const prettifyEquation = (equation: string): string => {
	// Если это просто число, вернем его без изменений
	if (/^-?\d+(\.\d+)?$/.test(equation.trim())) {
		return equation.trim()
	}

	// Шаг 1: Исправляем известные шаблоны выражений
	let texEquation = equation.trim()

	// Шаг 2: Заменяем простые дроби на \frac{}{} формат
	// Например: 1/400 -> \frac{1}{400}
	texEquation = texEquation.replace(/(\d+)\/(\d+)/g, '\\frac{$1}{$2}')

	// Шаг 3: Заменяем выражения вида n - k * x на n - k \cdot x
	texEquation = texEquation.replace(
		/(\d+)\s*-\s*(\d+)\s*\*\s*([a-zA-Z])/g,
		'$1 - $2 \\cdot $3'
	)

	// Шаг 4: Заменяем выражения вида n + k * x на n + k \cdot x
	texEquation = texEquation.replace(
		/(\d+)\s*\+\s*(\d+)\s*\*\s*([a-zA-Z])/g,
		'$1 + $2 \\cdot $3'
	)

	// Шаг 5: Исправляем запись экспонент
	// Формат: e^(-kt/n) или exp(-kt/n)
	texEquation = texEquation
		// Преобразуем exp(-число * t/число) в красивую экспоненту
		.replace(
			/exp\(\s*-\s*(\d+)\s*\*\s*t\s*\/\s*(\d+)\s*\)/g,
			'e^{-\\frac{$1t}{$2}}'
		)
		// Преобразуем exp(-число t/число) в красивую экспоненту (без *)
		.replace(/exp\(\s*-\s*(\d+)\s*t\s*\/\s*(\d+)\s*\)/g, 'e^{-\\frac{$1t}{$2}}')
		// Преобразуем e^-число*t/число в правильный формат
		.replace(/e\^\s*-\s*(\d+)\s*\*\s*t\s*\/\s*(\d+)/g, 'e^{-\\frac{$1t}{$2}}')

	// Шаг 6: Исправляем выражения с дробями внутри экспонент
	texEquation = texEquation
		// Например: 5 * e^(-20t/3) / 18
		.replace(
			/(\d+)\s*\*\s*e\^\{\s*-\\frac\{(\d+)t\}\{(\d+)\}\s*\}\s*\/\s*(\d+)/g,
			'\\frac{$1 \\cdot e^{-\\frac{$2t}{$3}}}{$4}'
		)
		// Например: e^(-20t/3) / 18
		.replace(
			/e\^\{\s*-\\frac\{(\d+)t\}\{(\d+)\}\s*\}\s*\/\s*(\d+)/g,
			'\\frac{e^{-\\frac{$1t}{$2}}}{$3}'
		)

	// Шаг 7: Исправляем смешанные выражения
	texEquation = texEquation
		// Например: 5/2 - 5 * e^(-20t/3) / 18
		.replace(
			/(\\frac\{\d+\}\{\d+\})\s*-\s*(\d+)\s*\*\s*e\^\{([^}]+)\}\s*\/\s*(\d+)/g,
			'$1 - \\frac{$2 \\cdot e^{$3}}{$4}'
		)
		// Например: 5/2 + 5 * e^(-20t/3) / 18
		.replace(
			/(\\frac\{\d+\}\{\d+\})\s*\+\s*(\d+)\s*\*\s*e\^\{([^}]+)\}\s*\/\s*(\d+)/g,
			'$1 + \\frac{$2 \\cdot e^{$3}}{$4}'
		)

	// Шаг 8: Обрабатываем уже частично форматированные выражения
	if (texEquation.includes('\\cdot') || texEquation.includes('e^{\\frac{')) {
		texEquation = texEquation
			// Случай: 5/2 - 5\cdot e^{-\frac{20t}{3}}/18
			.replace(
				/(\\frac\{\d+\}\{\d+\})\s*-\s*(\d+)\\cdot\s*e\^\{([^}]+)\}\/(\d+)/g,
				'$1 - \\frac{$2 \\cdot e^{$3}}{$4}'
			)
			// Случай: 5/2 + 5\cdot e^{-\frac{20t}{3}}/18
			.replace(
				/(\\frac\{\d+\}\{\d+\})\s*\+\s*(\d+)\\cdot\s*e\^\{([^}]+)\}\/(\d+)/g,
				'$1 + \\frac{$2 \\cdot e^{$3}}{$4}'
			)
	}

	// Шаг 9: Заменяем оператор * на \cdot
	texEquation = texEquation.replace(/(\d+)\s*\*\s*(\d+|\w+)/g, '$1 \\cdot $2')

	// Шаг 10: Добавляем пробелы вокруг операторов
	texEquation = texEquation
		.replace(/([0-9])([+\u002D])/g, '$1 $2')
		.replace(/([+\u002D])([0-9])/g, '$1 $2')

	// Финальные корректировки
	texEquation = texEquation
		.replace(/\s+/g, ' ') // Нормализация пробелов
		.trim()

	return texEquation
}

/**
 * Функция форматирования для обратной совместимости
 * @type {(equation: string) => string}
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const formatEquation = prettifyEquation

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
		<MathJaxContext config={mathJaxConfig}>
			<PopupOverlay>
				<PopupContent>
					<PopupHeader>
						<div>{isLoading ? 'Расчет схемы' : 'Результаты расчета'}</div>
						<PopupCloseButton onClick={onClose}>×</PopupCloseButton>
					</PopupHeader>
					<PopupBody>
						{isLoading ? (
							<LoadingContainer>
								<LoadingSpinner />
								<LoadingText>
									Выполняется расчет электрической схемы...
								</LoadingText>
							</LoadingContainer>
						) : error ? (
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
						{!isLoading && debugInfo && (
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
		</MathJaxContext>
	)
}

export default CircuitSolutionModal
