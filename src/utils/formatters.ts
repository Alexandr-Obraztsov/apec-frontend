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

	// Если значение равно 0, просто возвращаем
	if (numValue === 0) {
		return `0 ${unit}`
	}

	// Получаем абсолютное значение
	const absValue = Math.abs(numValue)

	// Находим подходящий префикс
	const prefix =
		SI_PREFIXES.find(
			(p, i) =>
				absValue >= p.value &&
				(i === SI_PREFIXES.length - 1 || absValue < SI_PREFIXES[i + 1].value)
		) || SI_PREFIXES[4] // По умолчанию - без префикса

	// Вычисляем новое значение
	const scaledValue = numValue / prefix.value

	// Удаляем лишние нули после запятой
	const formattedValue = scaledValue.toFixed(2)

	// Формируем итоговую строку
	return `${formattedValue} ${prefix.symbol}${unit}`
}
