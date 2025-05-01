import { useState, useCallback, useEffect, useRef } from 'react'
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

	// Храним абсолютное начальное положение мыши
	const startMousePosRef = useRef<Position | null>(null)
	// Храним начальное положение узла
	const startNodePosRef = useRef<Position | null>(null)

	// Функция для обновления положения узла
	const updatePosition = useCallback(
		(mouseX: number, mouseY: number) => {
			if (!startMousePosRef.current || !startNodePosRef.current) return

			// Вычисляем смещение от начальной позиции мыши
			const deltaX = mouseX - startMousePosRef.current.x
			const deltaY = mouseY - startMousePosRef.current.y

			// Вычисляем новую позицию узла относительно начальной позиции
			const newX = startNodePosRef.current.x + deltaX
			const newY = startNodePosRef.current.y + deltaY

			// Обновляем позицию узла
			updateNodePosition(node.id, { x: newX, y: newY })
		},
		[node.id, updateNodePosition]
	)

	// Обработчик нажатия мыши
	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			if (e.button !== 0 || isInPlacementMode) return

			e.preventDefault()
			e.stopPropagation()

			// Сохраняем начальное положение мыши
			startMousePosRef.current = { x: e.clientX, y: e.clientY }
			// Сохраняем начальное положение узла
			startNodePosRef.current = { ...node.position }

			setIsDragging(true)

			// Добавляем класс для оптимизации при перетаскивании
			document.body.classList.add('dragging')
			// Меняем курсор
			document.body.style.cursor = 'grabbing'
		},
		[isInPlacementMode, node.position]
	)

	// Обработчик движения мыши
	const handleMouseMove = useCallback(
		(e: React.MouseEvent) => {
			if (!isDragging) return

			e.preventDefault()
			e.stopPropagation()

			// Вызываем функцию обновления с новыми координатами мыши
			updatePosition(e.clientX, e.clientY)
		},
		[isDragging, updatePosition]
	)

	// Глобальный обработчик движения мыши
	const handleGlobalMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!isDragging) return

			// Предотвращаем действия по умолчанию
			e.preventDefault()

			// Обновляем позицию
			updatePosition(e.clientX, e.clientY)
		},
		[isDragging, updatePosition]
	)

	// Обработчик отпускания кнопки мыши
	const handleMouseUp = useCallback(() => {
		if (!isDragging) return

		// Сбрасываем состояние
		setIsDragging(false)
		startMousePosRef.current = null
		startNodePosRef.current = null

		// Удаляем класс и возвращаем стандартный курсор
		document.body.classList.remove('dragging')
		document.body.style.cursor = ''
	}, [isDragging])

	// Глобальные обработчики событий
	useEffect(() => {
		if (isDragging) {
			// Добавляем обработчики на весь документ
			document.addEventListener('mousemove', handleGlobalMouseMove)
			document.addEventListener('mouseup', handleMouseUp)
		} else {
			// Удаляем обработчики
			document.removeEventListener('mousemove', handleGlobalMouseMove)
			document.removeEventListener('mouseup', handleMouseUp)
		}

		// Очистка при размонтировании компонента
		return () => {
			document.removeEventListener('mousemove', handleGlobalMouseMove)
			document.removeEventListener('mouseup', handleMouseUp)
			document.body.classList.remove('dragging')
			document.body.style.cursor = ''
		}
	}, [isDragging, handleGlobalMouseMove, handleMouseUp])

	return {
		isDragging,
		handleMouseDown,
		handleMouseMove,
		handleMouseUp,
	}
}
