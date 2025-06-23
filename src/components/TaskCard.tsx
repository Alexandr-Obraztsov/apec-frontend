import React from 'react'
import styled from 'styled-components'
import { Task, useTasksStore } from '../store/tasksStore'
import { generateConditions } from '../utils/generateConditions'
import { getElementUnit } from '../utils/getElementUnit'
import { formatValue } from '../utils/formatters'

const Card = styled.div`
	background: var(--surface-color);
	border-radius: var(--radius-md);
	padding: 1.5rem;
	border: 1px solid var(--border-color);
	position: relative;
	cursor: pointer;
	transition: transform 0.2s;
	color: var(--text-primary);
	display: flex;
	flex-direction: column;
	min-height: 100%;

	&:hover {
		transform: translateY(-2px);
	}
`

const TaskImage = styled.img`
	width: 100%;
	max-height: 200px;
	object-fit: contain;
	margin-bottom: 1rem;
`

const TaskConditions = styled.div`
	display: flex;
	flex-direction: column;
	gap: 1rem;
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
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 0.25rem;

	.element-name {
		font-weight: 500;
		color: var(--primary-color);
	}

	.element-value {
		font-size: 0.85rem;
		color: var(--text-primary);
	}
`

const TaskCardActions = styled.div`
	display: flex;
	gap: 0.5rem;
	margin-top: auto;
	border-top: 1px solid var(--border-color);
	padding-top: 1rem;
`

const TaskCardButton = styled.button`
	background: var(--background-color);
	color: var(--text-primary);
	border: 1px solid var(--border-color);
	border-radius: var(--radius-sm);
	padding: 0.5rem 1rem;
	font-size: 0.875rem;
	cursor: pointer;
	flex: 1;
	transition: all 0.2s;

	&:hover {
		background: var(--primary-color);
		color: white;
		border-color: var(--primary-color);
	}

	&.delete:hover {
		background: #ef4444;
		border-color: #ef4444;
	}
`

const Exercise = styled.ul`
	flex: 1;
	padding: 0;
	margin-left: 1rem;
	padding-bottom: 1rem;
`

interface TaskCardProps {
	task: Task
	onClick?: () => void
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
	const removeTask = useTasksStore(state => state.removeTask)

	return (
		<Card onClick={onClick}>
			<TaskImage src={task.imageUrl} alt='Схема цепи' />
			<TaskConditions>
				<div>
					<h4>Дано:</h4>
					<ConditionsList>
						{task.componentValues &&
							Object.entries(task.componentValues).map(([element, value]) => (
								<ConditionItem key={element}>
									<span className='element-name'>{element}:</span>
									<span className='element-value'>
										{formatValue(value, getElementUnit(element))}
									</span>
								</ConditionItem>
							))}
					</ConditionsList>
				</div>
				<div>
					<h4>Найти:</h4>
					<Exercise>
						{generateConditions(task) ? (
							generateConditions(task)!.map(condition => (
								<li key={condition}>{condition}</li>
							))
						) : (
							<p>Условие не задано</p>
						)}
					</Exercise>
				</div>
			</TaskConditions>
			<TaskCardActions>
				<TaskCardButton
					className='delete'
					onClick={e => {
						e.stopPropagation()
						removeTask(task.id)
					}}
				>
					Удалить
				</TaskCardButton>
			</TaskCardActions>
		</Card>
	)
}

export type { Task }
