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
	// Храним текущую позицию мыши
	const currentMousePosRef = useRef<Position | null>(null)
	// Храним идентификатор requestAnimationFrame
	const rafIdRef = useRef<number | null>(null)
	// Флаг для отслеживания, запрашивали ли мы уже кадр анимации
	const isAnimationPendingRef = useRef<boolean>(false)
	// Для оптимизации - храним последнюю обновленную позицию
	const lastUpdatedPosRef = useRef<Position | null>(null)

	// Функция обновления в цикле requestAnimationFrame
	const animateNodeMovement = useCallback(() => {
		if (
			!isDragging ||
			!startMousePosRef.current ||
			!startNodePosRef.current ||
			!currentMousePosRef.current
		) {
			isAnimationPendingRef.current = false
			return
		}

		// Вычисляем смещение от начальной позиции мыши
		const deltaX = currentMousePosRef.current.x - startMousePosRef.current.x
		const deltaY = currentMousePosRef.current.y - startMousePosRef.current.y

		// Вычисляем новую позицию узла относительно начальной позиции
		// Округляем до целых значений для снижения нагрузки и предотвращения мерцания
		const newX = Math.round(startNodePosRef.current.x + deltaX)
		const newY = Math.round(startNodePosRef.current.y + deltaY)

		// Проверяем, изменилась ли позиция с последнего обновления
		if (
			!lastUpdatedPosRef.current ||
			newX !== lastUpdatedPosRef.current.x ||
			newY !== lastUpdatedPosRef.current.y
		) {
			// Запоминаем последнюю обновленную позицию
			lastUpdatedPosRef.current = { x: newX, y: newY }

			// Обновляем позицию узла
			updateNodePosition(node.id, { x: newX, y: newY })
		}

		// Запрашиваем следующий кадр анимации
		rafIdRef.current = requestAnimationFrame(animateNodeMovement)
	}, [isDragging, node.id, updateNodePosition])

	// Функция для запуска анимации, если она еще не запущена
	const startAnimation = useCallback(() => {
		if (!isAnimationPendingRef.current && isDragging) {
			isAnimationPendingRef.current = true
			rafIdRef.current = requestAnimationFrame(animateNodeMovement)
		}
	}, [isDragging, animateNodeMovement])

	// Функция для обновления текущей позиции мыши
	const updateMousePosition = useCallback(
		(x: number, y: number) => {
			currentMousePosRef.current = { x, y }
			startAnimation()
		},
		[startAnimation]
	)

	// Обработчик нажатия мыши
	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			if (e.button !== 0 || isInPlacementMode) return

			e.preventDefault()
			e.stopPropagation()

			// Сохраняем начальное положение мыши
			startMousePosRef.current = { x: e.clientX, y: e.clientY }
			// Сохраняем текущее положение мыши
			currentMousePosRef.current = { x: e.clientX, y: e.clientY }
			// Сохраняем начальное положение узла
			startNodePosRef.current = { ...node.position }
			// Сбрасываем последнюю обновленную позицию
			lastUpdatedPosRef.current = null

			setIsDragging(true)

			// Добавляем класс для оптимизации при перетаскивании
			document.body.classList.add('dragging')
			// Меняем курсор
			document.body.style.cursor = 'grabbing'

			// Начинаем анимацию
			startAnimation()
		},
		[isInPlacementMode, node.position, startAnimation]
	)

	// Обработчик движения мыши
	const handleMouseMove = useCallback(
		(e: React.MouseEvent) => {
			if (!isDragging) return

			e.preventDefault()
			e.stopPropagation()

			// Обновляем позицию мыши
			updateMousePosition(e.clientX, e.clientY)
		},
		[isDragging, updateMousePosition]
	)

	// Глобальный обработчик движения мыши - с passive: false для лучшей производительности
	const handleGlobalMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!isDragging) return

			// Предотвращаем действия по умолчанию
			e.preventDefault()

			// Обновляем позицию мыши
			updateMousePosition(e.clientX, e.clientY)
		},
		[isDragging, updateMousePosition]
	)

	// Обработчик отпускания кнопки мыши
	const handleMouseUp = useCallback(() => {
		if (!isDragging) return

		// Отменяем все запланированные анимации
		if (rafIdRef.current) {
			cancelAnimationFrame(rafIdRef.current)
			rafIdRef.current = null
		}

		// Сбрасываем состояние
		setIsDragging(false)
		startMousePosRef.current = null
		startNodePosRef.current = null
		currentMousePosRef.current = null
		lastUpdatedPosRef.current = null
		isAnimationPendingRef.current = false

		// Удаляем класс и возвращаем стандартный курсор
		document.body.classList.remove('dragging')
		document.body.style.cursor = ''
	}, [isDragging])

	// Глобальные обработчики событий
	useEffect(() => {
		if (isDragging) {
			// Добавляем обработчики на весь документ
			document.addEventListener('mousemove', handleGlobalMouseMove, {
				passive: false,
			})
			document.addEventListener('mouseup', handleMouseUp)

			// Начинаем анимацию если еще не начали
			startAnimation()
		} else {
			// Удаляем обработчики
			document.removeEventListener('mousemove', handleGlobalMouseMove)
			document.removeEventListener('mouseup', handleMouseUp)

			// Отменяем все запланированные анимации
			if (rafIdRef.current) {
				cancelAnimationFrame(rafIdRef.current)
				rafIdRef.current = null
			}
		}

		// Очистка при размонтировании компонента
		return () => {
			document.removeEventListener('mousemove', handleGlobalMouseMove)
			document.removeEventListener('mouseup', handleMouseUp)
			document.body.classList.remove('dragging')
			document.body.style.cursor = ''

			if (rafIdRef.current) {
				cancelAnimationFrame(rafIdRef.current)
				rafIdRef.current = null
			}
		}
	}, [isDragging, handleGlobalMouseMove, handleMouseUp, startAnimation])

	return {
		isDragging,
		handleMouseDown,
		handleMouseMove,
		handleMouseUp,
	}
}
