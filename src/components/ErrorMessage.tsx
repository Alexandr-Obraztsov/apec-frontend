import React from 'react'
import styled from 'styled-components'

const ErrorContainer = styled.div`
	color: #d32f2f;
	padding: 10px 15px;
	background-color: #ffebee;
	border-radius: 6px;
	margin: 10px 0;
	border-left: 4px solid #d32f2f;
`

const ErrorTitle = styled.div`
	font-weight: 600;
	margin-bottom: 5px;
`

const ErrorText = styled.div`
	font-size: 14px;
`

interface ErrorMessageProps {
	message: string
	title?: string
}

/**
 * Компонент для отображения сообщений об ошибках
 */
const ErrorMessage: React.FC<ErrorMessageProps> = ({
	message,
	title = 'Ошибка',
}) => {
	return (
		<ErrorContainer>
			<ErrorTitle>{title}</ErrorTitle>
			<ErrorText>{message}</ErrorText>
		</ErrorContainer>
	)
}

export default ErrorMessage
