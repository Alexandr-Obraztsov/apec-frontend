import React from 'react'
import { DebugContainer, DebugPre } from '../styles/components/Debug.styles'

/**
 * Компонент для отображения отладочной информации
 * @param debugInfo Информация для отладки
 * @returns React компонент
 */
export const DebugInfo: React.FC<{ debugInfo: string }> = ({ debugInfo }) => {
	if (!debugInfo) return null

	return (
		<DebugContainer>
			<details>
				<summary>Отладочная информация</summary>
				<DebugPre>{debugInfo}</DebugPre>
			</details>
		</DebugContainer>
	)
}
