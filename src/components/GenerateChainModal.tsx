import React, { useState } from 'react'
import styled from 'styled-components'

const ModalBackground = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
`

const ModalContainer = styled.div`
	background-color: var(--surface-color);
	border-radius: var(--radius-md);
	box-shadow: var(--shadow-lg);
	width: 500px;
	max-width: 90%;
	padding: 24px;
`

const ModalHeader = styled.div`
	margin-bottom: 20px;
`

const Title = styled.h3`
	margin: 0;
	color: var(--text-primary);
	font-size: 1.2rem;
	font-weight: 600;
`

const Content = styled.div`
	margin-bottom: 24px;
`

const OptionGroup = styled.div`
	margin-bottom: 16px;
`

const Label = styled.div`
	font-size: 0.9rem;
	font-weight: 500;
	color: var(--text-primary);
	margin-bottom: 8px;
`

const RadioGroup = styled.div`
	display: flex;
	gap: 16px;
	margin-bottom: 12px;
`

const RadioButton = styled.label`
	display: flex;
	align-items: center;
	gap: 8px;
	cursor: pointer;

	input {
		cursor: pointer;
	}

	span {
		font-size: 0.9rem;
		color: var(--text-primary);
	}
`

const ConditionalOptions = styled.div`
	margin-top: 8px;
	margin-left: 24px;
	padding-left: 8px;
	border-left: 2px solid var(--border-color);
`

const ButtonGroup = styled.div`
	display: flex;
	justify-content: flex-end;
	gap: 12px;
`

const Button = styled.button`
	padding: 8px 16px;
	border-radius: var(--radius-sm);
	font-size: 0.9rem;
	font-weight: 500;
	cursor: pointer;
	transition: var(--transition);

	&:focus {
		outline: none;
	}
`

const CancelButton = styled(Button)`
	background-color: transparent;
	border: 1px solid var(--border-color);
	color: var(--text-secondary);

	&:hover {
		background-color: var(--bg-color);
		border-color: var(--text-secondary);
	}
`

const GenerateButton = styled(Button)`
	background-color: var(--primary-color);
	border: 1px solid var(--primary-color);
	color: white;

	&:hover {
		background-color: var(--primary-dark);
	}
`

interface GenerateChainModalProps {
	isOpen: boolean
	onClose: () => void
	onGenerate: (options: ChainOptions) => void
}

export interface ChainOptions {
	order: 'first' | 'second'
	rootType?: 'equal' | 'complex' | 'different'
}

const GenerateChainModal: React.FC<GenerateChainModalProps> = ({
	isOpen,
	onClose,
	onGenerate,
}) => {
	const [order, setOrder] = useState<'first' | 'second'>('first')
	const [rootType, setRootType] = useState<'equal' | 'complex' | 'different'>(
		'equal'
	)

	if (!isOpen) return null

	const handleSubmit = () => {
		onGenerate({
			order,
			rootType: order === 'second' ? rootType : undefined,
		})
		onClose()
	}

	return (
		<ModalBackground onClick={onClose}>
			<ModalContainer onClick={e => e.stopPropagation()}>
				<ModalHeader>
					<Title>Сгенерировать цепь</Title>
				</ModalHeader>

				<Content>
					<OptionGroup>
						<Label>Порядок цепи:</Label>
						<RadioGroup>
							<RadioButton>
								<input
									type='radio'
									name='order'
									value='first'
									checked={order === 'first'}
									onChange={() => setOrder('first')}
								/>
								<span>Первого порядка</span>
							</RadioButton>
							<RadioButton>
								<input
									type='radio'
									name='order'
									value='second'
									checked={order === 'second'}
									onChange={() => setOrder('second')}
								/>
								<span>Второго порядка</span>
							</RadioButton>
						</RadioGroup>
					</OptionGroup>

					{order === 'second' && (
						<ConditionalOptions>
							<Label>Тип корней:</Label>
							<RadioGroup>
								<RadioButton>
									<input
										type='radio'
										name='rootType'
										value='equal'
										checked={rootType === 'equal'}
										onChange={() => setRootType('equal')}
									/>
									<span>Равные</span>
								</RadioButton>
								<RadioButton>
									<input
										type='radio'
										name='rootType'
										value='complex'
										checked={rootType === 'complex'}
										onChange={() => setRootType('complex')}
									/>
									<span>Комплексные</span>
								</RadioButton>
								<RadioButton>
									<input
										type='radio'
										name='rootType'
										value='different'
										checked={rootType === 'different'}
										onChange={() => setRootType('different')}
									/>
									<span>Разные</span>
								</RadioButton>
							</RadioGroup>
						</ConditionalOptions>
					)}
				</Content>

				<ButtonGroup>
					<CancelButton onClick={onClose}>Отмена</CancelButton>
					<GenerateButton onClick={handleSubmit}>Сгенерировать</GenerateButton>
				</ButtonGroup>
			</ModalContainer>
		</ModalBackground>
	)
}

export default GenerateChainModal
