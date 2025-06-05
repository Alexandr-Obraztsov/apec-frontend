import React from 'react'
import { MathJax } from 'better-react-mathjax'
import { prettifyEquation } from './mathFormatters'

interface EquationDisplayProps {
	equation?: string
	tex?: string
}

/**
 * Компонент для отображения математических уравнений в LaTeX формате
 * @param equation Текст уравнения (новый формат)
 * @param tex Текст уравнения (старый формат)
 * @returns React компонент
 */
export const EquationDisplay: React.FC<EquationDisplayProps> = ({
	equation,
	tex,
}) => {
	// Используем equation если он есть, иначе используем tex
	const processedTex = prettifyEquation(equation || tex || '')

	return <MathJax dynamic>{`$$${processedTex}$$`}</MathJax>
}
