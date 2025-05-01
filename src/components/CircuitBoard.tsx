import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react'
import styled from 'styled-components'
import { useCircuitStore } from '../store/circuitStore'
import { Position } from '../types'
import {
	NodesRenderer,
	ElementsRenderer,
	TempNode,
	WireSnapPoint,
	PlacementLineComponent,
} from './BoardElements'

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
	const findClosestWire = useCircuitStore(state => state.findClosestWire)
	const addNodeOnWire = useCircuitStore(state => state.addNodeOnWire)
	const selectElement = useCircuitStore(state => state.selectElement)
	const selectNode = useCircuitStore(state => state.selectNode)
	const removeElement = useCircuitStore(state => state.removeElement)
	const cancelPlacement = useCircuitStore(state => state.cancelPlacement)
	const setPlacementStartNode = useCircuitStore(
		state => state.setPlacementStartNode
	)
	const placeElement = useCircuitStore(state => state.placeElement)

	const boardRef = useRef<HTMLDivElement>(null)
	const [hoverNodeId, setHoverNodeId] = useState<string | null>(null)
	const [tempNodePosition, setTempNodePosition] = useState<Position | null>(
		null
	)
	const [wireSnapPoint, setWireSnapPoint] = useState<Position | null>(null)
	const [hoveredWireId, setHoveredWireId] = useState<string | null>(null)

	// Получить координаты относительно доски - мемоизируем функцию
	const getBoardCoordinates = useCallback((e: React.MouseEvent): Position => {
		if (!boardRef.current) {
			return { x: 0, y: 0 }
		}

		const rect = boardRef.current.getBoundingClientRect()
		return {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top,
		}
	}, [])

	// Обработчик клика по доске - мемоизируем функцию
	const handleBoardClick = useCallback(
		(e: React.MouseEvent) => {
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
		},
		[
			placementMode.active,
			placementMode.startNodeId,
			findNodeAtPosition,
			findClosestWire,
			wireSnapPoint,
			hoveredWireId,
			addNodeOnWire,
			setPlacementStartNode,
			addNode,
			placeElement,
			selectElement,
			selectNode,
			getBoardCoordinates,
		]
	)

	// Отслеживаем перемещение мыши - мемоизируем функцию
	const handleMouseMove = useCallback(
		(e: React.MouseEvent) => {
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
		},
		[
			placementMode.active,
			findNodeAtPosition,
			findClosestWire,
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
				setTempNodePosition(null)
				setWireSnapPoint(null)
				setHoveredWireId(null)
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

	// Получаем конечный узел для отображения предпросмотра
	const previewEndNode = useMemo(
		() => (hoverNodeId ? nodes.find(node => node.id === hoverNodeId) : null),
		[nodes, hoverNodeId]
	)

	// Вычисляем позицию конечной точки для линии предпросмотра
	const previewEndPosition = useMemo(() => {
		if (previewEndNode) {
			return previewEndNode.position
		} else if (wireSnapPoint) {
			return wireSnapPoint
		} else if (tempNodePosition) {
			return tempNodePosition
		}
		return null
	}, [previewEndNode, wireSnapPoint, tempNodePosition])

	// Текст статуса
	const statusText = useMemo(() => {
		if (placementMode.active) {
			if (placementMode.startNodeId) {
				return 'Кликните для размещения конца элемента. Наведите курсор на узел или провод для соединения.'
			} else {
				return 'Кликните для начала размещения элемента. Наведите курсор на узел или провод для соединения.'
			}
		} else {
			return 'Используйте панель элементов слева для размещения компонентов. Del/Backspace для удаления выбранных элементов.'
		}
	}, [placementMode.active, placementMode.startNodeId])

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

	// Курсор в зависимости от режима
	const cursor = useMemo(() => {
		return placementMode.active
			? placementMode.startNodeId
				? 'crosshair'
				: 'cell'
			: 'default'
	}, [placementMode.active, placementMode.startNodeId])

	return (
		<>
			<BoardContainer
				ref={boardRef}
				onClick={handleBoardClick}
				onMouseMove={handleMouseMove}
				onContextMenu={handleRightClick}
				style={{ cursor }}
			>
				<SVGCanvas>
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

					{/* Временный узел при размещении */}
					<TempNode position={tempNodePosition} />

					{/* Точка притяжения к проводу */}
					<WireSnapPoint position={wireSnapPoint} />

					{/* Линия предпросмотра при размещении */}
					{placementMode.active && (
						<PlacementLineComponent
							startNode={startNode}
							endPosition={previewEndPosition}
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
			<StatusBar>{statusText}</StatusBar>
		</>
	)
}

export default CircuitBoard
