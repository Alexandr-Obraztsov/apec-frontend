import { create } from 'zustand'
import { CircuitSolutionResult } from '../services/api'

export interface Task {
	id: string
	imageUrl: string
	conditions: { [key: string]: string }
	answer: CircuitSolutionResult
	searchParams: {
		[key: string]: {
			current: boolean
			voltage: boolean
		}
	}
}

interface TasksState {
	tasks: Task[]
	addTask: (task: Task) => void
	removeTask: (taskId: string) => void
	clearTasks: () => void
	updateSearchParams: (
		taskId: string,
		element: string,
		param: 'current' | 'voltage',
		value: boolean
	) => void
}

export const useTasksStore = create<TasksState>(set => ({
	tasks: [],
	addTask: task => set(state => ({ tasks: [task, ...state.tasks] })),
	removeTask: taskId =>
		set(state => ({
			tasks: state.tasks.filter(task => task.id !== taskId),
		})),
	clearTasks: () => set({ tasks: [] }),
	updateSearchParams: (taskId, element, param, value) =>
		set(state => {
			const taskIndex = state.tasks.findIndex(task => task.id === taskId)
			if (taskIndex === -1) return state

			const newTasks = [...state.tasks]
			const task = { ...newTasks[taskIndex] }

			task.searchParams = {
				...task.searchParams,
				[element]: {
					...task.searchParams[element],
					[param]: value,
				},
			}

			newTasks[taskIndex] = task
			return { tasks: newTasks }
		}),
}))
