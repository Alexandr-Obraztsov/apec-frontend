import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useCircuitStore } from '../store/circuitStore'
import { ElementType } from '../types'

const PanelContainer = styled.div`
	position: fixed;
	right: 20px;
	top: 80px;
	width: 280px;
	background-color: var(--surface-color);
	border-radius: var(--radius-md);
	box-shadow: var(--shadow-md);
	padding: 0;
	z-index: 100;
	overflow: hidden;
	display: flex;
	flex-direction: column;
`

const PanelHeader = styled.div`
	padding: 16px 20px;
	border-bottom: 1px solid var(--border-color);
	background-color: var(--bg-color);
`

const Title = styled.h3`
	margin: 0;
	color: var(--text-primary);
	font-size: 1.1rem;
	font-weight: 600;
`

const TitleInfo = styled.span`
	color: var(--primary-color);
	font-weight: 600;
`

const PanelContent = styled.div`
	padding: 20px;
	overflow-y: auto;
	max-height: calc(100vh - 200px);
`

const FormGroup = styled.div`
	margin-bottom: 16px;
`

const Label = styled.label`
	display: block;
	margin-bottom: 6px;
	font-weight: 500;
	font-size: 0.9rem;
	color: var(--text-secondary);
`

const Input = styled.input`
	width: 100%;
	padding: 10px 12px;
	border: 1px solid var(--border-color);
	border-radius: var(--radius-sm);
	font-size: 0.9rem;
	transition: var(--transition);

	&:focus {
		border-color: var(--primary-color);
		box-shadow: 0 0 0 3px var(--primary-light);
		outline: none;
	}

	&:disabled,
	&[readonly] {
		background-color: var(--bg-color);
		color: var(--text-secondary);
	}
`

const ElementIcon = styled.div`
	width: 40px;
	height: 40px;
	border-radius: 50%;
	background: var(--primary-light);
	color: var(--primary-color);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 1.2rem;
	margin-right: 12px;
`

const ElementHeader = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: 20px;
`

const ElementTitle = styled.div`
	h4 {
		margin: 0;
		font-size: 1rem;
	}

	p {
		margin: 2px 0 0 0;
		font-size: 0.8rem;
		color: var(--text-secondary);
	}
`

const Button = styled.button`
	width: 100%;
	padding: 12px;
	background-color: var(--danger-color);
	color: white;
	border: none;
	border-radius: var(--radius-sm);
	cursor: pointer;
	margin-top: 8px;
	transition: var(--transition);
	font-weight: 500;

	&:hover {
		background-color: #c0392b;
	}
`

const Message = styled.div`
	padding: 20px;
	text-align: center;
	color: var(--text-secondary);
	font-size: 0.9rem;
`

const ElementList = styled.ul`
	list-style: none;
	padding: 0;
	margin: 0;
`

const ElementListItem = styled.li`
	padding: 10px 0;
	border-bottom: 1px solid var(--border-color);
	display: flex;
	align-items: center;
	font-size: 0.9rem;

	&:last-child {
		border-bottom: none;
	}

	.icon {
		width: 24px;
		height: 24px;
		border-radius: 4px;
		background: var(--primary-light);
		color: var(--primary-color);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 10px;
		font-size: 0.7rem;
	}

	.details {
		flex: 1;
		display: flex;
		justify-content: space-between;
	}

	.value {
		color: var(--text-secondary);
	}
`

// Component titles mapping
const ELEMENT_TITLES: Record<ElementType, string> = {
	wire: 'Провод',
	resistor: 'Резистор',
	capacitor: 'Конденсатор',
	inductor: 'Катушка индуктивности',
	voltage: 'Источник напряжения',
}

// Иконки для типов элементов
const ELEMENT_ICON_CHARS: Record<ElementType, string> = {
	wire: 'W',
	resistor: 'R',
	capacitor: 'C',
	inductor: 'L',
	voltage: 'V',
}

const PropertiesPanel: React.FC = () => {
	const elements = useCircuitStore(state => state.elements)
	const nodes = useCircuitStore(state => state.nodes)
	const selectedElementId = useCircuitStore(state => state.selectedElementId)
	const selectedNodeId = useCircuitStore(state => state.selectedNodeId)
	const updateElementValue = useCircuitStore(state => state.updateElementValue)
	const removeElement = useCircuitStore(state => state.removeElement)

	const [currentValue, setCurrentValue] = useState<number>(0)

	// Найдем выбранный элемент и узел
	const selectedElement = elements.find(
		element => element.id === selectedElementId
	)
	const selectedNode = nodes.find(node => node.id === selectedNodeId)

	// Если выбран узел, найдем элементы, подключенные к нему
	const connectedElements = selectedNode
		? selectedNode.connectedElements
				.map(id => elements.find(element => element.id === id))
				.filter(Boolean)
		: []

	// Обновляем локальное состояние при изменении выбранного элемента
	useEffect(() => {
		if (selectedElement) {
			setCurrentValue(selectedElement.value)
		}
	}, [selectedElement])

	// Если ничего не выбрано, показываем сообщение
	if (!selectedElement && !selectedNode) {
		return (
			<PanelContainer>
				<PanelHeader>
					<Title>Свойства</Title>
				</PanelHeader>
				<Message>Выберите элемент или узел для просмотра свойств</Message>
			</PanelContainer>
		)
	}

	// Если выбран узел, показываем информацию о нем
	if (selectedNode) {
		return (
			<PanelContainer>
				<PanelHeader>
					<Title>
						Узел <TitleInfo>#{selectedNode.id.substring(0, 6)}</TitleInfo>
					</Title>
				</PanelHeader>
				<PanelContent>
					<FormGroup>
						<Label>Позиция</Label>
						<Input
							type='text'
							value={`X: ${selectedNode.position.x.toFixed(
								0
							)}, Y: ${selectedNode.position.y.toFixed(0)}`}
							readOnly
						/>
					</FormGroup>

					<FormGroup>
						<Label>Подключенные элементы</Label>
						{connectedElements.length === 0 ? (
							<Message>Нет подключенных элементов</Message>
						) : (
							<ElementList>
								{connectedElements.map((element, index) => (
									<ElementListItem key={index}>
										<div className='icon'>
											{element && ELEMENT_ICON_CHARS[element.type]}
										</div>
										<div className='details'>
											<span>{element && ELEMENT_TITLES[element.type]}</span>
											<span className='value'>
												{element?.type !== 'wire'
													? `${element?.value} ${element?.unit}`
													: ''}
											</span>
										</div>
									</ElementListItem>
								))}
							</ElementList>
						)}
					</FormGroup>
				</PanelContent>
			</PanelContainer>
		)
	}

	// Если выбран элемент
	const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = parseFloat(e.target.value)
		setCurrentValue(value)
	}

	const handleValueBlur = () => {
		if (selectedElementId) {
			updateElementValue(selectedElementId, currentValue)
		}
	}

	const handleDelete = () => {
		if (selectedElementId) {
			removeElement(selectedElementId)
		}
	}

	return (
		<PanelContainer>
			<PanelHeader>
				<Title>Свойства элемента</Title>
			</PanelHeader>
			<PanelContent>
				<ElementHeader>
					<ElementIcon>
						{selectedElement && ELEMENT_ICON_CHARS[selectedElement.type]}
					</ElementIcon>
					<ElementTitle>
						<h4>{selectedElement && ELEMENT_TITLES[selectedElement.type]}</h4>
						<p>ID: #{selectedElementId?.substring(0, 6)}</p>
					</ElementTitle>
				</ElementHeader>

				{selectedElement?.type !== 'wire' && (
					<FormGroup>
						<Label>Значение ({selectedElement?.unit})</Label>
						<Input
							type='number'
							min='0'
							value={currentValue}
							onChange={handleValueChange}
							onBlur={handleValueBlur}
						/>
					</FormGroup>
				)}

				<Button onClick={handleDelete}>Удалить элемент</Button>
			</PanelContent>
		</PanelContainer>
	)
}

export default PropertiesPanel
