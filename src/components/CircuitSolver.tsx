import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useCircuitStore } from '../store/circuitStore'
import { Node } from '../types'
import { circuitApi, CircuitSolutionResult } from '../services/api'
import CircuitSolutionModal from './CircuitSolutionModal'

// Стили для уведомления
const AlertContainer = styled.div`
	position: absolute;
	bottom: 50px;
	left: 20px;
	margin-inline: auto;
	background-color: rgba(255, 0, 0, 0.1);
	border: 1px solid #ff3333;
	border-radius: 8px;
	padding: 15px;
	max-width: 300px;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	color: #ff3333;
	z-index: 1000;
`

const SolveContainer = styled.div`
	position: absolute;
	bottom: 50px;
	left: 20px;
	margin-inline: auto;
	background-color: rgba(0, 128, 0, 0.1);
	border: 1px solid #008000;
	border-radius: 8px;
	padding: 15px;
	max-width: 300px;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	color: #008000;
	z-index: 1000;
	display: flex;
	flex-direction: column;
	align-items: center;
`

const AlertTitle = styled.div`
	font-weight: 500;
	font-size: 16px;
	margin-bottom: 10px;
	display: flex;
	align-items: center;
	gap: 8px;
`

const AlertList = styled.ul`
	margin: 0;
	padding-left: 20px;
	font-size: 14px;
`

const ListItem = styled.li`
	margin-bottom: 5px;
`

const SolveButton = styled.button`
	background-color: #008000;
	color: white;
	border: none;
	border-radius: 4px;
	padding: 8px 16px;
	font-weight: 500;
	cursor: pointer;
	transition: background-color 0.2s;
	display: flex;
	align-items: center;
	justify-content: center;

	&:hover {
		background-color: #006400;
	}

	&:disabled {
		background-color: #9dbb9d;
		cursor: not-allowed;
	}
`

const CircuitSolver: React.FC = () => {
	// Получаем узлы из хранилища
	const nodes = useCircuitStore(state => state.nodes)
	const elements = useCircuitStore(state => state.elements)

	// Состояние для неподключенных узлов
	const [unconnectedNodes, setUnconnectedNodes] = useState<Node[]>([])

	// Состояние для попапа
	const [isPopupOpen, setIsPopupOpen] = useState(false)

	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// Добавляем состояние для результатов с уравнениями
	const [solutionEquations, setSolutionEquations] =
		useState<CircuitSolutionResult | null>(null)

	// Проверяем узлы на наличие соединений
	useEffect(() => {
		// Фильтруем узлы, у которых менее 2-х соединений
		const badNodes = nodes.filter(node => node.connectedElements.length < 2)
		setUnconnectedNodes(badNodes)
	}, [nodes])

	// Обработчик нажатия на кнопку "Решить задачу"
	const handleSolveButtonClick = async () => {
		// Сбрасываем предыдущие результаты и ошибки
		setError(null)
		setSolutionEquations(null)

		// Сначала открываем попап и показываем в нем загрузку
		setIsLoading(true)
		setIsPopupOpen(true)

		circuitApi
			.solveCircuit({
				nodes: nodes,
				elements: elements,
			})
			.then(response => {
				if (response.status === 'success' && response.solution) {
					setSolutionEquations(response.solution)
				}
			})
			.catch(err => {
				setError(err.response.data.message)
			})
			.finally(() => {
				setIsLoading(false)
			})
	}

	// Обработчик закрытия попапа
	const handleClosePopup = () => {
		setIsPopupOpen(false)
		// Сбрасываем флаг загрузки при закрытии попапа,
		// чтобы кнопка становилась доступной
		if (isLoading) {
			setIsLoading(false)
		}
	}

	// Если нет узлов вообще, не отображаем ничего
	if (nodes.length === 0) {
		return null
	}

	// Если есть неподключенные узлы, показываем предупреждение
	if (unconnectedNodes.length > 0) {
		return (
			<AlertContainer>
				<AlertTitle>
					<span>⚠️</span>
					<span>Обнаружены неполные соединения</span>
				</AlertTitle>
				{unconnectedNodes.length < 5 ? (
					<AlertList>
						{unconnectedNodes.map(node => (
							<ListItem key={node.id}>
								Узел {node.name} имеет только {node.connectedElements.length}{' '}
								соединение
								{node.connectedElements.length === 1 ? '' : 'я'}
							</ListItem>
						))}
					</AlertList>
				) : (
					<AlertList>
						<ListItem>
							Узлы {unconnectedNodes.map(node => node.name).join(', ')} имеют
							только одно соединение
						</ListItem>
					</AlertList>
				)}
			</AlertContainer>
		)
	}

	// Если все узлы подключены корректно, показываем кнопку решения
	return (
		<>
			<SolveContainer>
				<AlertTitle style={{ color: '#008000' }}>
					<span>✓</span>
					<span>Схема корректна</span>
				</AlertTitle>
				<SolveButton onClick={handleSolveButtonClick} disabled={isLoading}>
					Решить задачу
				</SolveButton>
			</SolveContainer>

			<CircuitSolutionModal
				isOpen={isPopupOpen}
				onClose={handleClosePopup}
				isLoading={isLoading}
				error={error}
				solutionEquations={solutionEquations}
			/>
		</>
	)
}

export default CircuitSolver
