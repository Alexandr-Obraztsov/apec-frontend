import { Task } from '../store/tasksStore'

export const generateConditions = (task: Task) => {
	const conditions = []

	if (!task.answer || !task.requiredParameters) return null

	for (const element in task.answer) {
		if (
			task.requiredParameters[element]?.current &&
			task.requiredParameters[element]?.voltage
		) {
			conditions.push(`Ток I(t) и напряжение U(t) для ${element}`)
		} else if (task.requiredParameters[element]?.current) {
			conditions.push(`Ток I(t) для ${element}`)
		} else if (task.requiredParameters[element]?.voltage) {
			conditions.push(`Напряжение U(t) для ${element}`)
		}
	}

	if (conditions.length === 0) return null
	return conditions
}
