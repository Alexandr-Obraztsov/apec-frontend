import React from 'react'
import { MathJax } from 'better-react-mathjax'
import { prettifyEquation } from './mathFormatters'

/**
 * Компонент для отображения математических уравнений в LaTeX формате
 * @param tex Текст уравнения
 * @returns React компонент
 */
export const EquationDisplay: React.FC<{ tex: string }> = ({ tex }) => {
	// Преобразуем формулу в красивый LaTeX формат
	const processedTex = prettifyEquation(tex)

	return <MathJax dynamic>{`$$${processedTex}$$`}</MathJax>
}
