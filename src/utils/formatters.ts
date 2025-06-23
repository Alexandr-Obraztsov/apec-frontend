/**
 * Информация о префиксе СИ
 */
interface SIPrefix {
	value: number // Множитель (например 1e-6 для микро)
	symbol: string // Символ префикса (например "мк" для микро)
}

/**
 * Массив префиксов СИ в порядке от самых маленьких к большим
 */
const SI_PREFIXES: SIPrefix[] = [
	{ value: 1e-12, symbol: 'п' }, // пико
	{ value: 1e-9, symbol: 'н' }, // нано
	{ value: 1e-6, symbol: 'мк' }, // микро
	{ value: 1e-3, symbol: 'м' }, // милли
	{ value: 1, symbol: '' }, // без префикса
	{ value: 1e3, symbol: 'к' }, // кило
	{ value: 1e6, symbol: 'М' }, // мега
	{ value: 1e9, symbol: 'Г' }, // гига
	{ value: 1e12, symbol: 'Т' }, // тера
]

/**
 * Универсальная функция форматирования значений с префиксами СИ
 *
 * @param value Значение элемента (число или строка)
 * @param unit Единица измерения (Ом, Ф, Гн, В, А, м)
 * @returns Отформатированная строка с значением и единицей измерения
 */
export const formatValue = (value: number | string, unit: string): string => {
	// Если значение - строка и не преобразуется в число, это выражение - возвращаем как есть
	if (typeof value === 'string' && isNaN(Number(value))) {
		return `${value} ${unit}`
	}

	// Преобразуем значение в число для форматирования
	const numValue =
		typeof value === 'number' ? value : parseFloat(value.toString())

	// Проверяем что получили валидное число
	if (isNaN(numValue) || !isFinite(numValue)) {
		return `${value} ${unit}`
	}

	// Если значение равно 0 или очень близко к 0, просто возвращаем
	if (numValue === 0 || Math.abs(numValue) < 1e-15) {
		return `0 ${unit}`
	}

	// Получаем абсолютное значение
	const absValue = Math.abs(numValue)

	// Находим подходящий префикс (ищем наибольший подходящий)
	let prefix = SI_PREFIXES[4] // По умолчанию - без префикса
	for (let i = SI_PREFIXES.length - 1; i >= 0; i--) {
		if (absValue >= SI_PREFIXES[i].value) {
			prefix = SI_PREFIXES[i]
			break
		}
	}

	// Вычисляем новое значение
	const scaledValue = numValue / prefix.value

	// Форматируем значение с удалением незначащих нулей
	let formattedValue: string
	if (scaledValue >= 100) {
		// Для больших значений - без дробной части
		formattedValue = scaledValue.toFixed(0)
	} else if (scaledValue >= 10) {
		// Для средних значений - 1 знак после запятой
		formattedValue = scaledValue.toFixed(1)
	} else {
		// Для маленьких значений - 2-3 знака после запятой
		formattedValue = scaledValue.toFixed(3)
	}

	// Удаляем незначащие нули в конце
	formattedValue = formattedValue.replace(/\.?0+$/, '')

	// Формируем итоговую строку
	return `${formattedValue} ${prefix.symbol}${unit}`
}
