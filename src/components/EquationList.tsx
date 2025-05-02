import React from 'react'
import { CircuitSolutionResult } from '../services/api'
import { EquationDisplay } from '../utils/components'
import {
	EquationCard,
	EquationHeader,
	EquationBody,
	EquationRow,
	EquationLabel,
	EquationValue,
} from '../styles/components/Equation.styles'

interface EquationListProps {
	equations: CircuitSolutionResult
}

/**
 * Компонент для отображения списка уравнений
 */
export const EquationList: React.FC<EquationListProps> = ({ equations }) => {
	if (!equations || Object.keys(equations).length === 0) return null

	return (
		<div>
			<h3>Результаты расчета:</h3>
			{Object.entries(equations).map(([elementName, elementEquations]) => (
				<EquationCard key={elementName}>
					<EquationHeader>Элемент: {elementName}</EquationHeader>
					<EquationBody>
						{Object.entries(elementEquations).map(([eqName, eqValue]) => (
							<EquationRow key={eqName}>
								<EquationLabel>
									{eqName === 'i(t)' ? 'Ток:' : 'Напряжение:'}
								</EquationLabel>
								<EquationValue>
									<EquationDisplay tex={String(eqValue)} />
								</EquationValue>
							</EquationRow>
						))}
					</EquationBody>
				</EquationCard>
			))}
		</div>
	)
}

export default EquationList
