import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import {
	circuitApi,
	RootType,
	DifficultyLevel,
	Topology,
} from '../services/api'
import { AxiosError } from 'axios'
import { MathJaxContext } from 'better-react-mathjax'
import { TaskCard } from './TaskCard'
import { TaskModal } from './TaskModal'
import { useTasksStore, Task } from '../store/tasksStore'
import { htmlService } from '../services/htmlService'
import GenerateMultipleTasksModal from './GenerateMultipleTasksModal'

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
	display: flex;
	flex-wrap: wrap;
	gap: 2rem;
	margin-bottom: 2rem;
`

const OptionCard = styled.div`
	background: var(--background-color);
	border-radius: var(--radius-md);
	padding: 1.5rem;
	border: 1px solid var(--border-color);
	flex: 1;
	min-width: 300px;
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

const InputGroup = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
`

const InputLabel = styled.label`
	color: var(--text-primary);
	font-size: 0.95rem;
	font-weight: 500;
`

const NumberInput = styled.input`
	padding: 0.5rem;
	border: 1px solid var(--border-color);
	border-radius: var(--radius-sm);
	background: var(--surface-color);
	color: var(--text-primary);
	font-size: 0.95rem;
	width: 100px;

	&:focus {
		outline: none;
		border-color: var(--primary-color);
		box-shadow: 0 0 0 2px var(--primary-color) 20;
	}

	&:disabled {
		opacity: 0.6;
		cursor: not-allowed;
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

const TopologyContainer = styled.div`
	background: var(--background-color);
	border-radius: var(--radius-md);
	padding: 1.5rem;
	border: 1px solid var(--border-color);
	margin-bottom: 2rem;
`

const TopologySelector = styled.div`
	display: flex;
	flex-direction: column;
	gap: 1rem;
`

const TopologyGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(120px, 150px));
	gap: 0.75rem;
	max-height: 200px;
	overflow-y: auto;
	padding: 0.5rem;
	border: 1px solid var(--border-color);
	border-radius: var(--radius-sm);
	background: var(--surface-color);
	justify-content: start;
`

const TopologyOption = styled.div<{ selected?: boolean }>`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 0.5rem;
	border: 2px solid
		${props =>
			props.selected ? 'var(--primary-color)' : 'var(--border-color)'};
	border-radius: var(--radius-sm);
	cursor: pointer;
	transition: all 0.2s ease;
	background: ${props =>
		props.selected ? 'var(--primary-color)10' : 'var(--background-color)'};
	width: 120px;
	height: 90px;

	&:hover {
		border-color: var(--primary-color);
		background: var(--primary-color) 10;
	}

	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
`

const TopologyImage = styled.img`
	width: 100%;
	height: 100%;
	object-fit: contain;
	margin-bottom: 0.25rem;
	border-radius: var(--radius-sm);
	background: white;
`

const LoadingTopologies = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 2rem;
	color: var(--text-secondary);
	font-size: 0.9rem;
`

const TaskGenerator: React.FC = () => {
	const [order, setOrder] = useState<'first' | 'second'>('second')
	const [rootType, setRootType] = useState<RootType>(RootType.DIFFERENT)
	const [difficulty, setDifficulty] = useState<DifficultyLevel>(
		DifficultyLevel.BASIC
	)
	const [resistorsCount, setResistorsCount] = useState<number>(3)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
	const [isMultipleModalOpen, setIsMultipleModalOpen] = useState(false)

	// Новые состояния для топологий
	const [availableTopologies, setAvailableTopologies] = useState<Topology[]>([])
	const [selectedTopologyId, setSelectedTopologyId] = useState<number | null>(
		null
	)
	const [isLoadingTopologies, setIsLoadingTopologies] = useState(false)

	const { tasks, addTask } = useTasksStore()

	const selectedTask = selectedTaskId
		? tasks.find(task => task.id === selectedTaskId)
		: null

	// Загружаем топологии при изменении порядка
	useEffect(() => {
		const loadTopologies = async () => {
			try {
				setIsLoadingTopologies(true)
				const orderValue = order === 'first' ? 1 : 2
				const topologies = await circuitApi.getTopologiesWithOrder(orderValue)
				setAvailableTopologies(topologies)
				setSelectedTopologyId(null) // Сбрасываем выбранную топологию
			} catch (error) {
				console.error('Ошибка при загрузке топологий:', error)
				setAvailableTopologies([])
			} finally {
				setIsLoadingTopologies(false)
			}
		}

		loadTopologies()
	}, [order])

	const handleGenerate = async () => {
		try {
			setIsLoading(true)
			setError(null)

			const orderValue = order === 'first' ? 1 : 2
			const response = await circuitApi.generateTask({
				order: orderValue,
				rootType: order === 'second' ? rootType : undefined,
				difficulty: difficulty,
				resistors_count:
					difficulty === DifficultyLevel.ADVANCED ? resistorsCount : undefined,
				topology_id: selectedTopologyId || undefined, // Передаем ID топологии
			})

			const newTask: Task = {
				id: Date.now().toString(),
				imageUrl: `data:image/png;base64,${response.image}`,
				componentValues: response.componentValues,
				detailedSolution: response.detailedSolution!,
				requiredParameters: response.requiredParameters!,
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

	const handleDownloadHtml = async () => {
		try {
			const htmlString = htmlService.generateHtmlFromTasks(tasks)
			const htmlBlob = new Blob([htmlString], { type: 'text/html' })
			htmlService.downloadHtml(htmlBlob)
		} catch {
			setError('Ошибка при генерации HTML')
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

						<OptionCard>
							<OptionTitle>Уровень сложности</OptionTitle>
							<RadioGroup>
								<RadioLabel>
									<input
										type='radio'
										name='difficulty'
										value={DifficultyLevel.BASIC}
										checked={difficulty === DifficultyLevel.BASIC}
										onChange={() => setDifficulty(DifficultyLevel.BASIC)}
										disabled={isLoading}
									/>
									Базовый (токи на индуктивностях, напряжения на катушках)
								</RadioLabel>
								<RadioLabel>
									<input
										type='radio'
										name='difficulty'
										value={DifficultyLevel.ADVANCED}
										checked={difficulty === DifficultyLevel.ADVANCED}
										onChange={() => setDifficulty(DifficultyLevel.ADVANCED)}
										disabled={isLoading}
									/>
									Продвинутый (токи и напряжения на резисторах в момент времени)
								</RadioLabel>
							</RadioGroup>

							{difficulty === DifficultyLevel.ADVANCED && (
								<InputGroup style={{ marginTop: '1rem' }}>
									<InputLabel htmlFor='resistors-count'>
										Количество резисторов для исследования:
									</InputLabel>
									<NumberInput
										id='resistors-count'
										type='number'
										min='1'
										max='10'
										value={resistorsCount}
										onChange={e =>
											setResistorsCount(parseInt(e.target.value) || 1)
										}
										disabled={isLoading}
									/>
								</InputGroup>
							)}
						</OptionCard>
					</OptionsGrid>

					{/* Выбор топологии */}
					<TopologyContainer>
						<OptionTitle>Топология</OptionTitle>
						<TopologySelector>
							{isLoadingTopologies ? (
								<LoadingTopologies>Загрузка топологий...</LoadingTopologies>
							) : (
								<TopologyGrid>
									{/* Опция "Любая топология" */}
									<TopologyOption
										selected={selectedTopologyId === null}
										onClick={() => setSelectedTopologyId(null)}
									>
										<span
											style={{
												color: 'var(--text-secondary)',
												textAlign: 'center',
												fontSize: '0.8rem',
											}}
										>
											Любая топология
										</span>
									</TopologyOption>

									{/* Конкретные топологии */}
									{availableTopologies.map(topology => (
										<TopologyOption
											key={topology.id}
											selected={selectedTopologyId === topology.id}
											onClick={() => setSelectedTopologyId(topology.id)}
										>
											<TopologyImage
												src={topology.image_base64}
												alt={`Топология ${topology.id}`}
												onError={e => {
													const target = e.target as HTMLImageElement
													target.style.display = 'none'
												}}
											/>
										</TopologyOption>
									))}
								</TopologyGrid>
							)}
						</TopologySelector>
					</TopologyContainer>

					<ButtonContainer>
						<ActionButton onClick={handleGenerate} disabled={isLoading}>
							{isLoading && <LoadingSpinner />}
							{isLoading ? 'Генерация...' : 'Сгенерировать'}
						</ActionButton>
						<ActionButton
							onClick={() => setIsMultipleModalOpen(true)}
							disabled={isLoading}
						>
							Сгенерировать несколько
						</ActionButton>
						{tasks.length > 0 && (
							<ActionButton onClick={handleDownloadHtml}>
								Скачать HTML-документ
							</ActionButton>
						)}
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

				<GenerateMultipleTasksModal
					isOpen={isMultipleModalOpen}
					onClose={() => setIsMultipleModalOpen(false)}
				/>
			</Container>
		</MathJaxContext>
	)
}

export default TaskGenerator
