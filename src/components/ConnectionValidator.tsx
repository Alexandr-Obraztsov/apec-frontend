import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useCircuitStore } from '../store/circuitStore'
import { Node } from '../types'

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
	margin-top: 10px;
	font-weight: 500;
	cursor: pointer;
	transition: background-color 0.2s;

	&:hover {
		background-color: #006400;
	}
`

// Стили для попапа
const PopupOverlay = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 2000;
`

const PopupContent = styled.div`
	background-color: white;
	padding: 20px;
	border-radius: 8px;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
	width: 500px;
	max-width: 90%;
`

const PopupHeader = styled.div`
	font-size: 18px;
	font-weight: 600;
	margin-bottom: 15px;
	padding-bottom: 10px;
	border-bottom: 1px solid var(--border-color);
	display: flex;
	justify-content: space-between;
`

const PopupCloseButton = styled.button`
	background: none;
	border: none;
	font-size: 20px;
	cursor: pointer;
	color: var(--text-secondary);

	&:hover {
		color: var(--text-primary);
	}
`

const ConnectionValidator: React.FC = () => {
	// Получаем узлы из хранилища
	const nodes = useCircuitStore(state => state.nodes)

	// Состояние для неподключенных узлов
	const [unconnectedNodes, setUnconnectedNodes] = useState<Node[]>([])

	// Состояние для попапа
	const [isPopupOpen, setIsPopupOpen] = useState(false)

	// Проверяем узлы на наличие соединений
	useEffect(() => {
		// Фильтруем узлы, у которых менее 2-х соединений
		const badNodes = nodes.filter(node => node.connectedElements.length < 2)
		setUnconnectedNodes(badNodes)
	}, [nodes])

	// Обработчик открытия попапа
	const handleOpenPopup = () => {
		setIsPopupOpen(true)
	}

	// Обработчик закрытия попапа
	const handleClosePopup = () => {
		setIsPopupOpen(false)
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

	// Если все узлы подключены корректно, показываем кнопку "Решить задачу"
	return (
		<>
			<SolveContainer>
				<AlertTitle style={{ color: '#008000' }}>
					<span>✓</span>
					<span>Схема корректна</span>
				</AlertTitle>
				<SolveButton onClick={handleOpenPopup}>Решить задачу</SolveButton>
			</SolveContainer>

			{isPopupOpen && (
				<PopupOverlay>
					<PopupContent>
						<PopupHeader>
							<div>Решение задачи</div>
							<PopupCloseButton onClick={handleClosePopup}>×</PopupCloseButton>
						</PopupHeader>
						<div>
							{/* Здесь будет содержимое попапа */}
							<p>Решение задачи будет реализовано в следующих версиях.</p>
						</div>
					</PopupContent>
				</PopupOverlay>
			)}
		</>
	)
}

export default ConnectionValidator
