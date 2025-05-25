import React, { useState } from 'react'
import styled from 'styled-components'
import { circuitApi, RootType } from '../services/api'

const Container = styled.div`
	padding: 2rem;
	width: 100%;
	margin: 0 auto;
	background-color: var(--background-color);
	border-radius: var(--radius-lg);
`

const Card = styled.div`
	background: var(--surface-color);
	border-radius: var(--radius-lg);
	padding: 2rem;
	box-shadow: var(--shadow-md);
`

const Title = styled.h2`
	color: var(--text-primary);
	margin: 0 0 1.5rem 0;
	font-size: 1.5rem;
	font-weight: 600;
`

const OptionsGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
	gap: 2rem;
	margin-bottom: 2rem;
`

const OptionCard = styled.div`
	background: var(--background-color);
	border-radius: var(--radius-md);
	padding: 1.5rem;
	border: 1px solid var(--border-color);
`

const OptionTitle = styled.h3`
	color: var(--text-primary);
	margin: 0 0 1rem 0;
	font-size: 1.1rem;
	font-weight: 500;
`

const RadioGroup = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
`

const RadioLabel = styled.label`
	display: flex;
	align-items: center;
	gap: 0.5rem;
	cursor: pointer;
	color: var(--text-primary);
	font-size: 0.95rem;

	input {
		cursor: pointer;
	}

	&:hover {
		color: var(--primary-color);
	}
`

const ButtonContainer = styled.div`
	display: flex;
	gap: 1rem;
	justify-content: flex-start;
`

const ActionButton = styled.button`
	background: var(--primary-color);
	color: white;
	border: none;
	border-radius: var(--radius-md);
	padding: 0.75rem 1rem;
	font-size: 0.875rem;
	font-weight: 500;
	cursor: pointer;
	transition: background-color 0.2s ease;
	min-width: 120px;

	&:hover {
		background: var(--primary-dark);
	}

	&:disabled {
		background: var(--disabled-color);
		cursor: not-allowed;
	}
`

const LoadingSpinner = styled.div`
	display: inline-block;
	width: 1rem;
	height: 1rem;
	border: 2px solid #ffffff;
	border-radius: 50%;
	border-top-color: transparent;
	animation: spin 1s linear infinite;
	margin-right: 0.5rem;

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
`

const ErrorMessage = styled.div`
	color: var(--error-color);
	background: var(--error-bg);
	padding: 1rem;
	border-radius: var(--radius-md);
	margin-bottom: 1rem;
	font-size: 0.9rem;
`

const TaskListContainer = styled.div`
	margin-top: 2rem;
`

const TaskCard = styled.div`
	background: var(--surface-color);
	border-radius: var(--radius-md);
	padding: 1.5rem;
	margin-bottom: 1rem;
	border: 1px solid var(--border-color);
`

const TaskImage = styled.img`
	width: 100%;
	max-height: 200px;
	object-fit: contain;
	margin-bottom: 1rem;
`

const TaskConditions = styled.div`
	margin-bottom: 1rem;
`

const ConditionsList = styled.ul`
	list-style: none;
	padding: 0;
`

const ConditionItem = styled.li`
	margin-bottom: 0.5rem;
	color: var(--text-primary);
`

const AnswerAccordion = styled.div`
	border: 1px solid var(--border-color);
	border-radius: var(--radius-sm);
`

const AccordionHeader = styled.button`
	width: 100%;
	padding: 0.75rem;
	background: none;
	border: none;
	text-align: left;
	cursor: pointer;
	display: flex;
	justify-content: space-between;
	align-items: center;
	color: var(--text-primary);

	&:hover {
		background: var(--background-color);
	}
`

const AccordionContent = styled.div<{ isOpen: boolean }>`
	padding: ${props => (props.isOpen ? '1rem' : '0')};
	height: ${props => (props.isOpen ? 'auto' : '0')};
	overflow: hidden;
	transition: all 0.3s ease;
`

interface Task {
	id: string
	imageUrl: string
	conditions: { [key: string]: string }
	answer: string
}

const TaskGenerator: React.FC = () => {
	const [order, setOrder] = useState<'first' | 'second'>('second')
	const [rootType, setRootType] = useState<RootType>(RootType.DIFFERENT)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [tasks, setTasks] = useState<Task[]>([])
	const [openAnswers, setOpenAnswers] = useState<{ [key: string]: boolean }>({})

	const toggleAnswer = (taskId: string) => {
		setOpenAnswers(prev => ({
			...prev,
			[taskId]: !prev[taskId],
		}))
	}

	const handleGenerate = async () => {
		try {
			setIsLoading(true)
			setError(null)

			const orderValue = order === 'first' ? 1 : 2
			const response = await circuitApi.generateCircuit({
				order: orderValue,
				rootType: order === 'second' ? rootType : undefined,
			})

			if (!response.circuit) {
				throw new Error('Не удалось сгенерировать цепь')
			}

			// Здесь нужно будет добавить логику преобразования response.circuit в Task
			const newTask: Task = {
				id: Date.now().toString(),
				imageUrl: 'URL_TO_CIRCUIT_IMAGE', // Нужно будет заменить на реальный URL
				conditions: {
					'Резистор R1': '100 Ом',
					'Конденсатор C1': '0.1 мкФ',
					// Добавьте другие элементы схемы
				},
				answer: 'Ответ для схемы...', // Заменить на реальный ответ
			}

			setTasks(prev => [newTask, ...prev])
		} catch (err) {
			console.error('Ошибка при генерации цепи:', err)
			setError(
				err instanceof Error
					? err.message
					: 'Произошла ошибка при генерации цепи'
			)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Container>
			<Card>
				<Title>Генерация задач</Title>

				{error && <ErrorMessage>{error}</ErrorMessage>}

				<OptionsGrid>
					<OptionCard>
						<OptionTitle>Порядок цепи</OptionTitle>
						<RadioGroup>
							<RadioLabel>
								<input
									type='radio'
									name='order'
									value='first'
									checked={order === 'first'}
									onChange={() => setOrder('first')}
									disabled={isLoading}
								/>
								Первого порядка
							</RadioLabel>
							<RadioLabel>
								<input
									type='radio'
									name='order'
									value='second'
									checked={order === 'second'}
									onChange={() => setOrder('second')}
									disabled={isLoading}
								/>
								Второго порядка
							</RadioLabel>
						</RadioGroup>
					</OptionCard>

					{order === 'second' && (
						<OptionCard>
							<OptionTitle>Тип корней</OptionTitle>
							<RadioGroup>
								<RadioLabel>
									<input
										type='radio'
										name='rootType'
										value={RootType.DIFFERENT}
										checked={rootType === RootType.DIFFERENT}
										onChange={() => setRootType(RootType.DIFFERENT)}
										disabled={isLoading}
									/>
									Различные действительные
								</RadioLabel>
								<RadioLabel>
									<input
										type='radio'
										name='rootType'
										value={RootType.COMPLEX}
										checked={rootType === RootType.COMPLEX}
										onChange={() => setRootType(RootType.COMPLEX)}
										disabled={isLoading}
									/>
									Комплексно-сопряженные
								</RadioLabel>
							</RadioGroup>
						</OptionCard>
					)}
				</OptionsGrid>

				<ButtonContainer>
					<ActionButton onClick={handleGenerate} disabled={isLoading}>
						{isLoading && <LoadingSpinner />}
						{isLoading ? 'Генерация...' : 'Сгенерировать'}
					</ActionButton>
					<ActionButton onClick={() => {}}>Сохранить в PDF</ActionButton>
				</ButtonContainer>

				<TaskListContainer>
					{tasks.map(task => (
						<TaskCard key={task.id}>
							<TaskImage src={task.imageUrl} alt='Схема цепи' />
							<TaskConditions>
								<h4>Условия:</h4>
								<ConditionsList>
									{Object.entries(task.conditions).map(([element, value]) => (
										<ConditionItem key={element}>
											{element}: {value}
										</ConditionItem>
									))}
								</ConditionsList>
							</TaskConditions>
							<AnswerAccordion>
								<AccordionHeader onClick={() => toggleAnswer(task.id)}>
									Ответ
									<span>{openAnswers[task.id] ? '▼' : '▶'}</span>
								</AccordionHeader>
								<AccordionContent isOpen={openAnswers[task.id] || false}>
									{task.answer}
								</AccordionContent>
							</AnswerAccordion>
						</TaskCard>
					))}
				</TaskListContainer>
			</Card>
		</Container>
	)
}

export default TaskGenerator
