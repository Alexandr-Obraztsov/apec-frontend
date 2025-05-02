import React from 'react'
import { SolutionItem } from '../services/api'
import {
	ResultTable as StyledResultTable,
	ResultRow,
	ResultCell,
	ResultHeader,
} from '../styles/components/CircuitSolutionModal.styles'

interface ResultTableProps {
	formattedResult: SolutionItem[]
}

/**
 * Компонент для отображения таблицы результатов
 */
export const ResultTable: React.FC<ResultTableProps> = ({
	formattedResult,
}) => {
	if (formattedResult.length === 0) return null

	return (
		<StyledResultTable>
			<thead>
				<tr>
					<ResultHeader>Элемент</ResultHeader>
					<ResultHeader>Значение</ResultHeader>
					<ResultHeader>Единица измерения</ResultHeader>
				</tr>
			</thead>
			<tbody>
				{formattedResult.map((item, index) => (
					<ResultRow key={item.id || item.name || index}>
						<ResultCell>{item.name}</ResultCell>
						<ResultCell>{item.value}</ResultCell>
						<ResultCell>{item.unit}</ResultCell>
					</ResultRow>
				))}
			</tbody>
		</StyledResultTable>
	)
}

export default ResultTable
