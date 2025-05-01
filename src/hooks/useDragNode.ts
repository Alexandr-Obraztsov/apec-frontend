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

// Функция для ограничения частоты вызовов с использованием requestAnimationFrame
const useThrottleRAF = <T extends unknown[]>(
	callback: (...args: T) => void
) => {
	const requestRef = useRef<number | null>(null)
	const previousTimeRef = useRef<number>(0)
	const lastArgsRef = useRef<T | null>(null)

	const animate = (time: number) => {
		if (previousTimeRef.current === 0) {
			previousTimeRef.current = time
		}

		const deltaTime = time - previousTimeRef.current
		const targetFPS = 120 // Целевой FPS
		const frameInterval = 1000 / targetFPS

		if (deltaTime >= frameInterval && lastArgsRef.current) {
			callback(...lastArgsRef.current)
			previousTimeRef.current = time
		}

		requestRef.current = requestAnimationFrame(animate)
	}

	const throttledCallback = useCallback(
		(...args: T) => {
			lastArgsRef.current = args

			if (requestRef.current === null) {
				requestRef.current = requestAnimationFrame(animate)
			}
		},
		[callback]
	)

	useEffect(() => {
		return () => {
			if (requestRef.current !== null) {
				cancelAnimationFrame(requestRef.current)
				requestRef.current = null
				previousTimeRef.current = 0
			}
		}
	}, [])

	return throttledCallback
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

	// Храним начальную позицию узла
	const initialNodePosRef = useRef<Position>({ x: 0, y: 0 })
	// Текущая абсолютная позиция курсора
	const currentMousePosRef = useRef<Position>({ x: 0, y: 0 })
	// Последнее обновление позиции
	const lastUpdateRef = useRef<Position | null>(null)
	// Признак необходимости обновления (для избежания лишних вызовов)
	const needUpdateRef = useRef<boolean>(false)

	// Функция обновления позиции узла
	const updateNodePos = useCallback(() => {
		if (!isDragging || !needUpdateRef.current) return

		const currentPos = currentMousePosRef.current

		// Вычисляем смещение от начальной позиции курсора
		const dx = currentPos.x - dragStartPosition.x
		const dy = currentPos.y - dragStartPosition.y

		// Обновляем позицию, используя начальную позицию узла плюс смещение курсора
		updateNodePosition(node.id, {
			x: initialNodePosRef.current.x + dx,
			y: initialNodePosRef.current.y + dy,
		})

		// Сбрасываем флаг необходимости обновления
		needUpdateRef.current = false
	}, [
		isDragging,
		dragStartPosition.x,
		dragStartPosition.y,
		node.id,
		updateNodePosition,
	])

	// Используем оптимизированный обработчик с requestAnimationFrame
	const throttledUpdateNodePos = useThrottleRAF(updateNodePos)

	// Начало перетаскивания
	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			// Только левая кнопка мыши и не в режиме размещения
			if (e.button !== 0 || isInPlacementMode) return

			e.stopPropagation()
			setIsDragging(true)

			// Сохраняем начальную позицию курсора
			const initialMousePos = { x: e.clientX, y: e.clientY }
			setDragStartPosition(initialMousePos)
			currentMousePosRef.current = initialMousePos

			// Сохраняем начальную позицию узла
			initialNodePosRef.current = { ...node.position }
			lastUpdateRef.current = null

			// Устанавливаем фокус на документ для обеспечения событий клавиатуры
			document.body.focus()
		},
		[isInPlacementMode, node.position]
	)

	// Перемещение при перетаскивании через React события (используется редко)
	const handleMouseMove = useCallback(
		(e: React.MouseEvent) => {
			if (!isDragging) return

			e.stopPropagation()
			e.preventDefault()

			currentMousePosRef.current = { x: e.clientX, y: e.clientY }
			needUpdateRef.current = true

			throttledUpdateNodePos()
		},
		[isDragging, throttledUpdateNodePos]
	)

	// Завершение перетаскивания
	const handleMouseUp = useCallback(() => {
		if (isDragging) {
			setIsDragging(false)
			needUpdateRef.current = false
		}
	}, [isDragging])

	// Глобальная версия handleMouseMove
	const handleMouseMoveGlobal = useCallback(
		(e: MouseEvent) => {
			if (!isDragging) return

			// Сохраняем текущую позицию мыши
			currentMousePosRef.current = { x: e.clientX, y: e.clientY }

			// Проверяем существенность смещения
			if (lastUpdateRef.current) {
				const minMovement = 1 // Минимальное изменение для обновления
				const dx = Math.abs(e.clientX - lastUpdateRef.current.x)
				const dy = Math.abs(e.clientY - lastUpdateRef.current.y)

				// Если смещение меньше минимального - не обновляем
				if (dx < minMovement && dy < minMovement) {
					return
				}
			}

			// Помечаем необходимость обновления
			needUpdateRef.current = true
			lastUpdateRef.current = { x: e.clientX, y: e.clientY }

			// Запускаем обновление через requestAnimationFrame
			throttledUpdateNodePos()
		},
		[isDragging, throttledUpdateNodePos]
	)

	// Глобальные обработчики
	useEffect(() => {
		if (isDragging) {
			document.addEventListener('mousemove', handleMouseMoveGlobal, {
				passive: true,
			})
			document.addEventListener('mouseup', handleMouseUp)

			// Добавляем стиль для курсора на весь документ
			document.body.style.cursor = 'grabbing'
			document.body.classList.add('dragging')
		}

		return () => {
			document.removeEventListener('mousemove', handleMouseMoveGlobal)
			document.removeEventListener('mouseup', handleMouseUp)

			// Возвращаем стандартный курсор
			document.body.style.cursor = ''
			document.body.classList.remove('dragging')
		}
	}, [isDragging, handleMouseMoveGlobal, handleMouseUp])

	return {
		isDragging,
		handleMouseDown,
		handleMouseMove,
		handleMouseUp,
	}
}
