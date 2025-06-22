import React from 'react'
import styled from 'styled-components'
import { EquationDisplay } from '../utils/components'
import { Task } from '../store/tasksStore'
import { getElementUnit } from '../utils/getElementUnit'

const Section = styled.div`
	h4 {
		color: var(--text-primary);
		margin-bottom: 1rem;
		font-size: 1.2rem;
	}
`

const Modal = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 1000;
`

const ModalContent = styled.div`
	background: var(--surface-color);
	border-radius: var(--radius-lg);
	padding: 2rem;
	max-width: 1000px;
	width: 90%;
	max-height: 90vh;
	overflow-y: auto;
	position: relative;
	display: flex;
	flex-direction: column;
	gap: 2rem;
	color: var(--text-primary);
`

const CloseButton = styled.button`
	position: absolute;
	top: 1rem;
	right: 1rem;
	background: none;
	border: none;
	color: var(--text-secondary);
	cursor: pointer;
	padding: 0.5rem;
	font-size: 1.2rem;

	&:hover {
		color: var(--text-primary);
	}
`

const TaskImage = styled.img`
	width: 100%;
	max-height: 300px;
	object-fit: contain;
	margin-bottom: 1rem;
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

const SolutionContent = styled.div`
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
`

const PolynomialBlock = styled.div`
	background: var(--background-color);
	border-radius: var(--radius-md);
	padding: 1rem;
	border: 1px solid var(--border-color);
	font-size: 0.95rem;
	margin-bottom: 1.5rem;

	h3 {
		color: var(--primary-color);
		margin-bottom: 0.75rem;
		font-size: 1rem;
		font-weight: 500;
	}

	.equation-wrapper {
		padding: 0.5rem 0;
	}
`

const Answer = styled.div`
	background: var(--background-color);
	border-radius: var(--radius-md);
	padding: 1.25rem;
	border: 1px solid var(--border-color);

	strong {
		display: block;
		color: var(--primary-color);
		font-size: 1.1rem;
		margin-bottom: 1rem;
	}
`

const ElementSolution = styled.div`
	display: flex;
	flex-direction: column;
	gap: 1rem;
`

const ElementEquation = styled.div`
	display: flex;
	align-items: center;
	gap: 0.5rem;

	span {
		font-weight: 500;
		font-size: 0.95rem;
		color: var(--text-primary);
	}
`

const SteadyStateValue = styled.div`
	display: flex;
	align-items: center;
	gap: 0.5rem;
	font-size: 0.95rem;

	span {
		color: var(--text-primary);
	}
`

const CoefficientsSection = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
`

const CoefficientsTitle = styled.span`
	font-weight: 500;
	font-size: 0.95rem;
	color: var(--text-primary);
`

const CoefficientsTable = styled.table`
	width: 100%;
	border-collapse: collapse;
	font-size: 0.95rem;

	th,
	td {
		padding: 0.5rem;
		border: 1px solid var(--border-color);
		text-align: left;
	}

	th {
		background: var(--background-color);
		font-weight: 500;
		font-size: 0.95rem;
	}

	td:first-child {
		width: 45%;
	}
`

interface TaskModalProps {
	isOpen: boolean
	onClose: () => void
	task: Task
}

export const TaskModal: React.FC<TaskModalProps> = ({
	isOpen,
	onClose,
	task,
}) => {
	if (!isOpen) return null

	return (
		<Modal onClick={onClose}>
			<ModalContent onClick={e => e.stopPropagation()}>
				<CloseButton onClick={onClose}>✕</CloseButton>
				<TaskImage src={task.imageUrl} alt='Схема цепи' />
				<Section>
					<h4>Условия:</h4>
					<ConditionsList>
						{task.componentValues &&
							Object.entries(task.componentValues).map(([element, value]) => (
								<ConditionItem key={element}>
									{element}: {value} {getElementUnit(element)}
								</ConditionItem>
							))}
					</ConditionsList>
				</Section>
				{task.detailedSolution && (
					<Section>
						<h4>Решение:</h4>
						<SolutionContent>
							<PolynomialBlock>
								<h3>Характеристический многочлен</h3>
								<div className='equation-wrapper'>
									<EquationDisplay equation={task.detailedSolution.poly} />
								</div>
							</PolynomialBlock>
							{task.detailedSolution.roots &&
								task.detailedSolution.roots.length > 0 && (
									<PolynomialBlock>
										<h3>Корни характеристического уравнения</h3>
										<div className='equation-wrapper'>
											{task.detailedSolution.roots.map((root, index) => (
												<div
													key={index}
													style={{
														marginBottom: '0.75rem',
														display: 'flex',
														alignItems: 'center',
														gap: '0.5rem',
														fontSize: '1rem',
													}}
												>
													<span style={{ fontWeight: '500' }}>
														s<sub>{index + 1}</sub> =
													</span>
													<EquationDisplay equation={root} />
												</div>
											))}
										</div>
									</PolynomialBlock>
								)}
							{Object.entries(task.detailedSolution.elements)
								.filter(([element]) => {
									// Фильтруем элементы по флагу show_in_conditions
									const params = task.requiredParameters?.[element]
									const isReactive =
										element.startsWith('L') || element.startsWith('C')
									return params?.show_in_conditions === true || isReactive
								})
								.sort((a, b) => {
									const isReactiveA =
										a[0].startsWith('L') || a[0].startsWith('C')
									const isReactiveB =
										b[0].startsWith('L') || b[0].startsWith('C')
									return isReactiveA ? 1 : isReactiveB ? -1 : 0
								})
								.map(([element, solution]) => {
									const isReactive =
										element.startsWith('L') || element.startsWith('C')
									const isResistor = element.startsWith('R')

									return (
										<Answer key={element}>
											<strong>{element}:</strong>
											<ElementSolution>
												{isReactive && (
													<>
														{/* Для L и C: установившееся → начальное → коэффициенты → уравнение */}
														<SteadyStateValue>
															<span>1. Установившееся значение:</span>
															{solution.steady_state}{' '}
															{solution.type === 'i' ? 'А' : 'В'}
														</SteadyStateValue>

														<SteadyStateValue>
															<span>2. Начальное значение:</span>
															{
																task.detailedSolution.initial_values[element]
															}{' '}
															{element.startsWith('L') ? 'А' : 'В'}
														</SteadyStateValue>

														{solution.coefficients.length > 0 && (
															<CoefficientsSection>
																<CoefficientsTitle>
																	3. Коэффициенты:
																</CoefficientsTitle>
																<CoefficientsTable>
																	<thead>
																		<tr>
																			<th>Тип</th>
																			<th>Значение</th>
																		</tr>
																	</thead>
																	<tbody>
																		{solution.coefficients.map((coef, idx) => (
																			<tr key={idx}>
																				<td>
																					{coef.type === 'A'
																						? 'Амплитуда'
																						: 'Фаза'}
																				</td>
																				<td>
																					{coef.value}{' '}
																					{coef.type === 'A'
																						? solution.type === 'i'
																							? 'А'
																							: 'В'
																						: 'рад'}
																				</td>
																			</tr>
																		))}
																	</tbody>
																</CoefficientsTable>
															</CoefficientsSection>
														)}

														<ElementEquation>
															<span>
																4. {solution.type === 'i' ? 'i(t)' : 'V(t)'} ={' '}
															</span>
															<EquationDisplay equation={solution.expr} />
														</ElementEquation>
													</>
												)}

												{isResistor && (
													<>
														{/* Для резисторов: уравнение → значение в момент времени */}
														<ElementEquation>
															<span>
																1. {solution.type === 'i' ? 'i(t)' : 'V(t)'} ={' '}
															</span>
															<EquationDisplay equation={solution.expr} />
														</ElementEquation>

														{solution.at_time !== undefined &&
															solution.value_at_time !== undefined && (
																<SteadyStateValue>
																	<span>
																		2. Значение в момент t = {solution.at_time}{' '}
																		с:
																	</span>
																	{solution.value_at_time}{' '}
																	{solution.type === 'i' ? 'А' : 'В'}
																</SteadyStateValue>
															)}
													</>
												)}
											</ElementSolution>
										</Answer>
									)
								})}
						</SolutionContent>
					</Section>
				)}
			</ModalContent>
		</Modal>
	)
}

export type { TaskModalProps }
