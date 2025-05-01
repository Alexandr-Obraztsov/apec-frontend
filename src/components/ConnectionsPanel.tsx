import React from 'react'
import styled from 'styled-components'
import { useCircuitStore } from '../store/circuitStore'
import { Node } from '../types'

const ConnectionsPanelContainer = styled.div`
	position: fixed;
	bottom: 20px;
	right: 20px;
	width: 280px;
	max-height: 300px;
	background-color: var(--surface-color);
	border-radius: var(--radius-md);
	padding: 12px;
	box-shadow: var(--shadow-md);
	z-index: 1000;
	overflow-y: auto;
	display: flex;
	flex-direction: column;
	gap: 10px;
	border: 1px solid var(--border-color);
`

const PanelHeader = styled.div`
	font-weight: 600;
	font-size: 14px;
	color: var(--text-primary);
	padding-bottom: 8px;
	border-bottom: 1px solid var(--border-color);
`

const ConnectionItem = styled.div`
	display: flex;
	flex-direction: column;
	gap: 4px;
	font-size: 13px;
	color: var(--text-secondary);
	padding: 6px;
	border-radius: var(--radius-sm);

	&:hover {
		background-color: var(--hover-color);
	}
`

const ItemHeader = styled.div`
	display: flex;
	justify-content: space-between;
	font-weight: 500;
	color: var(--text-primary);
`

const ConnectionsList = styled.div`
	padding-left: 8px;
	color: var(--text-secondary);
	display: flex;
	flex-direction: column;
	gap: 2px;
`

const ElementLink = styled.div`
	cursor: pointer;
	padding: 2px 4px;
	border-radius: var(--radius-xs);

	&:hover {
		background-color: var(--primary-light);
		color: var(--primary-color);
	}
`

const EmptyState = styled.div`
	color: var(--text-disabled);
	font-style: italic;
	padding: 10px 0;
	text-align: center;
`

const Badge = styled.span`
	background-color: var(--primary-light);
	color: var(--primary-color);
	padding: 2px 6px;
	border-radius: var(--radius-sm);
	font-size: 11px;
	display: inline-block;
`

const NodeLink = styled.div`
	cursor: pointer;
	display: inline-flex;
	align-items: center;
	font-weight: 500;

	&:hover {
		color: var(--accent-color);
	}
`

const DetailBlock = styled.div`
	margin-top: 8px;
	padding: 8px;
	border-radius: var(--radius-sm);
	background-color: var(--surface-alt);
	font-size: 12px;

	h5 {
		margin: 0 0 5px 0;
		color: var(--text-primary);
		font-weight: 600;
		font-size: 13px;
	}

	table {
		width: 100%;
		border-collapse: collapse;

		tr {
			td {
				padding: 2px 0;
				&:first-child {
					color: var(--text-secondary);
					width: 40%;
				}
				&:last-child {
					color: var(--text-primary);
					font-weight: 500;
				}
			}
		}
	}
`

// Функция для форматирования значения компонента
const formatComponentValue = (value: number, unit: string): string => {
	if (value === 0) return `0 ${unit}`

	// Сопротивление
	if (unit === 'Ом') {
		if (value >= 1000000) {
			return `${(value / 1000000).toFixed(2)} МОм`
		} else if (value >= 1000) {
			return `${(value / 1000).toFixed(2)} кОм`
		}
	}

	// Ёмкость
	if (unit === 'мкФ') {
		if (value >= 1000) {
			return `${(value / 1000).toFixed(2)} мФ`
		} else if (value < 1) {
			return `${(value * 1000).toFixed(2)} нФ`
		}
	}

	// Индуктивность
	if (unit === 'мГн') {
		if (value >= 1000) {
			return `${(value / 1000).toFixed(2)} Гн`
		} else if (value < 1) {
			return `${(value * 1000).toFixed(2)} мкГн`
		}
	}

	return `${value} ${unit}`
}

const ConnectionsPanel: React.FC = () => {
	const {
		nodes,
		elements,
		selectedNodeId,
		selectedElementId,
		setHighlightedNode,
		setHighlightedElement,
		selectNode,
		selectElement,
	} = useCircuitStore(state => ({
		nodes: state.nodes,
		elements: state.elements,
		selectedNodeId: state.selectedNodeId,
		selectedElementId: state.selectedElementId,
		setHighlightedNode: state.setHighlightedNode,
		setHighlightedElement: state.setHighlightedElement,
		selectNode: state.selectNode,
		selectElement: state.selectElement,
	}))

	// Получение списка выбранных узлов или всех узлов, если ничего не выбрано
	const getDisplayNodes = (): Node[] => {
		if (selectedNodeId) {
			return nodes.filter(node => node.id === selectedNodeId)
		}
		if (selectedElementId) {
			const selectedElement = elements.find(el => el.id === selectedElementId)
			if (selectedElement) {
				return nodes.filter(
					node =>
						node.id === selectedElement.startNodeId ||
						node.id === selectedElement.endNodeId
				)
			}
		}
		return nodes.slice(0, 5) // Показываем первые 5 узлов, если ничего не выбрано
	}

	// Получаем имя элемента по ID
	const getElementNameById = (elementId: string): string => {
		const element = elements.find(el => el.id === elementId)
		return element ? element.name : 'Неизвестно'
	}

	// Получаем выбранный элемент
	const selectedElement = elements.find(el => el.id === selectedElementId)

	// Получаем отображаемые узлы
	const displayNodes = getDisplayNodes()

	// Обработчики событий для подсветки элементов
	const handleElementMouseEnter = (elementId: string) => {
		setHighlightedElement(elementId)
	}

	const handleElementMouseLeave = () => {
		setHighlightedElement(null)
	}

	// Обработчики событий для подсветки узлов
	const handleNodeMouseEnter = (nodeId: string) => {
		setHighlightedNode(nodeId)
	}

	const handleNodeMouseLeave = () => {
		setHighlightedNode(null)
	}

	// Обработчики кликов для выбора элементов/узлов
	const handleElementClick = (elementId: string) => {
		selectElement(elementId)
	}

	const handleNodeClick = (nodeId: string) => {
		selectNode(nodeId)
	}

	return (
		<ConnectionsPanelContainer>
			<PanelHeader>Связи в схеме</PanelHeader>

			{/* Отображение детальной информации о выбранном элементе */}
			{selectedElement && (
				<DetailBlock>
					<h5>
						{selectedElement.name} - {selectedElement.type}
					</h5>
					<table>
						<tbody>
							<tr>
								<td>Значение:</td>
								<td>
									{formatComponentValue(
										selectedElement.value,
										selectedElement.unit
									)}
								</td>
							</tr>
							<tr>
								<td>Соединение:</td>
								<td>
									{nodes.find(n => n.id === selectedElement.startNodeId)
										?.name || '-'}{' '}
									→
									{nodes.find(n => n.id === selectedElement.endNodeId)?.name ||
										'-'}
								</td>
							</tr>
						</tbody>
					</table>
				</DetailBlock>
			)}

			{/* Отображение детальной информации о выбранном узле */}
			{selectedNodeId && !selectedElement && (
				<DetailBlock>
					<h5>{nodes.find(n => n.id === selectedNodeId)?.name || '-'}</h5>
					<table>
						<tbody>
							<tr>
								<td>Подключено:</td>
								<td>
									{nodes.find(n => n.id === selectedNodeId)?.connectedElements
										.length || 0}{' '}
									элементов
								</td>
							</tr>
						</tbody>
					</table>
				</DetailBlock>
			)}

			{displayNodes.length === 0 ? (
				<EmptyState>Нет узлов для отображения</EmptyState>
			) : (
				displayNodes.map(node => (
					<ConnectionItem key={node.id}>
						<ItemHeader>
							<NodeLink
								onMouseEnter={() => handleNodeMouseEnter(node.id)}
								onMouseLeave={handleNodeMouseLeave}
								onClick={() => handleNodeClick(node.id)}
							>
								{node.name}
							</NodeLink>
							<Badge>{node.connectedElements.length} связей</Badge>
						</ItemHeader>

						<ConnectionsList>
							{node.connectedElements.length === 0 ? (
								<div>Нет подключенных элементов</div>
							) : (
								node.connectedElements.map(elementId => (
									<ElementLink
										key={elementId}
										onMouseEnter={() => handleElementMouseEnter(elementId)}
										onMouseLeave={handleElementMouseLeave}
										onClick={() => handleElementClick(elementId)}
									>
										• {getElementNameById(elementId)}
									</ElementLink>
								))
							)}
						</ConnectionsList>
					</ConnectionItem>
				))
			)}
		</ConnectionsPanelContainer>
	)
}

export default ConnectionsPanel
