import { Task } from '../store/tasksStore'

export const generateConditions = (task: Task) => {
	const conditions = []

	if (!task.detailedSolution?.elements || !task.requiredParameters) return null

	for (const [element, solution] of Object.entries(
		task.detailedSolution.elements
	)) {
		const params = task.requiredParameters[element]

		if (!params) continue

		// Пропускаем элементы, которые не должны показываться в условиях
		if (params.show_in_conditions === false) continue

		// Если есть готовое описание, используем его
		if (params.description) {
			conditions.push(params.description)
			continue
		}

		// Иначе генерируем описание на основе параметров
		if (params.current && params.voltage) {
			if (params.at_time !== undefined) {
				conditions.push(
					`Ток i(${params.at_time}) и напряжение V(${params.at_time}) для ${element} в момент времени t = ${params.at_time} с`
				)
			} else {
				conditions.push(`Ток i(t) и напряжение V(t) для ${element}`)
			}
		} else if (params.current && solution.type === 'i') {
			if (params.at_time !== undefined) {
				conditions.push(
					`Ток i(${params.at_time}) для ${element} в момент времени t = ${params.at_time} с`
				)
			} else {
				conditions.push(`Ток i(t) для ${element}`)
			}
		} else if (params.voltage && solution.type === 'v') {
			if (params.at_time !== undefined) {
				conditions.push(
					`Напряжение V(${params.at_time}) для ${element} в момент времени t = ${params.at_time} с`
				)
			} else {
				conditions.push(`Напряжение V(t) для ${element}`)
			}
		}
	}

	if (conditions.length === 0) return null
	return conditions
}
