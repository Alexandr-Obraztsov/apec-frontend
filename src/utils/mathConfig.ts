/**
 * Конфигурация MathJax для отображения математических формул
 */

/**
 * Настройка MathJax для корректного отображения формул
 */
export const mathJaxConfig = {
	tex: {
		inlineMath: [['$', '$']],
		displayMath: [['$$', '$$']],
		processEscapes: true,
		tags: 'ams',
	},
	svg: {
		fontCache: 'global',
		scale: 1.3,
		minScale: 1.0,
		matchFontHeight: false,
		mtextInheritFont: false,
	},
}
