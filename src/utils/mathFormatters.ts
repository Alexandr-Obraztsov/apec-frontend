/**
 * Утилиты для форматирования математических выражений в LaTeX
 */

/**
 * Преобразует математическое выражение в красивый LaTeX формат
 * @param equation Исходное математическое выражение
 * @returns Отформатированное LaTeX выражение
 */
export const prettifyEquation = (equation: string): string => {
	// Если это просто число, вернем его без изменений
	if (/^-?\d+(\.\d+)?$/.test(equation.trim())) {
		return equation.trim()
	}

	// Базовая нормализация
	let texEquation = equation
		.trim()
		.replace(/\s+/g, ' ') // Нормализуем пробелы
		.replace(/\\\\/g, '\\') // Убираем двойные экранирования

	// БАЗОВЫЕ МАТЕМАТИЧЕСКИЕ ПРЕОБРАЗОВАНИЯ

	// 1. Преобразование экспоненты: exp(x) -> e^{x}
	texEquation = texEquation
		.replace(/exp\(\s*([^)]+)\s*\)/g, 'e^{$1}')
		// Специальный случай для отрицательных аргументов
		.replace(/exp\(\s*-\s*([^)]+)\s*\)/g, 'e^{-$1}')

	// 2. Преобразование корней: sqrt(x) -> \sqrt{x}
	texEquation = texEquation.replace(/sqrt\(\s*([^)]+)\s*\)/g, '\\sqrt{$1}')

	// 3. Преобразование дробей: a/b -> \frac{a}{b}
	// Сначала обрабатываем простые дроби с числами
	texEquation = texEquation.replace(/(\d+)\s*\/\s*(\d+)/g, '\\frac{$1}{$2}')

	// 4. Преобразование сложных дробей с выражениями
	// Находим и преобразуем выражения вида (a+b)/(c+d)
	texEquation = texEquation.replace(
		/\(([^()]+)\)\s*\/\s*\(([^()]+)\)/g,
		'\\frac{$1}{$2}'
	)

	// 5. Преобразование умножения: a*b -> a \cdot b
	texEquation = texEquation.replace(
		/(\d+|[a-zA-Z])\s*\*\s*(\d+|[a-zA-Z])/g,
		'$1 \\cdot $2'
	)

	// 6. Преобразование степеней: a^b -> a^{b} для многосимвольных степеней
	texEquation = texEquation.replace(
		/([a-zA-Z0-9])\^([a-zA-Z0-9][a-zA-Z0-9+\-*/]+)/g,
		'$1^{$2}'
	)

	// 7. Правильное форматирование отрицательных величин в дробях
	texEquation = texEquation.replace(/-\\frac/g, '-\\frac')

	// СПЕЦИАЛЬНЫЕ ПРЕОБРАЗОВАНИЯ ДЛЯ СЛОЖНЫХ ВЫРАЖЕНИЙ

	// 8. Обработка комплексных выражений с дробями и экспонентами

	// 8.1 Преобразование для выражений вида e^{x}/y
	texEquation = texEquation.replace(
		/e\^{([^}]+)}\s*\/\s*(\d+|\([^)]+\))/g,
		'\\frac{e^{$1}}{$2}'
	)

	// 8.2 Преобразование для a * e^{x}/b
	texEquation = texEquation.replace(
		/(\d+)\s*\\cdot\s*e\^{([^}]+)}\s*\/\s*(\d+)/g,
		'\\frac{$1 \\cdot e^{$2}}{$3}'
	)

	// 8.3 Преобразование для \frac{a}{b} +/- \frac{c*e^{x}}{d}
	texEquation = texEquation
		.replace(/(\\frac{[^}]+}{[^}]+})\s*\+\s*(\\frac{[^}]+}{[^}]+})/g, '$1 + $2')
		.replace(/(\\frac{[^}]+}{[^}]+})\s*-\s*(\\frac{[^}]+}{[^}]+})/g, '$1 - $2')

	// 9. Преобразование trig(x) -> \trig{x} для тригонометрических функций
	const trigFunctions = [
		'sin',
		'cos',
		'tan',
		'cot',
		'sec',
		'csc',
		'arcsin',
		'arccos',
		'arctan',
	]
	trigFunctions.forEach(func => {
		const pattern = new RegExp(`${func}\\(([^)]+)\\)`, 'g')
		texEquation = texEquation.replace(pattern, `\\${func}{$1}`)
	})

	// 10. Проверяем дроби внутри дробей и корректируем их
	if (texEquation.includes('\\frac') && texEquation.includes('}{')) {
		// Находим вложенные дроби и делаем их правильными
		texEquation = texEquation.replace(
			/\\frac{([^{}]*?)\\frac{([^{}]+)}{([^{}]+)}([^{}]*?)}{([^{}]+)}/g,
			'\\frac{$1\\frac{$2}{$3}$4}{$5}'
		)
	}

	// 11. Улучшаем вид чисел с умножением на t в экспонентах (например, 20t -> 20 \cdot t)
	texEquation = texEquation.replace(/(\d+)t/g, '$1 \\cdot t')

	// 12. Добавляем пробелы вокруг операторов для улучшения читаемости
	texEquation = texEquation
		.replace(/([0-9])([+\u002D])/g, '$1 $2')
		.replace(/([+\u002D])([0-9])/g, '$1 $2')

	// Финальная очистка и форматирование
	texEquation = texEquation
		.replace(/\s+/g, ' ') // Нормализация пробелов
		.trim()

	return texEquation
}

/**
 * Функция форматирования для обратной совместимости
 * @param equation Исходное математическое выражение
 * @returns Отформатированное LaTeX выражение
 */
export const formatEquation = prettifyEquation
