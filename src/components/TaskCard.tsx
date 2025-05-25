import React from 'react'
import styled from 'styled-components'
import { CircuitSolutionResult } from '../services/api'

const Card = styled.div`
	background: var(--surface-color);
	border-radius: var(--radius-md);
	padding: 1.5rem;
	border: 1px solid var(--border-color);
	position: relative;
	cursor: pointer;
	transition: transform 0.2s;

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

const DeleteButton = styled.button`
	position: absolute;
	top: 0.5rem;
	right: 0.5rem;
	background: none;
	border: none;
	color: var(--text-secondary);
	cursor: pointer;
	padding: 0.5rem;
	z-index: 2;

	&:hover {
		color: #ef4444;
	}
`

const TaskCardActions = styled.div`
	display: flex;
	gap: 0.5rem;
	margin-top: 1rem;
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

interface Task {
	id: string
	imageUrl: string
	conditions: { [key: string]: string }
	answer: CircuitSolutionResult
}

interface TaskCardProps {
	task: Task
	onDelete: (e: React.MouseEvent, taskId: string) => void
	onSelect: (task: Task) => void
	onWorkWith: (task: Task) => void
}

export const TaskCard: React.FC<TaskCardProps> = ({
	task,
	onDelete,
	onSelect,
	onWorkWith,
}) => {
	return (
		<Card>
			<DeleteButton onClick={e => onDelete(e, task.id)}>✕</DeleteButton>
			<div onClick={() => onSelect(task)}>
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
			</div>
			<TaskCardActions>
				<TaskCardButton className='delete' onClick={e => onDelete(e, task.id)}>
					Удалить
				</TaskCardButton>
			</TaskCardActions>
		</Card>
	)
}

export type { Task }
