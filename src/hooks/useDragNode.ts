import { useState, useCallback, useEffect } from 'react'
import { Position, Node } from '../types'
import { useCircuitStore } from '../store/circuitStore'

interface UseDragNodeProps {
	node: Node
	isInPlacementMode: boolean
}

interface UseDragNodeResult {
	isDragging: boolean
	handleMouseDown: (e: React.MouseEvent) => void
	handleMouseMove: (e: React.MouseEvent) => void
	handleMouseUp: () => void
}

export const useDragNode = ({
	node,
	isInPlacementMode,
}: UseDragNodeProps): UseDragNodeResult => {
	const updateNodePosition = useCircuitStore(state => state.updateNodePosition)
	const [isDragging, setIsDragging] = useState(false)
	const [dragStartPosition, setDragStartPosition] = useState<Position>({
		x: 0,
		y: 0,
	})

	// Начало перетаскивания
	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			// Только левая кнопка мыши и не в режиме размещения
			if (e.button !== 0 || isInPlacementMode) return

			e.stopPropagation()
			setIsDragging(true)
			setDragStartPosition({ x: e.clientX, y: e.clientY })
		},
		[isInPlacementMode]
	)

	// Перемещение при перетаскивании
	const handleMouseMove = useCallback(
		(e: React.MouseEvent) => {
			if (!isDragging) return

			const dx = e.clientX - dragStartPosition.x
			const dy = e.clientY - dragStartPosition.y

			updateNodePosition(node.id, {
				x: node.position.x + dx,
				y: node.position.y + dy,
			})

			setDragStartPosition({ x: e.clientX, y: e.clientY })
		},
		[
			isDragging,
			dragStartPosition.x,
			dragStartPosition.y,
			node.id,
			node.position.x,
			node.position.y,
			updateNodePosition,
		]
	)

	// Завершение перетаскивания
	const handleMouseUp = useCallback(() => {
		if (isDragging) {
			setIsDragging(false)
		}
	}, [isDragging])

	// Глобальная версия handleMouseMove
	const handleMouseMoveGlobal = useCallback(
		(e: MouseEvent) => {
			if (!isDragging) return

			const dx = e.clientX - dragStartPosition.x
			const dy = e.clientY - dragStartPosition.y

			updateNodePosition(node.id, {
				x: node.position.x + dx,
				y: node.position.y + dy,
			})

			setDragStartPosition({ x: e.clientX, y: e.clientY })
		},
		[
			isDragging,
			dragStartPosition.x,
			dragStartPosition.y,
			node.id,
			node.position.x,
			node.position.y,
			updateNodePosition,
		]
	)

	// Глобальные обработчики
	useEffect(() => {
		if (isDragging) {
			document.addEventListener('mousemove', handleMouseMoveGlobal)
			document.addEventListener('mouseup', handleMouseUp)
		}

		return () => {
			document.removeEventListener('mousemove', handleMouseMoveGlobal)
			document.removeEventListener('mouseup', handleMouseUp)
		}
	}, [isDragging, handleMouseMoveGlobal, handleMouseUp])

	return {
		isDragging,
		handleMouseDown,
		handleMouseMove,
		handleMouseUp,
	}
}
