import { Task } from '../store/tasksStore'

export const generateConditions = (task: Task) => {
	const conditions = []

	for (const element in task.answer) {
		if (
			task.searchParams[element].current &&
			task.searchParams[element].voltage
		) {
			conditions.push(`I(t) и U(t) для ${element}`)
		} else if (task.searchParams[element].current) {
			conditions.push(`I(t) для ${element}`)
		} else if (task.searchParams[element].voltage) {
			conditions.push(`U(t) для ${element}`)
		}
	}

	if (conditions.length === 0) return null
	return conditions
}
