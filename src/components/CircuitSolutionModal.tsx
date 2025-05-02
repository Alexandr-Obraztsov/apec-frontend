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

	// Базовая нормализация
	let texEquation = equation
		.trim()
		.replace(/\s+/g, ' ') // Нормализуем пробелы
		.replace(/\\\\/g, '\\') // Убираем двойные экранирования

	// БАЗОВЫЕ МАТЕМАТИЧЕСКИЕ ПРЕОБРАЗОВАНИЯ

	// 1. Преобразование экспоненты: exp(x) -> e^{x}
	texEquation = texEquation
		.replace(/exp\(\s*([^)]+)\s*\)/g, 'e^{$1}')
		// Специальный случай для отрицательных аргументов
		.replace(/exp\(\s*-\s*([^)]+)\s*\)/g, 'e^{-$1}')

	// 2. Преобразование корней: sqrt(x) -> \sqrt{x}
	texEquation = texEquation.replace(/sqrt\(\s*([^)]+)\s*\)/g, '\\sqrt{$1}')

	// 3. Преобразование дробей: a/b -> \frac{a}{b}
	// Сначала обрабатываем простые дроби с числами
	texEquation = texEquation.replace(/(\d+)\s*\/\s*(\d+)/g, '\\frac{$1}{$2}')

	// 4. Преобразование сложных дробей с выражениями
	// Находим и преобразуем выражения вида (a+b)/(c+d)
	texEquation = texEquation.replace(
		/\(([^()]+)\)\s*\/\s*\(([^()]+)\)/g,
		'\\frac{$1}{$2}'
	)

	// 5. Преобразование умножения: a*b -> a \cdot b
	texEquation = texEquation.replace(
		/(\d+|[a-zA-Z])\s*\*\s*(\d+|[a-zA-Z])/g,
		'$1 \\cdot $2'
	)

	// 6. Преобразование степеней: a^b -> a^{b} для многосимвольных степеней
	texEquation = texEquation.replace(
		/([a-zA-Z0-9])\^([a-zA-Z0-9][a-zA-Z0-9+\-*/]+)/g,
		'$1^{$2}'
	)

	// 7. Правильное форматирование отрицательных величин в дробях
	texEquation = texEquation.replace(/-\\frac/g, '-\\frac')

	// СПЕЦИАЛЬНЫЕ ПРЕОБРАЗОВАНИЯ ДЛЯ СЛОЖНЫХ ВЫРАЖЕНИЙ

	// 8. Обработка комплексных выражений с дробями и экспонентами

	// 8.1 Преобразование для выражений вида e^{x}/y
	texEquation = texEquation.replace(
		/e\^{([^}]+)}\s*\/\s*(\d+|\([^)]+\))/g,
		'\\frac{e^{$1}}{$2}'
	)

	// 8.2 Преобразование для a * e^{x}/b
	texEquation = texEquation.replace(
		/(\d+)\s*\\cdot\s*e\^{([^}]+)}\s*\/\s*(\d+)/g,
		'\\frac{$1 \\cdot e^{$2}}{$3}'
	)

	// 8.3 Преобразование для \frac{a}{b} +/- \frac{c*e^{x}}{d}
	texEquation = texEquation
		.replace(/(\\frac{[^}]+}{[^}]+})\s*\+\s*(\\frac{[^}]+}{[^}]+})/g, '$1 + $2')
		.replace(/(\\frac{[^}]+}{[^}]+})\s*-\s*(\\frac{[^}]+}{[^}]+})/g, '$1 - $2')

	// 9. Преобразование trig(x) -> \trig{x} для тригонометрических функций
	const trigFunctions = [
		'sin',
		'cos',
		'tan',
		'cot',
		'sec',
		'csc',
		'arcsin',
		'arccos',
		'arctan',
	]
	trigFunctions.forEach(func => {
		const pattern = new RegExp(`${func}\\(([^)]+)\\)`, 'g')
		texEquation = texEquation.replace(pattern, `\\${func}{$1}`)
	})

	// 10. Проверяем дроби внутри дробей и корректируем их
	if (texEquation.includes('\\frac') && texEquation.includes('}{')) {
		// Находим вложенные дроби и делаем их правильными
		texEquation = texEquation.replace(
			/\\frac{([^{}]*?)\\frac{([^{}]+)}{([^{}]+)}([^{}]*?)}{([^{}]+)}/g,
			'\\frac{$1\\frac{$2}{$3}$4}{$5}'
		)
	}

	// 11. Улучшаем вид чисел с умножением на t в экспонентах (например, 20t -> 20 \cdot t)
	texEquation = texEquation.replace(/(\d+)t/g, '$1 \\cdot t')

	// 12. Добавляем пробелы вокруг операторов для улучшения читаемости
	texEquation = texEquation
		.replace(/([0-9])([+\u002D])/g, '$1 $2')
		.replace(/([+\u002D])([0-9])/g, '$1 $2')

	// Финальная очистка и форматирование
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
