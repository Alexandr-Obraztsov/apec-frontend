import { create } from 'zustand'
import { ElementParameters } from '../services/api'

interface DetailedSolution {
	roots: string[]
	poly: string
	initial_values: Record<string, number>
	elements: Record<string, ElementSolution>
}

interface ElementSolution {
	type: 'i' | 'v'
	expr: string
	steady_state: number
	coefficients: Array<{
		type: 'phi' | 'A'
		value: number
	}>
	at_time?: number
	value_at_time?: number
}

export interface Task {
	id: string
	imageUrl: string
	componentValues: Record<string, number>
	detailedSolution: DetailedSolution
	requiredParameters: Record<string, ElementParameters>
}

interface TasksState {
	tasks: Task[]
	addTask: (task: Task) => void
	removeTask: (taskId: string) => void
	clearTasks: () => void
	updateRequiredParameters: (
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
	updateRequiredParameters: (taskId, element, param, value) =>
		set(state => {
			const taskIndex = state.tasks.findIndex(task => task.id === taskId)
			if (taskIndex === -1) return state

			const newTasks = [...state.tasks]
			const task = { ...newTasks[taskIndex] }

			task.requiredParameters = {
				...task.requiredParameters,
				[element]: {
					...task.requiredParameters[element],
					[param]: value,
				},
			}

			newTasks[taskIndex] = task
			return { tasks: newTasks }
		}),
}))
