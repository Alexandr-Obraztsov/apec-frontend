import React, { useCallback, useState, useRef, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import { useCircuitStore } from '../store/circuitStore'
import { Position, Direction, getEndPosition } from '../types'
import {
	NodesRenderer,
	ElementsRenderer,
	DirectionIndicators,
} from './BoardElements'

const BoardContainer = styled.div`
	flex: 1;
	position: relative;
	overflow: hidden;
	background: linear-gradient(
		135deg,
		rgba(124, 58, 237, 0.05) 0%,
		rgba(139, 92, 246, 0.05) 25%,
		rgba(59, 130, 246, 0.05) 50%,
		rgba(30, 64, 175, 0.05) 75%,
		rgba(37, 99, 235, 0.05) 100%
	);
	margin-right: 300px;

	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: radial-gradient(
				circle at 20% 20%,
				rgba(124, 58, 237, 0.03) 0%,
				transparent 50%
			),
			radial-gradient(
				circle at 80% 80%,
				rgba(59, 130, 246, 0.03) 0%,
				transparent 50%
			),
			radial-gradient(
				circle at 50% 50%,
				rgba(139, 92, 246, 0.02) 0%,
				transparent 50%
			);
		pointer-events: none;
	}

	> * {
		position: relative;
		z-index: 1;
	}
`

const SVGCanvas = styled.svg<{ $panX: number; $panY: number }>`
	width: 5000px;
	height: 5000px;
	display: block;
	background: transparent;
	transform: translate(${props => props.$panX}px, ${props => props.$panY}px);
`

const Tooltip = styled.div`
	position: absolute;
	bottom: 100%;
	left: 50%;
	transform: translateX(-50%);
	background: rgba(255, 255, 255, 0.95);
	backdrop-filter: blur(20px);
	border: 1px solid rgba(124, 58, 237, 0.2);
	border-radius: 8px;
	padding: 8px 12px;
	font-size: 12px;
	color: rgba(124, 58, 237, 0.9);
	white-space: nowrap;
	box-shadow: 0 8px 32px rgba(124, 58, 237, 0.15),
		inset 0 1px 0 rgba(255, 255, 255, 0.2);
	z-index: 20;
	margin-bottom: 8px;
	font-weight: 500;
`

const WelcomeScreen = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background: linear-gradient(
		135deg,
		rgba(124, 58, 237, 0.03) 0%,
		rgba(139, 92, 246, 0.03) 25%,
		rgba(59, 130, 246, 0.03) 50%,
		rgba(30, 64, 175, 0.03) 75%,
		rgba(37, 99, 235, 0.03) 100%
	);
	z-index: 10;
	pointer-events: none;

	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: radial-gradient(
				circle at 30% 30%,
				rgba(124, 58, 237, 0.05) 0%,
				transparent 50%
			),
			radial-gradient(
				circle at 70% 70%,
				rgba(59, 130, 246, 0.05) 0%,
				transparent 50%
			),
			radial-gradient(
				circle at 50% 50%,
				rgba(139, 92, 246, 0.03) 0%,
				transparent 50%
			);
		pointer-events: none;
	}

	> * {
		position: relative;
		z-index: 1;
	}
`

const WelcomeContent = styled.div`
	text-align: center;
	max-width: 600px;
	padding: 40px;
	background: rgba(255, 255, 255, 0.1);
	backdrop-filter: blur(20px);
	border: 1px solid rgba(124, 58, 237, 0.2);
	border-radius: 20px;
	box-shadow: 0 16px 64px rgba(124, 58, 237, 0.1),
		inset 0 1px 0 rgba(255, 255, 255, 0.2);
	animation: fadeIn 0.8s ease-out;
`

const WelcomeIcon = styled.div`
	width: 120px;
	height: 120px;
	margin: 0 auto 24px;
	background: linear-gradient(
		135deg,
		rgba(124, 58, 237, 0.2),
		rgba(59, 130, 246, 0.2)
	);
	backdrop-filter: blur(20px);
	border: 2px solid rgba(124, 58, 237, 0.3);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 48px;
	color: #7c3aed;
	box-shadow: 0 16px 64px rgba(124, 58, 237, 0.2),
		inset 0 2px 0 rgba(255, 255, 255, 0.3);
	animation: float 3s ease-in-out infinite;

	@keyframes float {
		0%,
		100% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-10px);
		}
	}
`

const WelcomeTitle = styled.h1`
	font-size: 2.5rem;
	font-weight: 700;
	margin: 0 0 16px 0;
	background: linear-gradient(135deg, #7c3aed, #8b5cf6, #3b82f6);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
	text-shadow: 0 4px 8px rgba(124, 58, 237, 0.2);
`

const WelcomeSubtitle = styled.p`
	font-size: 1.2rem;
	color: rgba(124, 58, 237, 0.8);
	margin: 0 0 32px 0;
	line-height: 1.6;
	font-weight: 500;
`

const WelcomeFeatures = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	gap: 20px;
	margin-top: 32px;
`

const FeatureCard = styled.div`
	padding: 20px;
	background: rgba(255, 255, 255, 0.05);
	backdrop-filter: blur(20px);
	border: 1px solid rgba(124, 58, 237, 0.1);
	border-radius: 12px;
	text-align: center;
	transition: all 0.3s ease;
	box-shadow: 0 4px 16px rgba(124, 58, 237, 0.05),
		inset 0 1px 0 rgba(255, 255, 255, 0.1);

	&:hover {
		transform: translateY(-2px);
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(124, 58, 237, 0.2);
		box-shadow: 0 8px 32px rgba(124, 58, 237, 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
	}
`

const FeatureIcon = styled.div`
	font-size: 24px;
	margin-bottom: 12px;
	color: #7c3aed;
`

const FeatureTitle = styled.h3`
	font-size: 1rem;
	font-weight: 600;
	margin: 0 0 8px 0;
	color: rgba(124, 58, 237, 0.9);
`

const FeatureDescription = styled.p`
	font-size: 0.85rem;
	color: rgba(124, 58, 237, 0.7);
	margin: 0;
	line-height: 1.4;
`

const CircuitBoard: React.FC = () => {
	// Separate the store selectors to minimize re-renders
	const nodes = useCircuitStore(state => state.nodes)
	const elements = useCircuitStore(state => state.elements)
	const selectedNodeId = useCircuitStore(state => state.selectedNodeId)
	const selectedElementId = useCircuitStore(state => state.selectedElementId)
	const placementMode = useCircuitStore(state => state.placementMode)
	const highlightedNodeId = useCircuitStore(state => state.highlightedNodeId)
	const highlightedElementId = useCircuitStore(
		state => state.highlightedElementId
	)

	// Use individual action functions instead of destructuring them all
	const addNode = useCircuitStore(state => state.addNode)
	const findNodeAtPosition = useCircuitStore(state => state.findNodeAtPosition)
	const selectElement = useCircuitStore(state => state.selectElement)
	const selectNode = useCircuitStore(state => state.selectNode)
	const removeElement = useCircuitStore(state => state.removeElement)
	const cancelPlacement = useCircuitStore(state => state.cancelPlacement)
	const setPlacementStartNode = useCircuitStore(
		state => state.setPlacementStartNode
	)
	const placeElementInDirection = useCircuitStore(
		state => state.placeElementInDirection
	)
	const getAvailableDirections = useCircuitStore(
		state => state.getAvailableDirections
	)

	const boardRef = useRef<HTMLDivElement>(null)
	const [hoverNodeId, setHoverNodeId] = useState<string | null>(null)
	const [hoveredDirection, setHoveredDirection] = useState<Direction | null>(
		null
	)
	const [previewDirection, setPreviewDirection] = useState<Direction | null>(
		null
	)

	// Состояния для panning (перемещения по доске)
	const [panOffset, setPanOffset] = useState<Position>({ x: -2500, y: -2500 })
	const [isPanning, setIsPanning] = useState(false)
	const [panStart, setPanStart] = useState<Position>({ x: 0, y: 0 })
	const [lastPanOffset, setLastPanOffset] = useState<Position>({
		x: -2500,
		y: -2500,
	})
	const [wasDragging, setWasDragging] = useState(false)

	// Получить координаты относительно доски - мемоизируем функцию
	const getBoardCoordinates = useCallback(
		(e: React.MouseEvent): Position => {
			if (!boardRef.current) {
				return { x: 0, y: 0 }
			}

			const rect = boardRef.current.getBoundingClientRect()
			return {
				x: e.clientX - rect.left - panOffset.x,
				y: e.clientY - rect.top - panOffset.y,
			}
		},
		[panOffset]
	)

	// Обработчики для panning
	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			// Если в режиме размещения, не активируем panning
			if (placementMode.active) {
				return
			}

			// Если это левая кнопка мыши, начинаем panning
			if (e.button === 0) {
				e.preventDefault()
				setIsPanning(true)
				setPanStart({ x: e.clientX, y: e.clientY })
				setLastPanOffset(panOffset)
				return
			}
		},
		[panOffset, placementMode.active]
	)

	const handleMouseMoveGlobal = useCallback(
		(e: MouseEvent) => {
			if (isPanning) {
				const deltaX = e.clientX - panStart.x
				const deltaY = e.clientY - panStart.y

				// Если перемещение больше 5 пикселей, считаем это драгом
				if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
					setWasDragging(true)
				}

				setPanOffset({
					x: lastPanOffset.x + deltaX,
					y: lastPanOffset.y + deltaY,
				})
			}
		},
		[isPanning, panStart, lastPanOffset]
	)

	const handleMouseUpGlobal = useCallback(() => {
		if (isPanning) {
			setIsPanning(false)
			// Сбрасываем флаг драга через небольшую задержку
			setTimeout(() => setWasDragging(false), 10)
		}
	}, [isPanning])

	// Добавляем глобальные обработчики для panning
	useEffect(() => {
		if (isPanning) {
			document.addEventListener('mousemove', handleMouseMoveGlobal)
			document.addEventListener('mouseup', handleMouseUpGlobal)
			document.body.style.cursor = 'grabbing'

			return () => {
				document.removeEventListener('mousemove', handleMouseMoveGlobal)
				document.removeEventListener('mouseup', handleMouseUpGlobal)
				document.body.style.cursor = 'auto'
			}
		}
	}, [isPanning, handleMouseMoveGlobal, handleMouseUpGlobal])

	// Функция для определения направления на основе позиции мыши относительно узла
	const getDirectionFromMouse = useCallback(
		(nodePosition: Position, mousePos: Position): Direction | null => {
			const dx = mousePos.x - nodePosition.x
			const dy = mousePos.y - nodePosition.y
			const distance = Math.sqrt(dx * dx + dy * dy)

			// Минимальное расстояние для определения направления
			if (distance < 30) return null

			// Определяем основное направление
			if (Math.abs(dx) > Math.abs(dy)) {
				return dx > 0 ? 'right' : 'left'
			} else {
				return dy > 0 ? 'down' : 'up'
			}
		},
		[]
	)

	// Обработчик клика по доске - мемоизируем функцию
	const handleBoardClick = useCallback(
		(e: React.MouseEvent) => {
			// Отменяем всплытие события, чтобы не вызывать обработчики узлов
			e.stopPropagation()

			// Не обрабатываем клики во время panning или если было перетаскивание
			if (isPanning || wasDragging) {
				return
			}

			const position = getBoardCoordinates(e)

			// Если не в режиме размещения, снимаем выделение
			if (!placementMode.active) {
				selectElement(null)
				selectNode(null)
				return
			}

			// Если в режиме размещения и есть предварительное направление, размещаем элемент
			if (placementMode.startNodeId && previewDirection) {
				placeElementInDirection(previewDirection)
				setPreviewDirection(null)
				return
			}

			// Ищем узел рядом с кликом
			const existingNode = findNodeAtPosition(position)

			if (existingNode) {
				if (!placementMode.startNodeId) {
					// Если это первый клик, устанавливаем найденный узел как начальный
					setPlacementStartNode(existingNode.id)
				} else {
					// Если уже выбран начальный узел, отменяем размещение
					cancelPlacement()
				}
				return
			}

			// Если нет узлов и это первый элемент в цепи, создаем начальный узел
			if (elements.length === 0 && !placementMode.startNodeId) {
				const newNodeId = addNode(position)
				setPlacementStartNode(newNodeId)
				return
			}

			// В остальных случаях ничего не делаем - элементы можно создавать только от существующих узлов
		},
		[
			placementMode.active,
			placementMode.startNodeId,
			previewDirection,
			elements.length,
			isPanning,
			wasDragging,
			findNodeAtPosition,
			setPlacementStartNode,
			addNode,
			selectElement,
			selectNode,
			cancelPlacement,
			placeElementInDirection,
			getBoardCoordinates,
		]
	)

	// Обработчик клика по направлению
	const handleDirectionClick = useCallback(
		(direction: Direction) => {
			if (placementMode.active && placementMode.startNodeId) {
				placeElementInDirection(direction)
				setPreviewDirection(null)
			}
		},
		[placementMode.active, placementMode.startNodeId, placeElementInDirection]
	)

	// Отслеживаем перемещение мыши - мемоизируем функцию
	const handleMouseMove = useCallback(
		(e: React.MouseEvent) => {
			// Не обрабатываем движение мыши во время panning
			if (isPanning) {
				return
			}

			const position = getBoardCoordinates(e)

			// Проверяем ближайший узел
			const nearbyNode = findNodeAtPosition(position)

			if (nearbyNode) {
				setHoverNodeId(nearbyNode.id)
			} else {
				setHoverNodeId(null)
			}

			// Если в режиме размещения и выбран узел, определяем направление
			if (placementMode.active && placementMode.startNodeId) {
				const startNode = nodes.find(n => n.id === placementMode.startNodeId)
				if (startNode) {
					const direction = getDirectionFromMouse(startNode.position, position)
					if (direction) {
						const availableDirections = getAvailableDirections(startNode.id)
						if (availableDirections.includes(direction)) {
							setPreviewDirection(direction)
						} else {
							setPreviewDirection(null)
						}
					} else {
						setPreviewDirection(null)
					}
				}
			} else {
				setPreviewDirection(null)
			}
		},
		[
			placementMode.active,
			placementMode.startNodeId,
			nodes,
			isPanning,
			findNodeAtPosition,
			getDirectionFromMouse,
			getAvailableDirections,
			getBoardCoordinates,
		]
	)

	// Отмена размещения по клику правой кнопкой мыши - мемоизируем функцию
	const handleRightClick = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault()
			if (placementMode.active) {
				cancelPlacement()
				setHoverNodeId(null)
				setHoveredDirection(null)
				setPreviewDirection(null)
			}
		},
		[placementMode.active, cancelPlacement]
	)

	// Получаем стартовый узел, если он существует
	const startNode = useMemo(
		() =>
			placementMode.startNodeId
				? nodes.find(node => node.id === placementMode.startNodeId)
				: null,
		[nodes, placementMode.startNodeId]
	)

	// Получаем доступные направления для выбранного узла
	const availableDirections = useMemo(() => {
		if (placementMode.active && placementMode.startNodeId) {
			return getAvailableDirections(placementMode.startNodeId)
		}
		return []
	}, [placementMode.active, placementMode.startNodeId, getAvailableDirections])

	// Вычисляем предварительный элемент для отображения
	const previewElement = useMemo(() => {
		if (
			!placementMode.active ||
			!placementMode.startNodeId ||
			!previewDirection ||
			!startNode
		) {
			return null
		}

		const endPosition = getEndPosition(startNode.position, previewDirection)

		return {
			startPosition: startNode.position,
			endPosition,
			direction: previewDirection,
			elementType: placementMode.elementType!,
		}
	}, [
		placementMode.active,
		placementMode.startNodeId,
		placementMode.elementType,
		previewDirection,
		startNode,
	])

	// Курсор в зависимости от режима
	const cursor = useMemo(() => {
		if (isPanning) {
			return 'grabbing'
		}
		return placementMode.active
			? placementMode.startNodeId
				? 'crosshair'
				: 'cell'
			: 'grab'
	}, [placementMode.active, placementMode.startNodeId, isPanning])

	// Обработка нажатий клавиш Delete и Backspace для удаления выбранных элементов
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Проверяем, не находится ли фокус на элементе ввода (input, textarea)
			const target = e.target as HTMLElement
			const isInputField =
				target.tagName === 'INPUT' ||
				target.tagName === 'TEXTAREA' ||
				target.isContentEditable

			// Удаление выбранного элемента по клавишам Delete или Backspace,
			// только если фокус не находится на поле ввода
			if (
				(e.key === 'Delete' || e.key === 'Backspace') &&
				selectedElementId &&
				!isInputField
			) {
				e.preventDefault() // Предотвращаем действие браузера по умолчанию
				removeElement(selectedElementId)
			}
		}

		// Добавляем обработчик
		window.addEventListener('keydown', handleKeyDown)

		// Удаляем обработчик при размонтировании
		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [selectedElementId, removeElement])

	// Обработчик колесика мыши для сброса panning
	const handleWheel = useCallback((e: React.WheelEvent) => {
		// Если зажат Ctrl, сбрасываем panning в центр
		if (e.ctrlKey) {
			e.preventDefault()
			setPanOffset({ x: -2500, y: -2500 })
			setLastPanOffset({ x: -2500, y: -2500 })
		}
	}, [])

	return (
		<>
			<BoardContainer
				ref={boardRef}
				onClick={handleBoardClick}
				onMouseMove={handleMouseMove}
				onContextMenu={handleRightClick}
				onMouseDown={handleMouseDown}
				onWheel={handleWheel}
				style={{ cursor }}
			>
				<SVGCanvas $panX={panOffset.x} $panY={panOffset.y}>
					{/* Сетка */}
					<defs>
						<pattern
							id='grid'
							width='20'
							height='20'
							patternUnits='userSpaceOnUse'
						>
							<path
								d='M 20 0 L 0 0 0 20'
								fill='none'
								stroke='rgba(0, 0, 0, 0.1)'
								strokeWidth='1'
							/>
						</pattern>
					</defs>
					<rect width='100%' height='100%' fill='url(#grid)' />

					{/* Границы рабочей области */}
					<rect
						x={0}
						y={0}
						width={5000}
						height={5000}
						fill='none'
						stroke='var(--primary-color)'
						strokeWidth={3}
						strokeDasharray='10 5'
						opacity={0.6}
					/>

					{/* Используем мемоизированные компоненты */}
					<ElementsRenderer
						elements={elements}
						highlightedElementId={highlightedElementId}
					/>

					<NodesRenderer
						nodes={nodes}
						selectedNodeId={selectedNodeId}
						hoverNodeId={hoverNodeId}
						placementStartNodeId={placementMode.startNodeId}
						highlightedNodeId={highlightedNodeId}
					/>

					{/* Предварительный элемент */}
					{previewElement && (
						<g opacity={0.5}>
							{/* Здесь будет рендериться предварительный элемент */}
							<line
								x1={previewElement.startPosition.x}
								y1={previewElement.startPosition.y}
								x2={previewElement.endPosition.x}
								y2={previewElement.endPosition.y}
								stroke='var(--primary-color)'
								strokeWidth={2}
								strokeDasharray='5 5'
							/>
						</g>
					)}

					{/* Индикаторы направлений для размещения элементов */}
					{placementMode.active && startNode && (
						<DirectionIndicators
							centerPosition={startNode.position}
							availableDirections={availableDirections}
							hoveredDirection={hoveredDirection}
							onDirectionClick={handleDirectionClick}
							onDirectionHover={setHoveredDirection}
						/>
					)}
				</SVGCanvas>

				{placementMode.active && (
					<Tooltip>
						{placementMode.startNodeId
							? previewDirection
								? `Кликните для размещения в направлении ${previewDirection}`
								: 'Наведите мышь на доступное направление'
							: elements.length === 0
							? 'Кликните для создания первого узла.'
							: 'Кликните на узел для начала размещения.'}
					</Tooltip>
				)}

				{!placementMode.active && elements.length === 0 && (
					<Tooltip>
						Зажмите и перетащите для перемещения по доске. Ctrl+колесико для
						возврата в центр.
					</Tooltip>
				)}
			</BoardContainer>

			{!placementMode.active && elements.length === 0 && (
				<WelcomeScreen>
					<WelcomeContent>
						<WelcomeIcon>🌟</WelcomeIcon>
						<WelcomeTitle>Добро пожаловать!</WelcomeTitle>
						<WelcomeSubtitle>
							Создайте свою первую электрическую цепь с помощью нашего
							инструмента.
						</WelcomeSubtitle>
						<WelcomeFeatures>
							<FeatureCard>
								<FeatureIcon>🔌</FeatureIcon>
								<FeatureTitle>Простая установка</FeatureTitle>
								<FeatureDescription>
									Легко добавляйте и соединяйте элементы.
								</FeatureDescription>
							</FeatureCard>
							<FeatureCard>
								<FeatureIcon>🔍</FeatureIcon>
								<FeatureTitle>Точный анализ</FeatureTitle>
								<FeatureDescription>
									Проверяйте состояние цепи в реальном времени.
								</FeatureDescription>
							</FeatureCard>
							<FeatureCard>
								<FeatureIcon>💡</FeatureIcon>
								<FeatureTitle>Эффективное управление</FeatureTitle>
								<FeatureDescription>
									Управляйте цепью с помощью наших функций.
								</FeatureDescription>
							</FeatureCard>
						</WelcomeFeatures>
					</WelcomeContent>
				</WelcomeScreen>
			)}
		</>
	)
}

export default CircuitBoard
