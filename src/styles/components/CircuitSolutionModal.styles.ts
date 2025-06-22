import styled from 'styled-components'

// Стили для модального окна
export const PopupOverlay = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.65);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 10000;
	backdrop-filter: blur(2px);
`

export const PopupContent = styled.div`
	background-color: white;
	padding: 0;
	border-radius: 12px;
	box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
	width: 650px;
	max-width: 95%;
	max-height: 90vh;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	animation: fadeIn 0.3s ease-out;

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
`

export const PopupHeader = styled.div`
	font-size: 18px;
	font-weight: 600;
	padding: 18px 20px;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: white;
	display: flex;
	justify-content: space-between;
	align-items: center;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`

export const PopupBody = styled.div`
	overflow-y: auto;
	padding: 20px;
	flex: 1;
`

export const PopupCloseButton = styled.button`
	background: transparent;
	border: none;
	font-size: 18px;
	padding: 0;
	width: 30px;
	height: 30px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	color: white;
	border-radius: 50%;
	transition: all 0.2s;

	&:hover {
		background-color: rgba(255, 255, 255, 0.2);
	}
`

// Стили для таблицы результатов
export const ResultTable = styled.table`
	width: 100%;
	border-collapse: collapse;
	margin-top: 15px;
`

export const ResultRow = styled.tr`
	&:nth-child(odd) {
		background-color: rgba(102, 126, 234, 0.05);
	}
`

export const ResultCell = styled.td`
	padding: 8px;
	border: 1px solid #ddd;
`

export const ResultHeader = styled.th`
	padding: 10px;
	background-color: rgba(102, 126, 234, 0.1);
	color: #667eea;
	font-weight: 500;
	text-align: left;
	border: 1px solid #ddd;
`

// Стили для загрузки
export const LoadingContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 50px 0;
	color: #333;
	text-align: center;
`

export const LoadingText = styled.p`
	margin-top: 20px;
	font-size: 16px;
	color: #555;
`

export const LoadingSpinner = styled.div`
	display: inline-block;
	width: 50px;
	height: 50px;
	border: 4px solid rgba(102, 126, 234, 0.1);
	border-top: 4px solid #667eea;
	border-radius: 50%;
	animation: spin 1.2s cubic-bezier(0.5, 0.1, 0.5, 0.9) infinite;

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
`
