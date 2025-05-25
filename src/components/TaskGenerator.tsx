import React, { useState } from 'react'
import styled from 'styled-components'
import { circuitApi, RootType } from '../services/api'
import { AxiosError } from 'axios'
import { MathJaxContext } from 'better-react-mathjax'
import { TaskCard } from './TaskCard'
import { TaskModal } from './TaskModal'
import { useTasksStore, Task } from '../store/tasksStore'

const mathJaxConfig = {
	tex: {
		inlineMath: [['$', '$']],
		displayMath: [['$$', '$$']],
	},
}

const Container = styled.div`
	padding: 2rem;
	width: 100%;
	margin: 0 auto;
	background-color: var(--background-color);
	border-radius: var(--radius-lg);
	max-height: 100%;
	overflow-y: auto;
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
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1rem;
`

const TaskCounter = styled.span`
	color: var(--text-secondary);
	font-size: 1rem;
	font-weight: normal;
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
	display: flex;
	align-items: center;
	justify-content: center;

	&:hover {
		background: var(--primary-dark);
	}

	&:disabled {
		background: var(--primary-color);
		opacity: 0.7;
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
	color: #ef4444;
	background: #fee2e2;
	padding: 1rem;
	border-radius: var(--radius-md);
	margin-bottom: 1rem;
	font-size: 0.9rem;
	border: 1px solid #fca5a5;
	display: flex;
	align-items: center;
	gap: 0.5rem;

	&::before {
		content: '⚠️';
	}
`

const TaskListContainer = styled.div`
	margin-top: 2rem;
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 1.5rem;
	padding-top: 2rem;
	border-top: 1px solid var(--border-color);
`

const TaskGenerator: React.FC = () => {
	const [order, setOrder] = useState<'first' | 'second'>('second')
	const [rootType, setRootType] = useState<RootType>(RootType.DIFFERENT)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

	const { tasks, addTask } = useTasksStore()

	const selectedTask = selectedTaskId
		? tasks.find(task => task.id === selectedTaskId)
		: null

	const handleGenerate = async () => {
		try {
			setIsLoading(true)
			setError(null)

			const orderValue = order === 'first' ? 1 : 2
			const response = await circuitApi.generateTask({
				order: orderValue,
				rootType: order === 'second' ? rootType : undefined,
			})

			const newTask: Task = {
				id: Date.now().toString(),
				imageUrl: `data:image/png;base64,${response.image}`,
				conditions: response.conditions,
				answer: response.solution,
				searchParams: Object.fromEntries(
					Object.keys(response.conditions).map(element => [
						element,
						{ current: false, voltage: false },
					])
				),
			}

			console.log('Generated task:', newTask)
			addTask(newTask)
		} catch (err) {
			if (err instanceof AxiosError) {
				setError(
					err.response?.data?.message || 'Произошла ошибка при генерации задачи'
				)
			} else {
				setError('Произошла неизвестная ошибка')
			}
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<MathJaxContext config={mathJaxConfig}>
			<Container>
				<Card>
					<Title>
						Генерация задач
						<TaskCounter>Всего задач сгенерировано: {tasks.length}</TaskCounter>
					</Title>

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
					</ButtonContainer>

					<TaskListContainer>
						{tasks.map(task => (
							<TaskCard
								key={task.id}
								task={task}
								onClick={() => {
									setSelectedTaskId(task.id)
								}}
							/>
						))}
					</TaskListContainer>
				</Card>

				{selectedTask && (
					<TaskModal
						isOpen={!!selectedTask}
						onClose={() => {
							setSelectedTaskId(null)
						}}
						task={selectedTask}
					/>
				)}
			</Container>
		</MathJaxContext>
	)
}

export default TaskGenerator
