import React, { useState } from 'react'
import styled from 'styled-components'
import { EquationDisplay } from '../utils/components'
import { Task, useTasksStore } from '../store/tasksStore'
import { generateConditions } from '../utils/generateConditions'
import { getElementUnit } from '../utils/getElementUnit'

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
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
`

const CheckboxGroup = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 0.5rem;
	width: 100%;
`

const ParameterButton = styled.button<{ $active: boolean }>`
	padding: 0.5rem;
	border: 1px solid var(--border-color);
	border-radius: var(--radius-sm);
	background: ${props =>
		props.$active ? 'var(--primary-color)' : 'var(--background-color)'};
	color: ${props => (props.$active ? 'white' : 'var(--text-primary)')};
	cursor: pointer;
	font-size: 0.8rem;
	width: 100%;
	transition: all 0.2s;

	&:hover {
		background: ${props =>
			props.$active ? 'var(--primary-dark)' : 'var(--surface-color)'};
	}
`

const SolutionContent = styled.div`
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
`

const Exercise = styled.ul`
	flex: 1;
	padding: 0;
	margin-left: 1rem;
	padding-bottom: 1rem;
`

const Answer = styled.div`
	background: var(--background-color);
	border-radius: var(--radius-md);
	padding: 1.5rem;
	border: 1px solid var(--border-color);

	strong {
		display: block;
		margin-bottom: 1rem;
		color: var(--primary-color);
		font-size: 1.1rem;
	}

	& > div {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 1rem;
		padding: 0.5rem;
		border-radius: var(--radius-sm);

		span {
			min-width: 100px;
			color: var(--text-primary);
		}
	}
`

const Section = styled.div`
	h4 {
		color: var(--text-primary);
		margin-bottom: 1rem;
		font-size: 1.2rem;
	}

	& > div {
		color: var(--text-secondary);
	}
`

const ShowAllToggle = styled.label`
	display: flex;
	align-items: center;
	gap: 0.5rem;
	font-size: 0.9rem;
	color: var(--text-secondary);
	margin-bottom: 1rem;
	cursor: pointer;

	input {
		width: 1rem;
		height: 1rem;
		cursor: pointer;
	}

	&:hover {
		color: var(--text-primary);
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
	const updateRequiredParameters = useTasksStore(
		state => state.updateRequiredParameters
	)
	const [showAllAnswers, setShowAllAnswers] = useState(false)

	if (!isOpen) return null

	const handleCheckboxChange = (
		element: string,
		param: 'current' | 'voltage',
		checked: boolean
	) => {
		updateRequiredParameters(task.id, element, param, checked)
	}

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
									<div>
										{element}: {value} {getElementUnit(element)}
									</div>
									<CheckboxGroup>
										<ParameterButton
											type='button'
											$active={
												task.requiredParameters?.[element]?.current || false
											}
											onClick={() =>
												handleCheckboxChange(
													element,
													'current',
													!task.requiredParameters?.[element]?.current
												)
											}
										>
											i(t)
										</ParameterButton>
										<ParameterButton
											type='button'
											$active={
												task.requiredParameters?.[element]?.voltage || false
											}
											onClick={() =>
												handleCheckboxChange(
													element,
													'voltage',
													!task.requiredParameters?.[element]?.voltage
												)
											}
										>
											U(t)
										</ParameterButton>
									</CheckboxGroup>
								</ConditionItem>
							))}
					</ConditionsList>
				</Section>
				<Section>
					<h4>Найти:</h4>
					<Exercise>
						{generateConditions(task)
							? generateConditions(task)!.map(condition => (
									<li key={condition}>{condition}</li>
							  ))
							: 'Условие не задано'}
					</Exercise>
				</Section>
				<Section>
					<div
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
						}}
					>
						<h4>Ответы:</h4>
						<ShowAllToggle>
							<input
								type='checkbox'
								checked={showAllAnswers}
								onChange={e => setShowAllAnswers(e.target.checked)}
							/>
							Показать все ответы
						</ShowAllToggle>
					</div>
					<SolutionContent>
						{task.answer &&
							Object.entries(task.answer).map(
								([elementName, elementEquations]) => {
									const shouldShowCurrent =
										showAllAnswers ||
										task.requiredParameters?.[elementName]?.current
									const shouldShowVoltage =
										showAllAnswers ||
										task.requiredParameters?.[elementName]?.voltage

									if (!shouldShowCurrent && !shouldShowVoltage) return null

									return (
										<Answer key={elementName}>
											<strong>Элемент {elementName}</strong>
											{Object.entries(elementEquations).map(
												([eqName, eqValue]) => {
													const isCurrent = eqName === 'i(t)'
													if (
														(isCurrent && !shouldShowCurrent) ||
														(!isCurrent && !shouldShowVoltage)
													) {
														return null
													}
													return (
														<div key={eqName}>
															<span>{isCurrent ? 'Ток:' : 'Напряжение:'}</span>
															<EquationDisplay tex={String(eqValue)} />
														</div>
													)
												}
											)}
										</Answer>
									)
								}
							)}
					</SolutionContent>
				</Section>
			</ModalContent>
		</Modal>
	)
}

export type { TaskModalProps }
