import React, { useRef, useState, useEffect } from 'react'
import styled from 'styled-components'
import { useCircuitStore } from '../store/circuitStore'
import CircuitElement from './CircuitElement'
import { Position } from '../types'
import NodeComponent from './NodeComponent'

const BoardContainer = styled.div`
	flex: 1;
	position: relative;
	overflow: hidden;
	background: var(--surface-color);
	background-image: linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
		linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
		linear-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 1px),
		linear-gradient(90deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px);
	background-size: 20px 20px, 20px 20px, 5px 5px, 5px 5px;
	width: 100%;
	height: 100%;
	user-select: none;
	cursor: default;
`

const SVGCanvas = styled.svg`
	width: 100%;
	height: 100%;
`

// Компонент для отображения линии при размещении
const PlacementLine = styled.line`
	stroke: var(--primary-color);
	stroke-width: 2px;
	stroke-dasharray: 5, 5;
`

const StatusBar = styled.div`
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	height: 40px;
	background-color: var(--surface-color);
	border-top: 1px solid var(--border-color);
	display: flex;
	align-items: center;
	padding: 0 20px;
	font-size: 14px;
	color: var(--text-secondary);
	z-index: 1000;
	box-shadow: var(--shadow-sm);
`

const Tooltip = styled.div`
	position: absolute;
	bottom: 50px;
	left: 50%;
	transform: translateX(-50%);
	background: var(--surface-color);
	color: var(--text-primary);
	padding: 12px 16px;
	border-radius: var(--radius-md);
	box-shadow: var(--shadow-md);
	font-size: 14px;
	pointer-events: none;
	opacity: 0.9;
	max-width: 320px;
	text-align: center;
	z-index: 1000;
	transition: opacity 0.2s ease-in-out;
`

const CircuitBoard: React.FC = () => {
	const elements = useCircuitStore(state => state.elements)
	const nodes = useCircuitStore(state => state.nodes)
	const selectedNodeId = useCircuitStore(state => state.selectedNodeId)
	const selectedElementId = useCircuitStore(state => state.selectedElementId)
	const highlightedElementId = useCircuitStore(
		state => state.highlightedElementId
	)
	const highlightedNodeId = useCircuitStore(state => state.highlightedNodeId)
	const selectElement = useCircuitStore(state => state.selectElement)
	const selectNode = useCircuitStore(state => state.selectNode)
	const removeElement = useCircuitStore(state => state.removeElement)
	const placementMode = useCircuitStore(state => state.placementMode)
	const cancelPlacement = useCircuitStore(state => state.cancelPlacement)
	const setPlacementStartNode = useCircuitStore(
		state => state.setPlacementStartNode
	)
	const placeElement = useCircuitStore(state => state.placeElement)
	const addNode = useCircuitStore(state => state.addNode)
	const addNodeOnWire = useCircuitStore(state => state.addNodeOnWire)
	const findNodeAtPosition = useCircuitStore(state => state.findNodeAtPosition)
	const findClosestWire = useCircuitStore(state => state.findClosestWire)

	const boardRef = useRef<HTMLDivElement>(null)
	const [hoverNodeId, setHoverNodeId] = useState<string | null>(null)
	const [tempNodePosition, setTempNodePosition] = useState<Position | null>(
		null
	)
	const [wireSnapPoint, setWireSnapPoint] = useState<Position | null>(null)
	const [hoveredWireId, setHoveredWireId] = useState<string | null>(null)

	// Получить координаты относительно доски
	const getBoardCoordinates = (e: React.MouseEvent): Position => {
		if (!boardRef.current) {
			return { x: 0, y: 0 }
		}

		const rect = boardRef.current.getBoundingClientRect()
		return {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top,
		}
	}

	// Обработчик клика по доске
	const handleBoardClick = (e: React.MouseEvent) => {
		// Отменяем всплытие события, чтобы не вызывать обработчики узлов
		e.stopPropagation()

		const position = getBoardCoordinates(e)

		// Если не в режиме размещения, проверяем клик по проводу
		if (!placementMode.active) {
			// Проверяем, есть ли рядом провод для выделения
			const nearWire = findClosestWire(position, 10)
			if (nearWire && nearWire.wire) {
				// Если провод найден, выделяем его
				selectElement(nearWire.wire.id)
				return
			}

			// Если провода нет, снимаем выделение
			selectElement(null)
			selectNode(null)
			return
		}

		// Ищем узел рядом с кликом (имеет приоритет)
		const existingNode = findNodeAtPosition(position)

		// Если мы в режиме размещения и нашли узел
		if (existingNode) {
			if (!placementMode.startNodeId) {
				// Если это первый клик, устанавливаем найденный узел как начальный
				setPlacementStartNode(existingNode.id)
			} else {
				// Если это второй клик, завершаем размещение с найденным узлом
				placeElement(existingNode.id)
			}
			return
		}

		// Проверяем, есть ли точка магнитного притяжения к проводу
		if (wireSnapPoint && hoveredWireId) {
			// Создаем узел в точке пересечения с проводом и разбиваем провод на два
			const newNodeId = addNodeOnWire(wireSnapPoint, hoveredWireId)

			if (!placementMode.startNodeId) {
				// Если это первый клик, устанавливаем созданный узел как начальный
				setPlacementStartNode(newNodeId)
			} else {
				// Если это второй клик, завершаем размещение
				placeElement(newNodeId)
			}
			return
		}

		// Если это первый клик и узла рядом нет, создаем новый узел
		if (!placementMode.startNodeId) {
			const newNodeId = addNode(position)
			setPlacementStartNode(newNodeId)
			return
		}

		// Если это второй клик и узла рядом нет, создаем новый узел и завершаем размещение
		const endNodeId = addNode(position)
		placeElement(endNodeId)
	}

	// Отслеживаем перемещение мыши для отображения предпросмотра
	const handleMouseMove = (e: React.MouseEvent) => {
		const position = getBoardCoordinates(e)

		// Сначала проверяем ближайший узел
		const nearbyNode = findNodeAtPosition(position)

		// Если в режиме размещения
		if (placementMode.active) {
			if (nearbyNode) {
				// Если узел найден, приоритезируем его
				setTempNodePosition(null)
				setHoverNodeId(nearbyNode.id)
				setWireSnapPoint(null)
				setHoveredWireId(null)
			} else {
				// Если узел не найден, проверяем магнитное притяжение к проводам
				const closestWire = findClosestWire(position)

				if (closestWire && closestWire.wire) {
					setWireSnapPoint(closestWire.point)
					setHoveredWireId(closestWire.wire.id)
					setHoverNodeId(null)
					setTempNodePosition(null)
				} else {
					// Ни узла, ни провода рядом нет - показываем временный узел
					setWireSnapPoint(null)
					setHoveredWireId(null)
					setHoverNodeId(null)
					setTempNodePosition(position)
				}
			}

			// Если в режиме размещения с выбранным начальным узлом
			if (placementMode.startNodeId) {
				// Логика уже обработана выше
			}
		} else {
			// Если не в режиме размещения
			// Проверяем наведение на провод для выделения
			const closestWire = findClosestWire(position, 10)

			if (closestWire && closestWire.wire) {
				setHoveredWireId(closestWire.wire.id)
			} else {
				setHoveredWireId(null)
			}

			// В обычном режиме не показываем temporary node
			setHoverNodeId(null)
			setTempNodePosition(null)
			setWireSnapPoint(null)
		}
	}

	// Отмена размещения по клику правой кнопкой мыши
	const handleRightClick = (e: React.MouseEvent) => {
		e.preventDefault()
		if (placementMode.active) {
			cancelPlacement()
			setHoverNodeId(null)
			setTempNodePosition(null)
			setWireSnapPoint(null)
			setHoveredWireId(null)
		}
	}

	// Получаем стартовый узел, если он существует
	const startNode = placementMode.startNodeId
		? nodes.find(node => node.id === placementMode.startNodeId)
		: null

	// Получаем конечный узел для отображения предпросмотра
	const previewEndNode = hoverNodeId
		? nodes.find(node => node.id === hoverNodeId)
		: null

	// Текст статуса
	const getStatusText = () => {
		if (placementMode.active) {
			if (placementMode.startNodeId) {
				return 'Кликните для размещения конца элемента. Наведите курсор на узел или провод для соединения.'
			} else {
				return 'Кликните для начала размещения элемента. Наведите курсор на узел или провод для соединения.'
			}
		} else {
			return 'Используйте панель элементов слева для размещения компонентов. Del/Backspace для удаления выбранных элементов.'
		}
	}

	// Обработка нажатий клавиш Delete и Backspace для удаления выбранных элементов
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Удаление выбранного элемента по клавишам Delete или Backspace
			if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId) {
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

	// Рендерим узлы
	const renderNodes = () => {
		return nodes.map(node => {
			const isSelected = selectedNodeId === node.id
			const isHovered = hoverNodeId === node.id
			const isPlacementStart =
				placementMode.active && placementMode.startNodeId === node.id
			const isHighlighted = highlightedNodeId === node.id

			return (
				<NodeComponent
					key={node.id}
					node={node}
					isSelected={isSelected}
					isHovered={isHovered}
					isPlacementStart={isPlacementStart}
					isHighlighted={isHighlighted}
				/>
			)
		})
	}

	// Рендерим элементы схемы
	const renderElements = () => {
		return elements.map(element => (
			<CircuitElement
				key={element.id}
				element={element}
				isHighlighted={element.id === highlightedElementId}
			/>
		))
	}

	return (
		<>
			<BoardContainer
				ref={boardRef}
				onClick={handleBoardClick}
				onMouseMove={handleMouseMove}
				onContextMenu={handleRightClick}
				style={{
					cursor: placementMode.active
						? placementMode.startNodeId
							? 'crosshair'
							: 'cell'
						: 'default',
				}}
			>
				<SVGCanvas>
					{/* Существующие элементы */}
					{renderElements()}

					{/* Отображение узлов */}
					{renderNodes()}

					{/* Временный узел при размещении */}
					{tempNodePosition && (
						<>
							<circle
								cx={tempNodePosition.x}
								cy={tempNodePosition.y}
								r={6}
								fill='var(--primary-light)'
								stroke='var(--primary-color)'
								strokeWidth={2}
								opacity={0.9}
							/>
							<circle
								cx={tempNodePosition.x}
								cy={tempNodePosition.y}
								r={10}
								fill='none'
								stroke='var(--primary-color)'
								strokeWidth={1}
								opacity={0.5}
								strokeDasharray='2 2'
							/>
						</>
					)}

					{/* Точка притяжения к проводу */}
					{wireSnapPoint && (
						<>
							<circle
								cx={wireSnapPoint.x}
								cy={wireSnapPoint.y}
								r={6}
								fill='var(--accent-light)'
								stroke='var(--accent-color)'
								strokeWidth={2}
								opacity={0.9}
							/>
							<circle
								cx={wireSnapPoint.x}
								cy={wireSnapPoint.y}
								r={12}
								fill='none'
								stroke='var(--accent-color)'
								strokeWidth={1}
								opacity={0.6}
								strokeDasharray='3 3'
							/>
						</>
					)}

					{/* Линия предпросмотра при размещении */}
					{placementMode.active &&
						startNode &&
						(previewEndNode || tempNodePosition || wireSnapPoint) && (
							<PlacementLine
								x1={startNode.position.x}
								y1={startNode.position.y}
								x2={
									previewEndNode
										? previewEndNode.position.x
										: wireSnapPoint
										? wireSnapPoint.x
										: tempNodePosition?.x || 0
								}
								y2={
									previewEndNode
										? previewEndNode.position.y
										: wireSnapPoint
										? wireSnapPoint.y
										: tempNodePosition?.y || 0
								}
							/>
						)}
				</SVGCanvas>

				{placementMode.active && (
					<Tooltip>
						{placementMode.startNodeId
							? 'Разместите конец элемента. Правый клик для отмены.'
							: 'Выберите начальную точку элемента. Правый клик для отмены.'}
					</Tooltip>
				)}
			</BoardContainer>
			<StatusBar>{getStatusText()}</StatusBar>
		</>
	)
}

export default CircuitBoard
