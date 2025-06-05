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

const InitialSolutionGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 1rem;
	margin-bottom: 1.25rem;
`

const SolutionBlock = styled.div`
	background: var(--background-color);
	border-radius: var(--radius-md);
	padding: 1rem;
	border: 1px solid var(--border-color);
	font-size: 0.95rem;

	h3 {
		color: var(--primary-color);
		margin-bottom: 0.75rem;
		font-size: 1rem;
		font-weight: 500;
	}
`

const PolynomialBlock = styled(SolutionBlock)`
	.equation-wrapper {
		padding: 0.5rem 0;
	}
`

const RootsBlock = styled(SolutionBlock)`
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
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
							<InitialSolutionGrid>
								<PolynomialBlock>
									<h3>Характеристический многочлен</h3>
									<div className='equation-wrapper'>
										<EquationDisplay equation={task.detailedSolution.poly} />
									</div>
								</PolynomialBlock>
								<RootsBlock>
									<h3>Корни уравнения</h3>
									{task.detailedSolution.roots.map((root, index) => (
										<ElementEquation key={index}>
											<span>p{index + 1} = </span>
											<EquationDisplay equation={root} />
										</ElementEquation>
									))}
								</RootsBlock>
								<SolutionBlock>
									<h3>Начальные значения</h3>
									<CoefficientsTable>
										<tbody>
											{Object.entries(task.detailedSolution.initial_values).map(
												([element, value]) => (
													<tr key={element}>
														<td>{element}</td>
														<td>
															{value} {element.startsWith('L') ? 'А' : 'В'}
														</td>
													</tr>
												)
											)}
										</tbody>
									</CoefficientsTable>
								</SolutionBlock>
							</InitialSolutionGrid>
							{Object.entries(task.detailedSolution.elements).map(
								([element, solution]) => (
									<Answer key={element}>
										<strong>{element}:</strong>
										<ElementSolution>
											<SteadyStateValue>
												<span>Установившееся значение:</span>
												{solution.steady_state}{' '}
												{solution.type === 'i' ? 'А' : 'В'}
											</SteadyStateValue>
											{solution.coefficients.length > 0 && (
												<CoefficientsSection>
													<CoefficientsTitle>Коэффициенты:</CoefficientsTitle>
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
																		{coef.type === 'A' ? 'Амплитуда' : 'Фаза'}
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
													{solution.type === 'i' ? 'i(t)' : 'U(t)'} ={' '}
												</span>
												<EquationDisplay equation={solution.expr} />
											</ElementEquation>
										</ElementSolution>
									</Answer>
								)
							)}
						</SolutionContent>
					</Section>
				)}
			</ModalContent>
		</Modal>
	)
}

export type { TaskModalProps }
