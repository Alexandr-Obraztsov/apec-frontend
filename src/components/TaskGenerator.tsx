import React, { useState } from 'react'
import styled from 'styled-components'
import { circuitApi, RootType, CircuitSolutionResult } from '../services/api'
import { AxiosError } from 'axios'
import { MathJaxContext } from 'better-react-mathjax'
import { EquationDisplay } from '../utils/components'

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

const TaskCard = styled.div`
	background: var(--surface-color);
	border-radius: var(--radius-md);
	padding: 1.5rem;
	border: 1px solid var(--border-color);
	height: 450px;
	position: relative;
	display: flex;
	flex-direction: column;
`

const TaskImage = styled.img`
	width: 100%;
	height: 200px;
	object-fit: contain;
	margin-bottom: 1rem;
`

const TaskConditions = styled.div`
	flex: 1;
`

const ConditionsList = styled.div`
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 0.5rem;
	padding: 0;
`

const ConditionItem = styled.div`
	color: var(--text-primary);
	background: var(--background-color);
	padding: 0.5rem;
	border-radius: var(--radius-sm);
	font-size: 0.9rem;
	text-align: center;
	border: 1px solid var(--border-color);
`

const AnswerAccordion = styled.div`
	border: 1px solid var(--border-color);
	border-radius: var(--radius-sm);
	position: absolute;
	bottom: 1.5rem;
	left: 1.5rem;
	right: 1.5rem;
	background: var(--surface-color);
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

const SolutionContent = styled.div`
	padding: 1rem;
	background: var(--surface-color);
	border-radius: var(--radius-sm);
	font-size: 0.9rem;
	color: var(--text-primary);

	h4 {
		margin: 0 0 0.5rem 0;
		color: var(--text-primary);
	}

	strong {
		color: var(--text-primary);
		margin-right: 0.5rem;
	}
`

interface Task {
	id: string
	imageUrl: string
	conditions: { [key: string]: string }
	answer: CircuitSolutionResult
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
			const response = await circuitApi.generateTask({
				order: orderValue,
				rootType: order === 'second' ? rootType : undefined,
			})

			const newTask: Task = {
				id: Date.now().toString(),
				imageUrl: `data:image/png;base64,${response.image}`,
				conditions: response.conditions,
				answer: response.solution,
			}

			setTasks(prev => [newTask, ...prev])
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
										<SolutionContent>
											{Object.entries(task.answer).map(
												([elementName, elementEquations]) => (
													<div key={elementName}>
														<h4>Элемент {elementName}:</h4>
														{Object.entries(elementEquations).map(
															([eqName, eqValue]) => (
																<div key={eqName}>
																	<strong>
																		{eqName === 'i(t)' ? 'Ток:' : 'Напряжение:'}
																	</strong>
																	<EquationDisplay tex={String(eqValue)} />
																</div>
															)
														)}
													</div>
												)
											)}
										</SolutionContent>
									</AccordionContent>
								</AnswerAccordion>
							</TaskCard>
						))}
					</TaskListContainer>
				</Card>
			</Container>
		</MathJaxContext>
	)
}

export default TaskGenerator
