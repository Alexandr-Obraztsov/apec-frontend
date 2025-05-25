import React, { useState } from 'react'
import styled from 'styled-components'
import { circuitApi, RootType } from '../services/api'
import { createPortal } from 'react-dom'

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
	z-index: 10000;
`

const ModalContainer = styled.div`
	background-color: var(--surface-color);
	border-radius: var(--radius-md);
	box-shadow: var(--shadow-lg);
	width: 500px;
	max-width: 90%;
	padding: 24px;
	margin-bottom: 8px;
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

	&:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}
`

const CancelButton = styled(Button)`
	background-color: transparent;
	border: 1px solid var(--border-color);
	color: var(--text-secondary);

	&:hover:not(:disabled) {
		background-color: var(--bg-color);
		border-color: var(--text-secondary);
	}
`

const GenerateButton = styled(Button)`
	background-color: var(--primary-color);
	border: 1px solid var(--primary-color);
	color: white;
	position: relative;

	&:hover:not(:disabled) {
		background-color: var(--primary-dark);
	}
`

const LoadingSpinner = styled.div`
	display: inline-block;
	width: 16px;
	height: 16px;
	margin-right: 8px;
	border: 2px solid rgba(255, 255, 255, 0.3);
	border-radius: 50%;
	border-top-color: white;
	animation: spin 1s linear infinite;

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
`

const ErrorMessage = styled.div`
	color: red;
	margin-bottom: 16px;
	font-size: 0.9rem;
`

interface GenerateChainModalProps {
	isOpen: boolean
	onClose: () => void
	onGenerate: (options: ChainOptions) => void
}

export interface ChainOptions {
	order: 'first' | 'second'
	rootType?: RootType
	circuit: string
}

const GenerateChainModal: React.FC<GenerateChainModalProps> = ({
	isOpen,
	onClose,
	onGenerate,
}) => {
	const [order, setOrder] = useState<'first' | 'second'>('first')
	const [rootType, setRootType] = useState<RootType>(RootType.DIFFERENT)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	if (!isOpen) return null

	const handleSubmit = async () => {
		try {
			setIsLoading(true)
			setError(null)

			// Преобразуем порядок из строкового в числовой
			const orderValue = order === 'first' ? 1 : 2

			// Для одиночной генерации используем существующий метод
			const response = await circuitApi.generateCircuit({
				order: orderValue,
				rootType: order === 'second' ? rootType : undefined,
			})

			if (response.status === 'success' && response.circuit) {
				onGenerate({
					order,
					rootType: order === 'second' ? rootType : undefined,
					circuit: response.circuit,
				})
				onClose() // Закрываем модальное окно после успешной генерации
			} else {
				setError(
					// Устанавливаем общее сообщение, так как response.message отсутствует в GenerateCircuitResponse
					'Произошла ошибка при генерации цепи. Попробуйте еще раз.'
				)
			}
		} catch (err) {
			console.error('Ошибка при генерации цепи:', err)
			let errorMessage = 'Ошибка при генерации цепи. Попробуйте позже.'
			if (err instanceof Error) {
				errorMessage = err.message
			}
			setError(errorMessage)
		} finally {
			setIsLoading(false)
		}
	}

	return createPortal(
		<ModalBackground onClick={onClose}>
			<ModalContainer onClick={e => e.stopPropagation()}>
				<ModalHeader>
					<Title>Генерация цепи</Title>
				</ModalHeader>

				<Content>
					{error && <ErrorMessage>{error}</ErrorMessage>}

					<OptionGroup>
						<Label>Порядок цепи:</Label>
						<RadioGroup>
							<RadioButton>
								<input
									type='radio'
									name='order'
									value='first'
									checked={order === 'first'}
									onChange={() => {
										setOrder('first')
									}}
									disabled={isLoading}
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
									disabled={isLoading}
								/>
								<span>Второго порядка</span>
							</RadioButton>
						</RadioGroup>
					</OptionGroup>

					{order === 'second' && (
						<OptionGroup>
							<Label>Тип корневого элемента:</Label>
							<RadioGroup>
								<RadioButton>
									<input
										type='radio'
										name='rootType'
										value={RootType.DIFFERENT}
										checked={rootType === RootType.DIFFERENT}
										onChange={() => setRootType(RootType.DIFFERENT)}
										disabled={isLoading}
									/>
									<span>Разные</span>
								</RadioButton>
								<RadioButton>
									<input
										type='radio'
										name='rootType'
										value={RootType.COMPLEX}
										checked={rootType === RootType.COMPLEX}
										onChange={() => setRootType(RootType.COMPLEX)}
										disabled={isLoading}
									/>
									<span>Комплексные</span>
								</RadioButton>
							</RadioGroup>
						</OptionGroup>
					)}
				</Content>

				<ButtonGroup>
					<CancelButton onClick={onClose} disabled={isLoading}>
						Отмена
					</CancelButton>

					<GenerateButton onClick={handleSubmit} disabled={isLoading}>
						{isLoading && <LoadingSpinner />}
						{isLoading ? 'Генерация...' : 'Сгенерировать'}
					</GenerateButton>
				</ButtonGroup>
			</ModalContainer>
		</ModalBackground>,
		document.body
	)
}

export default GenerateChainModal
