import React, { useState } from 'react'
import styled from 'styled-components'
import { circuitApi, RootType } from '../services/api'

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

const CheckboxInput = styled(RadioButton)`
	margin-top: 8px;
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
	const [rootType, setRootType] = useState<RootType>(RootType.EQUAL)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [isMultiple, setIsMultiple] = useState(false)
	const [multipleCount, setMultipleCount] = useState(5)

	if (!isOpen) return null

	const handleSubmit = async () => {
		try {
			setIsLoading(true)
			setError(null)

			// Преобразуем порядок из строкового в числовой
			const orderValue = order === 'first' ? 1 : 2

			if (isMultiple && order === 'second') {
				// Вызываем API для множественной генерации цепей
				await circuitApi.generateMultipleCircuits({
					count: multipleCount,
					rootType,
				})

				// Пока просто закрываем модальное окно, потому что результаты не обрабатываем
				onClose()
			} else {
				// Вызываем API для генерации одной цепи
				const response = await circuitApi.generateCircuit({
					order: orderValue,
					rootType,
				})

				if (response.status === 'success' && response.circuit) {
					// Вызываем обработчик с параметрами и сгенерированной цепью
					onGenerate({
						order,
						rootType: order === 'second' ? rootType : undefined,
						circuit: response.circuit,
					})

					// Закрываем модальное окно
					onClose()
				} else {
					setError('Ошибка при генерации цепи: Неверный формат ответа')
				}
			}
		} catch (err) {
			console.error('Ошибка при генерации цепи:', err)
			setError('Ошибка при генерации цепи. Попробуйте позже.')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<ModalBackground onClick={onClose}>
			<ModalContainer onClick={e => e.stopPropagation()}>
				<ModalHeader>
					<Title>Сгенерировать цепь</Title>
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
										setIsMultiple(false) // Отключаем множественную генерацию для цепей первого порядка
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

						{order === 'second' && (
							<CheckboxInput>
								<input
									type='checkbox'
									checked={isMultiple}
									onChange={e => setIsMultiple(e.target.checked)}
									disabled={isLoading}
								/>
								<span>Сгенерировать несколько цепей</span>
							</CheckboxInput>
						)}
					</OptionGroup>

					{order === 'second' && (
						<ConditionalOptions>
							<Label>Тип корней:</Label>
							<RadioGroup>
								<RadioButton>
									<input
										type='radio'
										name='rootType'
										value='complex'
										checked={rootType === RootType.COMPLEX}
										onChange={() => setRootType(RootType.COMPLEX)}
										disabled={isLoading}
									/>
									<span>Комплексные</span>
								</RadioButton>
								<RadioButton>
									<input
										type='radio'
										name='rootType'
										value='different'
										checked={rootType === RootType.DIFFERENT}
										onChange={() => setRootType(RootType.DIFFERENT)}
										disabled={isLoading}
									/>
									<span>Разные</span>
								</RadioButton>
							</RadioGroup>
						</ConditionalOptions>
					)}

					{order === 'second' && isMultiple && (
						<OptionGroup>
							<Label>Количество цепей для генерации:</Label>
							<input
								type='number'
								min='1'
								max='20'
								value={multipleCount}
								onChange={e => setMultipleCount(parseInt(e.target.value) || 5)}
								style={{
									padding: '8px',
									borderRadius: 'var(--radius-sm)',
									border: '1px solid var(--border-color)',
									width: '100px',
								}}
								disabled={isLoading}
							/>
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
		</ModalBackground>
	)
}

export default GenerateChainModal
