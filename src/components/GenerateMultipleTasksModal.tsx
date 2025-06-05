import React, { useState } from 'react'
import styled from 'styled-components'
import { circuitApi, RootType } from '../services/api'
import { createPortal } from 'react-dom'
import { useTasksStore, Task } from '../store/tasksStore'
import { AxiosError } from 'axios'

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

const Input = styled.input`
	width: 100%;
	padding: 8px;
	border-radius: var(--radius-sm);
	border: 1px solid var(--border-color);
	background-color: var(--bg-color);
	color: var(--text-primary);
	font-size: 0.9rem;

	&:focus {
		outline: none;
		border-color: var(--primary-color);
	}
`

interface GenerateMultipleTasksModalProps {
	isOpen: boolean
	onClose: () => void
}

const GenerateMultipleTasksModal: React.FC<GenerateMultipleTasksModalProps> = ({
	isOpen,
	onClose,
}) => {
	const [order, setOrder] = useState<'first' | 'second'>('second')
	const [rootType, setRootType] = useState<RootType>(RootType.DIFFERENT)
	const [quantity, setQuantity] = useState(5)
	const [isLoading, setIsLoading] = useState(false)
	const [errors, setErrors] = useState<string[]>([])
	const [progress, setProgress] = useState(0)
	const { addTask } = useTasksStore()

	if (!isOpen) return null

	const handleSubmit = async () => {
		setIsLoading(true)
		setErrors([])
		setProgress(0)

		const orderValue = order === 'first' ? 1 : 2

		for (let i = 0; i < quantity; i++) {
			try {
				const response = await circuitApi.generateTask({
					order: orderValue,
					rootType: order === 'second' ? rootType : undefined,
				})

				const newTask: Task = {
					id: Date.now().toString() + i,
					imageUrl: `data:image/png;base64,${response.image}`,
					componentValues: response.componentValues,
					detailedSolution: response.detailedSolution!,
					requiredParameters: response.requiredParameters!,
				}
				addTask(newTask)
			} catch (err) {
				const errorMessage =
					err instanceof AxiosError
						? err.response?.data?.message ||
						  'Произошла ошибка при генерации задачи'
						: 'Произошла неизвестная ошибка'
				setErrors(prev => [...prev, `Ошибка ${i + 1}: ${errorMessage}`])
			} finally {
				setProgress(i + 1)
			}
		}

		setIsLoading(false)
		if (errors.length === 0) {
			onClose()
		}
	}

	return createPortal(
		<ModalBackground onClick={onClose}>
			<ModalContainer onClick={e => e.stopPropagation()}>
				<ModalHeader>
					<Title>Множественная генерация задач</Title>
				</ModalHeader>

				<Content>
					{errors.length > 0 && (
						<ErrorMessage>
							{errors.map((e, i) => (
								<div key={i}>{e}</div>
							))}
						</ErrorMessage>
					)}

					<OptionGroup>
						<Label>Порядок цепи:</Label>
						<RadioGroup>
							<RadioButton>
								<input
									type='radio'
									name='order-multiple'
									value='first'
									checked={order === 'first'}
									onChange={() => setOrder('first')}
									disabled={isLoading}
								/>
								<span>Первого порядка</span>
							</RadioButton>
							<RadioButton>
								<input
									type='radio'
									name='order-multiple'
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
							<Label>Тип корней:</Label>
							<RadioGroup>
								<RadioButton>
									<input
										type='radio'
										name='rootType-multiple'
										value={RootType.DIFFERENT}
										checked={rootType === RootType.DIFFERENT}
										onChange={() => setRootType(RootType.DIFFERENT)}
										disabled={isLoading}
									/>
									<span>Различные действительные</span>
								</RadioButton>
								<RadioButton>
									<input
										type='radio'
										name='rootType-multiple'
										value={RootType.COMPLEX}
										checked={rootType === RootType.COMPLEX}
										onChange={() => setRootType(RootType.COMPLEX)}
										disabled={isLoading}
									/>
									<span>Комплексно-сопряженные</span>
								</RadioButton>
							</RadioGroup>
						</OptionGroup>
					)}
					<OptionGroup>
						<Label>Количество задач:</Label>
						<Input
							type='number'
							value={quantity}
							onChange={e => setQuantity(Math.max(1, parseInt(e.target.value)))}
							disabled={isLoading}
							min='1'
						/>
					</OptionGroup>
				</Content>

				<ButtonGroup>
					<CancelButton onClick={onClose} disabled={isLoading}>
						Отмена
					</CancelButton>

					<GenerateButton onClick={handleSubmit} disabled={isLoading}>
						{isLoading && <LoadingSpinner />}
						{isLoading
							? `Генерация... (${progress}/${quantity})`
							: 'Начать генерацию'}
					</GenerateButton>
				</ButtonGroup>
			</ModalContainer>
		</ModalBackground>,
		document.body
	)
}

export default GenerateMultipleTasksModal
