import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useCircuitStore } from '../store/circuitStore'
import { ElementType } from '../types'

const PanelContainer = styled.div`
	position: fixed;
	right: 0;
	top: 70px;
	width: 280px;
	height: calc(100vh - 70px);
	background: rgba(255, 255, 255, 0.95);
	backdrop-filter: blur(20px);
	border-left: 1px solid rgba(102, 126, 234, 0.2);
	box-shadow: -4px 0 32px rgba(102, 126, 234, 0.15);
	padding: 24px;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	z-index: 200;

	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: radial-gradient(
				circle at 20% 50%,
				rgba(124, 58, 237, 0.1) 0%,
				transparent 50%
			),
			radial-gradient(
				circle at 80% 20%,
				rgba(139, 92, 246, 0.1) 0%,
				transparent 50%
			),
			radial-gradient(
				circle at 40% 80%,
				rgba(59, 130, 246, 0.1) 0%,
				transparent 50%
			);
		pointer-events: none;
		z-index: 0;
	}

	> * {
		position: relative;
		z-index: 1;
	}
`

const PanelHeader = styled.div`
	margin-bottom: 24px;
	padding: 20px;
	background: linear-gradient(135deg, #f8fafc, #f1f5f9);
	border: 1px solid #e2e8f0;
	border-radius: 16px;
	box-shadow: 0 8px 32px rgba(102, 126, 234, 0.1);
	position: relative;
	overflow: hidden;

	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: linear-gradient(90deg, #667eea, #764ba2);
	}
`

const Title = styled.h3`
	margin: 0;
	font-size: 1.4rem;
	font-weight: 700;
	background: linear-gradient(135deg, #667eea, #764ba2);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
	text-shadow: 0 2px 4px rgba(102, 126, 234, 0.2);
`

const SubTitle = styled.p`
	margin: 8px 0 0 0;
	color: var(--text-secondary);
	font-size: 0.9rem;
	font-weight: 500;
`

const TitleInfo = styled.span`
	color: #667eea;
	font-weight: 600;
`

const PanelContent = styled.div`
	overflow-y: auto;
	flex: 1;
`

const FormGroup = styled.div`
	margin-bottom: 20px;
`

const Label = styled.label`
	display: block;
	margin-bottom: 8px;
	font-weight: 600;
	font-size: 0.9rem;
	color: var(--text-primary);
`

const Input = styled.input`
	width: 100%;
	padding: 12px 16px;
	background: linear-gradient(135deg, #f8fafc, #f1f5f9);
	border: 1px solid #e2e8f0;
	border-radius: 12px;
	font-size: 0.9rem;
	color: var(--text-primary);
	transition: all 0.3s ease;
	box-shadow: 0 4px 16px rgba(102, 126, 234, 0.1);

	&:focus {
		border-color: #667eea;
		box-shadow: 0 8px 32px rgba(102, 126, 234, 0.2);
		outline: none;
	}

	&:disabled,
	&[readonly] {
		background: #f1f5f9;
		color: var(--text-secondary);
		cursor: not-allowed;
	}

	&::placeholder {
		color: var(--text-secondary);
	}
`

const ElementIcon = styled.div`
	width: 48px;
	height: 48px;
	border-radius: 50%;
	background: linear-gradient(135deg, #667eea, #764ba2);
	color: white;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 1.4rem;
	margin-right: 16px;
	box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
`

const ElementHeader = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: 24px;
	padding: 16px;
	background: linear-gradient(135deg, #f8fafc, #f1f5f9);
	border: 1px solid #e2e8f0;
	border-radius: 12px;
	box-shadow: 0 4px 16px rgba(102, 126, 234, 0.1);
	position: relative;
	overflow: hidden;

	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: linear-gradient(90deg, #667eea, #764ba2);
	}
`

const ElementTitle = styled.div`
	h4 {
		margin: 0;
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	p {
		margin: 4px 0 0 0;
		font-size: 0.8rem;
		color: var(--text-secondary);
	}
`

const Button = styled.button`
	width: 100%;
	padding: 14px 16px;
	background: linear-gradient(135deg, #ef4444, #dc2626);
	color: white;
	border: none;
	border-radius: 12px;
	cursor: pointer;
	margin-top: 12px;
	transition: all 0.3s ease;
	font-weight: 600;
	font-size: 0.9rem;
	position: relative;
	overflow: hidden;
	backdrop-filter: blur(20px);
	border: 1px solid rgba(239, 68, 68, 0.3);
	box-shadow: 0 8px 32px rgba(239, 68, 68, 0.2),
		inset 0 1px 0 rgba(255, 255, 255, 0.2);

	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			90deg,
			transparent,
			rgba(255, 255, 255, 0.2),
			transparent
		);
		transition: left 0.5s ease;
	}

	&:hover {
		transform: translateY(-2px);
		box-shadow: 0 12px 40px rgba(239, 68, 68, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);

		&::before {
			left: 100%;
		}
	}

	&:active {
		transform: translateY(0);
	}
`

const Message = styled.div`
	padding: 24px;
	text-align: center;
	color: rgba(124, 58, 237, 0.7);
	font-size: 0.9rem;
	background: rgba(255, 255, 255, 0.1);
	backdrop-filter: blur(20px);
	border: 1px solid rgba(124, 58, 237, 0.2);
	border-radius: 12px;
	box-shadow: 0 4px 16px rgba(124, 58, 237, 0.1),
		inset 0 1px 0 rgba(255, 255, 255, 0.1);
`

const ElementList = styled.ul`
	list-style: none;
	padding: 0;
	margin: 0;
`

const ElementListItem = styled.li`
	padding: 16px;
	border-bottom: 1px solid rgba(124, 58, 237, 0.1);
	display: flex;
	align-items: center;
	font-size: 0.9rem;
	background: rgba(255, 255, 255, 0.05);
	backdrop-filter: blur(20px);
	margin-bottom: 8px;
	border-radius: 8px;
	transition: all 0.3s ease;
	box-shadow: 0 2px 8px rgba(124, 58, 237, 0.05),
		inset 0 1px 0 rgba(255, 255, 255, 0.1);

	&:last-child {
		border-bottom: none;
	}

	&:hover {
		background: rgba(255, 255, 255, 0.1);
		transform: translateY(-1px);
		box-shadow: 0 4px 16px rgba(124, 58, 237, 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
	}

	.icon {
		width: 32px;
		height: 32px;
		border-radius: 8px;
		background: linear-gradient(
			135deg,
			rgba(124, 58, 237, 0.2),
			rgba(59, 130, 246, 0.2)
		);
		color: #7c3aed;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 12px;
		font-size: 0.8rem;
		font-weight: 600;
		box-shadow: 0 2px 8px rgba(124, 58, 237, 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
	}

	.details {
		flex: 1;
		display: flex;
		justify-content: space-between;
		color: rgba(124, 58, 237, 0.9);
	}

	.value {
		color: rgba(124, 58, 237, 0.7);
		font-weight: 500;
	}
`

const SwitchLabel = styled.label`
	display: flex;
	align-items: center;
	cursor: pointer;
	margin-bottom: 20px;
	user-select: none;
	padding: 12px;
	background: rgba(255, 255, 255, 0.1);
	backdrop-filter: blur(20px);
	border: 1px solid rgba(124, 58, 237, 0.2);
	border-radius: 12px;
	transition: all 0.3s ease;
	box-shadow: 0 4px 16px rgba(124, 58, 237, 0.1),
		inset 0 1px 0 rgba(255, 255, 255, 0.1);

	&:hover {
		background: rgba(255, 255, 255, 0.15);
		border-color: rgba(124, 58, 237, 0.3);
	}
`

const SwitchInput = styled.input`
	opacity: 0;
	width: 0;
	height: 0;
	position: absolute;
`

const SwitchSlider = styled.span<{ $checked: boolean }>`
	position: relative;
	display: inline-block;
	width: 48px;
	height: 24px;
	background: ${props =>
		props.$checked
			? 'linear-gradient(135deg, #10B981, #059669)'
			: 'rgba(124, 58, 237, 0.2)'};
	border-radius: 24px;
	margin-right: 12px;
	transition: all 0.3s ease;
	cursor: pointer;
	backdrop-filter: blur(20px);
	border: 1px solid
		${props =>
			props.$checked ? 'rgba(16, 185, 129, 0.3)' : 'rgba(124, 58, 237, 0.3)'};
	box-shadow: 0 4px 16px
			${props =>
				props.$checked ? 'rgba(16, 185, 129, 0.2)' : 'rgba(124, 58, 237, 0.1)'},
		inset 0 1px 0 rgba(255, 255, 255, 0.2);

	&::before {
		content: '';
		position: absolute;
		height: 18px;
		width: 18px;
		left: ${props => (props.$checked ? '26px' : '3px')};
		top: 2px;
		background: white;
		border-radius: 50%;
		transition: all 0.3s ease;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
	}
`

const SwitchText = styled.span`
	font-size: 0.9rem;
	font-weight: 500;
	color: rgba(124, 58, 237, 0.9);
`

// Component titles mapping
const ELEMENT_TITLES: Record<ElementType, string> = {
	wire: 'Провод',
	resistor: 'Резистор',
	capacitor: 'Конденсатор',
	inductor: 'Катушка индуктивности',
	voltage: 'Источник напряжения',
	switch: 'Ключ',
}

// Иконки для типов элементов
const ELEMENT_ICON_CHARS: Record<ElementType, string> = {
	wire: 'W',
	resistor: 'R',
	capacitor: 'C',
	inductor: 'L',
	voltage: 'V',
	switch: 'S',
}

const PropertiesPanel: React.FC = () => {
	const elements = useCircuitStore(state => state.elements)
	const nodes = useCircuitStore(state => state.nodes)
	const selectedElementId = useCircuitStore(state => state.selectedElementId)
	const selectedNodeId = useCircuitStore(state => state.selectedNodeId)
	const updateElementValue = useCircuitStore(state => state.updateElementValue)
	const updateSwitchState = useCircuitStore(state => state.updateSwitchState)
	const removeElement = useCircuitStore(state => state.removeElement)

	const [currentValue, setCurrentValue] = useState<string>('')
	const [switchState, setSwitchState] = useState<boolean>(false)

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
			// Преобразуем любое значение (число или строку) в строку
			setCurrentValue(String(selectedElement.value))

			// Устанавливаем состояние переключателя, если выбран ключ
			if (selectedElement.type === 'switch') {
				// !isOpen потому что 1 = включен, 0 = выключен
				setSwitchState(
					typeof selectedElement.isOpen === 'boolean'
						? !selectedElement.isOpen
						: false
				)
			}
		}
	}, [selectedElement])

	// Если ничего не выбрано, показываем сообщение
	if (!selectedElement && !selectedNode) {
		return (
			<PanelContainer>
				<PanelHeader>
					<Title>Свойства</Title>
					<SubTitle>Выберите элемент для редактирования</SubTitle>
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
						Узел <TitleInfo>{selectedNode.name}</TitleInfo>
					</Title>
					<SubTitle>Информация о выбранном узле</SubTitle>
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
										<div className='icon'>{element && element.name}</div>
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
		// Всегда сохраняем введенное значение как строку, без попыток преобразования в число
		setCurrentValue(e.target.value)
	}

	const handleValueBlur = () => {
		if (selectedElementId) {
			updateElementValue(selectedElementId, currentValue)
		}
	}

	const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newState = e.target.checked
		setSwitchState(newState)

		if (selectedElementId) {
			// Передаем !newState потому что в isOpen: true = разомкнут (ВЫКЛ), false = замкнут (ВКЛ)
			updateSwitchState(selectedElementId, !newState)

			// Устанавливаем value в соответствии с состоянием: 1 для включен, 0 для выключен
			updateElementValue(selectedElementId, newState ? '1' : '0')
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
				<SubTitle>Настройка параметров компонента</SubTitle>
			</PanelHeader>
			<PanelContent>
				<ElementHeader>
					<ElementIcon>
						{selectedElement && ELEMENT_ICON_CHARS[selectedElement.type]}
					</ElementIcon>
					<ElementTitle>
						<h4>{selectedElement && selectedElement.name}</h4>
						<p>{selectedElement && ELEMENT_TITLES[selectedElement.type]}</p>
					</ElementTitle>
				</ElementHeader>

				{selectedElement?.type === 'switch' && (
					<FormGroup>
						<SwitchLabel>
							<SwitchInput
								type='checkbox'
								checked={switchState}
								onChange={handleSwitchChange}
							/>
							<SwitchSlider $checked={switchState} />
							<SwitchText>{switchState ? 'Включен' : 'Выключен'}</SwitchText>
						</SwitchLabel>
					</FormGroup>
				)}

				{selectedElement?.type !== 'wire' &&
					selectedElement?.type !== 'switch' && (
						<FormGroup>
							<Label>Значение ({selectedElement?.unit})</Label>
							<Input
								type='text'
								value={currentValue}
								onChange={handleValueChange}
								onBlur={handleValueBlur}
								placeholder='Введите число или выражение (например, sin, j)'
							/>
						</FormGroup>
					)}

				<Button onClick={handleDelete}>Удалить элемент</Button>
			</PanelContent>
		</PanelContainer>
	)
}

export default PropertiesPanel
