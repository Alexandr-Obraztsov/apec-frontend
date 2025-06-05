import { Task } from '../store/tasksStore'

export const generateConditions = (task: Task) => {
	const conditions = []

	if (!task.detailedSolution?.elements || !task.requiredParameters) return null

	for (const [element, solution] of Object.entries(
		task.detailedSolution.elements
	)) {
		if (
			task.requiredParameters[element]?.current &&
			task.requiredParameters[element]?.voltage
		) {
			conditions.push(`Ток i(t) и напряжение U(t) для ${element}`)
		} else if (
			task.requiredParameters[element]?.current &&
			solution.type === 'i'
		) {
			conditions.push(`Ток i(t) для ${element}`)
		} else if (
			task.requiredParameters[element]?.voltage &&
			solution.type === 'v'
		) {
			conditions.push(`Напряжение U(t) для ${element}`)
		}
	}

	if (conditions.length === 0) return null
	return conditions
}
