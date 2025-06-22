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
	width: 100%;
	height: 100%;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	overflow-y: auto;
	position: relative;
`

const BackgroundPattern = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-image: radial-gradient(
			circle at 25% 25%,
			rgba(255, 255, 255, 0.1) 2px,
			transparent 2px
		),
		radial-gradient(
			circle at 75% 75%,
			rgba(255, 255, 255, 0.1) 2px,
			transparent 2px
		);
	background-size: 60px 60px;
	pointer-events: none;
`

const Content = styled.div`
	position: relative;
	z-index: 1;
	padding: 2rem;
	max-width: 1400px;
	margin: 0 auto;
`

const Header = styled.div`
	text-align: center;
	margin-bottom: 3rem;
	color: white;
`

const MainTitle = styled.h1`
	font-size: 3rem;
	font-weight: 800;
	margin: 0 0 1rem 0;
	background: linear-gradient(45deg, #ffffff, #e0e7ff);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
	text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
`

const Subtitle = styled.p`
	font-size: 1.2rem;
	margin: 0 0 0.5rem 0;
	opacity: 0.9;
	font-weight: 300;
`

const TaskCounter = styled.div`
	display: inline-flex;
	align-items: center;
	gap: 0.5rem;
	background: rgba(255, 255, 255, 0.2);
	backdrop-filter: blur(10px);
	border-radius: 50px;
	padding: 0.5rem 1.5rem;
	font-size: 0.9rem;
	font-weight: 500;
	border: 1px solid rgba(255, 255, 255, 0.3);
`

const TaskCountBadge = styled.span`
	background: #10b981;
	color: white;
	border-radius: 50px;
	padding: 0.25rem 0.75rem;
	font-size: 0.8rem;
	font-weight: 700;
	min-width: 24px;
	text-align: center;
`

const MainCard = styled.div`
	background: rgba(255, 255, 255, 0.95);
	backdrop-filter: blur(20px);
	border-radius: 24px;
	padding: 3rem;
	box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
		0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(255, 255, 255, 0.2);
	border: 1px solid rgba(255, 255, 255, 0.3);
	margin-bottom: 2rem;
`

const SectionTitle = styled.h2`
	color: var(--text-primary);
	margin: 0 0 2rem 0;
	font-size: 1.8rem;
	font-weight: 700;
	display: flex;
	align-items: center;
	gap: 0.75rem;

	&::before {
		content: '';
		width: 4px;
		height: 2rem;
		background: linear-gradient(135deg, #667eea, #764ba2);
		border-radius: 2px;
	}
`

const OptionsContainer = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
	gap: 2rem;
	margin-bottom: 3rem;
`

const OptionCard = styled.div`
	background: linear-gradient(135deg, #f8fafc, #f1f5f9);
	border-radius: 16px;
	padding: 2rem;
	border: 1px solid #e2e8f0;
	transition: all 0.3s ease;
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

	&:hover {
		transform: translateY(-4px);
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
		border-color: #667eea;
	}
`

const OptionTitle = styled.h3`
	color: var(--text-primary);
	margin: 0 0 1.5rem 0;
	font-size: 1.2rem;
	font-weight: 600;
	display: flex;
	align-items: center;
	gap: 0.5rem;
`

const OptionIcon = styled.span`
	font-size: 1.4rem;
`

const RadioGroup = styled.div`
	display: flex;
	flex-direction: column;
	gap: 1rem;
`

const RadioOption = styled.label<{ checked?: boolean }>`
	display: flex;
	align-items: flex-start;
	gap: 0.75rem;
	cursor: pointer;
	padding: 1rem;
	border-radius: 12px;
	border: 2px solid ${props => (props.checked ? '#667eea' : '#e2e8f0')};
	background: ${props =>
		props.checked ? 'rgba(102, 126, 234, 0.1)' : 'white'};
	transition: all 0.2s ease;
	position: relative;

	&:hover {
		border-color: #667eea;
		background: rgba(102, 126, 234, 0.05);
	}

	input {
		display: none;
	}
`

const RadioButton = styled.div<{ checked?: boolean }>`
	width: 20px;
	height: 20px;
	border: 2px solid ${props => (props.checked ? '#667eea' : '#cbd5e1')};
	border-radius: 50%;
	background: ${props => (props.checked ? '#667eea' : 'white')};
	position: relative;
	flex-shrink: 0;
	margin-top: 2px;
	transition: all 0.2s ease;

	&::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: white;
		opacity: ${props => (props.checked ? 1 : 0)};
		transition: opacity 0.2s ease;
	}
`

const RadioLabel = styled.div`
	color: var(--text-primary);
	font-size: 0.95rem;
	font-weight: 500;
	line-height: 1.4;
`

const RadioDescription = styled.div`
	color: var(--text-secondary);
	font-size: 0.85rem;
	margin-top: 0.25rem;
	line-height: 1.3;
`

const InputGroup = styled.div`
	margin-top: 1.5rem;
`

const InputLabel = styled.label`
	display: block;
	color: var(--text-primary);
	font-size: 0.95rem;
	font-weight: 600;
	margin-bottom: 0.5rem;
`

const NumberInput = styled.input`
	width: 100%;
	padding: 0.75rem 1rem;
	border: 2px solid #e2e8f0;
	border-radius: 8px;
	background: white;
	color: var(--text-primary);
	font-size: 0.95rem;
	transition: all 0.2s ease;

	&:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	}

	&:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		background: #f8fafc;
	}
`

const TopologySection = styled.div`
	background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
	border-radius: 16px;
	padding: 2rem;
	border: 1px solid #bae6fd;
	margin-bottom: 3rem;
	position: relative;
	overflow: hidden;

	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: linear-gradient(90deg, #0ea5e9, #0284c7);
	}
`

const TopologySectionTitle = styled.h3`
	color: var(--text-primary);
	margin: 0 0 1.5rem 0;
	font-size: 1.3rem;
	font-weight: 600;
	display: flex;
	align-items: center;
	gap: 0.5rem;
`

const TopologyGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
	gap: 1rem;
	max-height: 280px;
	overflow-y: auto;
	padding: 1rem;
	background: white;
	border-radius: 12px;
	border: 1px solid #e2e8f0;

	&::-webkit-scrollbar {
		width: 6px;
	}

	&::-webkit-scrollbar-track {
		background: #f1f5f9;
		border-radius: 3px;
	}

	&::-webkit-scrollbar-thumb {
		background: #cbd5e1;
		border-radius: 3px;
	}

	&::-webkit-scrollbar-thumb:hover {
		background: #94a3b8;
	}
`

const TopologyOption = styled.div<{ selected?: boolean }>`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 1rem;
	border: 2px solid ${props => (props.selected ? '#0ea5e9' : '#e2e8f0')};
	border-radius: 12px;
	cursor: pointer;
	transition: all 0.2s ease;
	background: ${props =>
		props.selected ? 'rgba(14, 165, 233, 0.1)' : 'white'};
	height: 120px;
	position: relative;

	&:hover {
		border-color: #0ea5e9;
		background: rgba(14, 165, 233, 0.05);
		transform: translateY(-2px);
		box-shadow: 0 8px 25px -8px rgba(14, 165, 233, 0.3);
	}

	${props =>
		props.selected &&
		`
		&::after {
			content: '✓';
			position: absolute;
			top: 0.5rem;
			right: 0.5rem;
			width: 20px;
			height: 20px;
			background: #0ea5e9;
			color: white;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 0.7rem;
			font-weight: bold;
		}
	`}
`

const TopologyImage = styled.img`
	width: 100%;
	height: 80px;
	object-fit: contain;
	border-radius: 6px;
	background: white;
`

const TopologyLabel = styled.span`
	color: var(--text-secondary);
	text-align: center;
	font-size: 0.8rem;
	font-weight: 500;
	margin-top: 0.5rem;
`

const LoadingTopologies = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 3rem;
	color: var(--text-secondary);
	font-size: 0.95rem;
	gap: 1rem;
`

const LoadingSpinner = styled.div`
	width: 32px;
	height: 32px;
	border: 3px solid #e2e8f0;
	border-radius: 50%;
	border-top-color: #0ea5e9;
	animation: spin 1s linear infinite;

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
`

const ActionsContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 1rem;
	justify-content: center;
	margin-bottom: 3rem;
`

const ActionButton = styled.button<{
	variant?: 'primary' | 'secondary' | 'success'
}>`
	background: ${props => {
		switch (props.variant) {
			case 'secondary':
				return 'linear-gradient(135deg, #6b7280, #4b5563)'
			case 'success':
				return 'linear-gradient(135deg, #10b981, #059669)'
			default:
				return 'linear-gradient(135deg, #667eea, #764ba2)'
		}
	}};
	color: white;
	border: none;
	border-radius: 12px;
	padding: 1rem 2rem;
	font-size: 0.95rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.3s ease;
	min-width: 160px;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	box-shadow: 0 4px 15px -3px rgba(0, 0, 0, 0.2);
	position: relative;
	overflow: hidden;

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
		box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.3);

		&::before {
			left: 100%;
		}
	}

	&:active {
		transform: translateY(0);
	}

	&:disabled {
		opacity: 0.7;
		cursor: not-allowed;
		transform: none;

		&:hover {
			transform: none;
			box-shadow: 0 4px 15px -3px rgba(0, 0, 0, 0.2);
		}
	}
`

const ButtonIcon = styled.span`
	font-size: 1.1rem;
`

const ButtonSpinner = styled.div`
	width: 16px;
	height: 16px;
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
	color: #dc2626;
	background: linear-gradient(135deg, #fee2e2, #fecaca);
	padding: 1.5rem;
	border-radius: 12px;
	margin-bottom: 2rem;
	font-size: 0.95rem;
	border: 1px solid #fca5a5;
	display: flex;
	align-items: center;
	gap: 0.75rem;
	box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.1);

	&::before {
		content: '⚠️';
		font-size: 1.2rem;
	}
`

const TasksSection = styled.div`
	background: rgba(255, 255, 255, 0.95);
	backdrop-filter: blur(20px);
	border-radius: 24px;
	padding: 3rem;
	box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
		0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(255, 255, 255, 0.2);
	border: 1px solid rgba(255, 255, 255, 0.3);
`

const TaskListContainer = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
	gap: 2rem;
	margin-top: 2rem;
`

const EmptyState = styled.div`
	text-align: center;
	padding: 4rem 2rem;
	color: var(--text-secondary);
`

const EmptyStateIcon = styled.div`
	font-size: 4rem;
	margin-bottom: 1.5rem;
	opacity: 0.5;
`

const EmptyStateTitle = styled.h3`
	margin: 0 0 0.5rem 0;
	color: var(--text-primary);
	font-size: 1.3rem;
	font-weight: 600;
`

const EmptyStateText = styled.p`
	margin: 0;
	font-size: 1rem;
	line-height: 1.5;
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
				<BackgroundPattern />
				<Content>
					<Header>
						<MainTitle>Генератор задач</MainTitle>
						<Subtitle>
							Создавайте уникальные задачи по электрическим цепям
						</Subtitle>
						<TaskCounter>
							<span>Сгенерировано задач:</span>
							<TaskCountBadge>{tasks.length}</TaskCountBadge>
						</TaskCounter>
					</Header>

					<MainCard>
						<SectionTitle>⚙️ Настройки генерации</SectionTitle>

						{error && <ErrorMessage>{error}</ErrorMessage>}

						<OptionsContainer>
							<OptionCard>
								<OptionTitle>
									<OptionIcon>📊</OptionIcon>
									Порядок цепи
								</OptionTitle>
								<RadioGroup>
									<RadioOption checked={order === 'first'}>
										<input
											type='radio'
											name='order'
											value='first'
											checked={order === 'first'}
											onChange={() => setOrder('first')}
											disabled={isLoading}
										/>
										<RadioButton checked={order === 'first'} />
										<div>
											<RadioLabel>Первого порядка</RadioLabel>
											<RadioDescription>
												Цепи с одним реактивным элементом (L или C)
											</RadioDescription>
										</div>
									</RadioOption>
									<RadioOption checked={order === 'second'}>
										<input
											type='radio'
											name='order'
											value='second'
											checked={order === 'second'}
											onChange={() => setOrder('second')}
											disabled={isLoading}
										/>
										<RadioButton checked={order === 'second'} />
										<div>
											<RadioLabel>Второго порядка</RadioLabel>
											<RadioDescription>
												Цепи с двумя реактивными элементами (LL, LC, CC)
											</RadioDescription>
										</div>
									</RadioOption>
								</RadioGroup>
							</OptionCard>

							{order === 'second' && (
								<OptionCard>
									<OptionTitle>
										<OptionIcon>🔢</OptionIcon>
										Тип корней
									</OptionTitle>
									<RadioGroup>
										<RadioOption checked={rootType === RootType.DIFFERENT}>
											<input
												type='radio'
												name='rootType'
												value={RootType.DIFFERENT}
												checked={rootType === RootType.DIFFERENT}
												onChange={() => setRootType(RootType.DIFFERENT)}
												disabled={isLoading}
											/>
											<RadioButton checked={rootType === RootType.DIFFERENT} />
											<div>
												<RadioLabel>Различные действительные</RadioLabel>
												<RadioDescription>
													Корни характеристического уравнения различны и
													действительны
												</RadioDescription>
											</div>
										</RadioOption>
										<RadioOption checked={rootType === RootType.COMPLEX}>
											<input
												type='radio'
												name='rootType'
												value={RootType.COMPLEX}
												checked={rootType === RootType.COMPLEX}
												onChange={() => setRootType(RootType.COMPLEX)}
												disabled={isLoading}
											/>
											<RadioButton checked={rootType === RootType.COMPLEX} />
											<div>
												<RadioLabel>Комплексно-сопряженные</RadioLabel>
												<RadioDescription>
													Корни характеристического уравнения комплексные
												</RadioDescription>
											</div>
										</RadioOption>
									</RadioGroup>
								</OptionCard>
							)}

							<OptionCard>
								<OptionTitle>
									<OptionIcon>🎯</OptionIcon>
									Уровень сложности
								</OptionTitle>
								<RadioGroup>
									<RadioOption checked={difficulty === DifficultyLevel.BASIC}>
										<input
											type='radio'
											name='difficulty'
											value={DifficultyLevel.BASIC}
											checked={difficulty === DifficultyLevel.BASIC}
											onChange={() => setDifficulty(DifficultyLevel.BASIC)}
											disabled={isLoading}
										/>
										<RadioButton
											checked={difficulty === DifficultyLevel.BASIC}
										/>
										<div>
											<RadioLabel>Базовый уровень</RadioLabel>
											<RadioDescription>
												Поиск токов на индуктивностях и напряжений на
												конденсаторах
											</RadioDescription>
										</div>
									</RadioOption>
									<RadioOption
										checked={difficulty === DifficultyLevel.ADVANCED}
									>
										<input
											type='radio'
											name='difficulty'
											value={DifficultyLevel.ADVANCED}
											checked={difficulty === DifficultyLevel.ADVANCED}
											onChange={() => setDifficulty(DifficultyLevel.ADVANCED)}
											disabled={isLoading}
										/>
										<RadioButton
											checked={difficulty === DifficultyLevel.ADVANCED}
										/>
										<div>
											<RadioLabel>Продвинутый уровень</RadioLabel>
											<RadioDescription>
												Поиск токов и напряжений на резисторах в конкретный
												момент времени
											</RadioDescription>
										</div>
									</RadioOption>
								</RadioGroup>

								{difficulty === DifficultyLevel.ADVANCED && (
									<InputGroup>
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
						</OptionsContainer>

						<TopologySection>
							<TopologySectionTitle>🔗 Выбор топологии</TopologySectionTitle>
							{isLoadingTopologies ? (
								<LoadingTopologies>
									<LoadingSpinner />
									<span>Загрузка доступных топологий...</span>
								</LoadingTopologies>
							) : (
								<TopologyGrid>
									{/* Опция "Любая топология" */}
									<TopologyOption
										selected={selectedTopologyId === null}
										onClick={() => setSelectedTopologyId(null)}
									>
										<div
											style={{
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												height: '80px',
												fontSize: '2rem',
											}}
										>
											🎲
										</div>
										<TopologyLabel>Любая топология</TopologyLabel>
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
											<TopologyLabel>Топология {topology.id}</TopologyLabel>
										</TopologyOption>
									))}
								</TopologyGrid>
							)}
						</TopologySection>

						<ActionsContainer>
							<ActionButton onClick={handleGenerate} disabled={isLoading}>
								{isLoading ? (
									<>
										<ButtonSpinner />
										<span>Генерация...</span>
									</>
								) : (
									<>
										<ButtonIcon>✨</ButtonIcon>
										<span>Сгенерировать задачу</span>
									</>
								)}
							</ActionButton>
							<ActionButton
								variant='secondary'
								onClick={() => setIsMultipleModalOpen(true)}
								disabled={isLoading}
							>
								<ButtonIcon>📚</ButtonIcon>
								<span>Множественная генерация</span>
							</ActionButton>
							{tasks.length > 0 && (
								<ActionButton variant='success' onClick={handleDownloadHtml}>
									<ButtonIcon>💾</ButtonIcon>
									<span>Скачать HTML</span>
								</ActionButton>
							)}
						</ActionsContainer>
					</MainCard>

					{tasks.length > 0 ? (
						<TasksSection>
							<SectionTitle>📋 Сгенерированные задачи</SectionTitle>
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
						</TasksSection>
					) : (
						<TasksSection>
							<EmptyState>
								<EmptyStateIcon>🎯</EmptyStateIcon>
								<EmptyStateTitle>
									Пока нет сгенерированных задач
								</EmptyStateTitle>
								<EmptyStateText>
									Настройте параметры выше и нажмите кнопку "Сгенерировать
									задачу", чтобы создать первую задачу
								</EmptyStateText>
							</EmptyState>
						</TasksSection>
					)}
				</Content>

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
