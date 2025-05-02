import styled from 'styled-components'

// Стили для отображения уравнений
export const EquationCard = styled.div`
	margin-bottom: 20px;
	border: 1px solid #e0e0e0;
	border-radius: 8px;
	overflow: hidden;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`

export const EquationHeader = styled.div`
	background-color: rgba(0, 128, 0, 0.1);
	padding: 10px 16px;
	font-weight: 600;
	border-bottom: 1px solid #e0e0e0;
	color: #006400;
`

export const EquationBody = styled.div`
	padding: 16px;
	background-color: white;
`

export const EquationRow = styled.div`
	display: flex;
	margin-bottom: 16px;
	align-items: flex-start;
	padding: 4px 0;
`

export const EquationLabel = styled.div`
	width: 120px;
	font-weight: 500;
	color: #333;
	padding-top: 8px;
`

export const EquationValue = styled.div`
	flex: 1;
	padding-left: 16px;

	/* Стили для MathJax формул */
	mjx-container {
		font-size: 1.5em;
		color: #000000;
		margin: 0.5em 0;
		overflow-x: visible;
		max-width: none !important;
	}
`
