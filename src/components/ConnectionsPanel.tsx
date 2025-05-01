import React, { useState, useMemo } from 'react'
import styled from 'styled-components'
import { useCircuitStore } from '../store/circuitStore'

const PanelContainer = styled.div`
	position: fixed;
	bottom: 20px;
	right: 20px;
	width: 280px;
	max-height: 300px;
	background-color: var(--surface-color);
	border-radius: 8px;
	padding: 12px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	z-index: 1000;
	overflow-y: auto;
	border: 1px solid var(--border-color);
	font-size: 13px;
`

const Title = styled.div`
	font-weight: 600;
	font-size: 14px;
	margin-bottom: 10px;
	padding-bottom: 8px;
	border-bottom: 1px solid var(--border-color);
	color: var(--text-primary);
`

const ElementItem = styled.div<{ isSelected?: boolean }>`
	margin-bottom: 10px;
	padding: 8px;
	border-radius: 6px;
	background-color: ${props =>
		props.isSelected ? 'var(--primary-light)' : 'var(--bg-color)'};
	border: 1px solid
		${props => (props.isSelected ? 'var(--primary-color)' : 'transparent')};

	&:hover {
		background-color: ${props =>
			props.isSelected ? 'var(--primary-light)' : 'var(--hover-color)'};
	}
`

const SelectedElementContainer = styled.div`
	margin-bottom: 16px;
	padding: 12px;
	border-radius: 8px;
	background-color: var(--primary-light);
	border: 1px solid var(--primary-color);
`

const SelectedTitle = styled.div`
	font-weight: 600;
	font-size: 14px;
	margin-bottom: 8px;
	color: var(--primary-color);
`

const ElementName = styled.div`
	font-weight: 500;
	margin-bottom: 5px;
	color: var(--text-primary);
`

const ElementType = styled.span`
	font-size: 11px;
	color: var(--text-secondary);
	margin-left: 5px;
	font-weight: normal;
`

const ElementValue = styled.div`
	font-size: 11px;
	color: var(--text-secondary);
	margin-bottom: 5px;
`

const ElementDetail = styled.div`
	display: flex;
	justify-content: space-between;
	margin-bottom: 4px;
	font-size: 12px;
`

const ConnectionInfo = styled.div`
	display: flex;
	justify-content: space-between;
	color: var(--text-secondary);
	font-size: 12px;
`

const NodeConnectionsContainer = styled.div`
	margin-top: 6px;
	padding-top: 6px;
	border-top: 1px dashed var(--border-color);
`

const NodeConnection = styled.div`
	display: flex;
	justify-content: space-between;
	margin-bottom: 4px;
	font-size: 12px;
	color: var(--text-secondary);
`

const EmptyState = styled.div`
	color: var(--text-secondary);
	font-style: italic;
	text-align: center;
	padding: 20px 0;
`

const TabsContainer = styled.div`
	display: flex;
	margin-bottom: 12px;
	border-bottom: 1px solid var(--border-color);
`

const Tab = styled.div<{ active: boolean }>`
	padding: 6px 12px;
	cursor: pointer;
	font-weight: ${props => (props.active ? '600' : '400')};
	color: ${props =>
		props.active ? 'var(--primary-color)' : 'var(--text-secondary)'};
	border-bottom: 2px solid
		${props => (props.active ? 'var(--primary-color)' : 'transparent')};

	&:hover {
		color: var(--primary-color);
	}
`

const SimpleConnectionItem = styled.div`
	padding: 8px;
	margin-bottom: 8px;
	background-color: var(--bg-color);
	border-radius: 6px;
	color: var(--text-primary);
	font-size: 12px;

	&:hover {
		background-color: var(--hover-color);
	}
`

const ConnectionsPanel: React.FC = () => {
	// Состояние для переключения вкладок
	const [activeTab, setActiveTab] = useState<'detailed' | 'simple' | 'nodes'>(
		'detailed'
	)

	// Минимизируем получение данных из хранилища
	const elements = useCircuitStore(state => state.elements)
	const nodes = useCircuitStore(state => state.nodes)
	const selectedElementId = useCircuitStore(state => state.selectedElementId)
	const selectedNodeId = useCircuitStore(state => state.selectedNodeId)

	// Получаем выбранные элементы
	const selectedElement = useMemo(() => {
		return selectedElementId
			? elements.find(e => e.id === selectedElementId)
			: null
	}, [elements, selectedElementId])

	const selectedNode = useMemo(() => {
		return selectedNodeId ? nodes.find(n => n.id === selectedNodeId) : null
	}, [nodes, selectedNodeId])

	// Получаем имя узла по ID
	const getNodeNameById = (nodeId: string): string => {
		const node = nodes.find(n => n.id === nodeId)
		return node ? node.name : '-'
	}

	// Получаем подключенные элементы узла
	const getConnectedElementsInfo = (nodeId: string) => {
		const node = nodes.find(n => n.id === nodeId)
		if (!node) return []

		return node.connectedElements.map(elementId => {
			const element = elements.find(e => e.id === elementId)
			return {
				id: elementId,
				name: element ? element.name : '-',
				type: element ? element.type : 'unknown',
				value: element ? `${element.value} ${element.unit}` : '-',
			}
		})
	}

	// Мемоизируем данные о узлах с подключенными элементами
	const nodesWithConnections = useMemo(() => {
		return nodes.map(node => ({
			...node,
			connectedElementsInfo: getConnectedElementsInfo(node.id),
		}))
	}, [nodes, elements])

	// Форматирование значения для отображения
	const formatValue = (value: number, unit: string): string => {
		if (unit === 'Ом' && value >= 1000) {
			return `${(value / 1000).toFixed(0)} кОм`
		}
		return `${value} ${unit}`
	}

	// Рендер детальной информации о выбранном элементе
	const renderSelectedElementInfo = () => {
		if (selectedElement) {
			return (
				<SelectedElementContainer>
					<SelectedTitle>Выбранный элемент</SelectedTitle>
					<ElementName>
						{selectedElement.name}
						<ElementType>({selectedElement.type})</ElementType>
					</ElementName>
					<ElementDetail>
						<span>Значение:</span>
						<span>
							{formatValue(selectedElement.value, selectedElement.unit)}
						</span>
					</ElementDetail>
					<ElementDetail>
						<span>Начальный узел:</span>
						<span>{getNodeNameById(selectedElement.startNodeId)}</span>
					</ElementDetail>
					<ElementDetail>
						<span>Конечный узел:</span>
						<span>{getNodeNameById(selectedElement.endNodeId)}</span>
					</ElementDetail>
				</SelectedElementContainer>
			)
		} else if (selectedNode) {
			const connectedElements = getConnectedElementsInfo(selectedNode.id)
			return (
				<SelectedElementContainer>
					<SelectedTitle>Выбранный узел</SelectedTitle>
					<ElementName>Узел {selectedNode.name}</ElementName>
					<ElementDetail>
						<span>Координаты:</span>
						<span>
							x: {selectedNode.position.x.toFixed(0)}, y:{' '}
							{selectedNode.position.y.toFixed(0)}
						</span>
					</ElementDetail>
					<ElementDetail>
						<span>Подключенные элементы:</span>
						<span>{connectedElements.length}</span>
					</ElementDetail>
					{connectedElements.length > 0 && (
						<NodeConnectionsContainer>
							{connectedElements.map(element => (
								<NodeConnection key={element.id}>
									<span>{element.name}</span>
									<span>{element.value}</span>
								</NodeConnection>
							))}
						</NodeConnectionsContainer>
					)}
				</SelectedElementContainer>
			)
		}
		return null
	}

	// Рендер детальной вкладки с информацией о соединениях элементов
	const renderDetailedTab = () => (
		<>
			{elements.length === 0 ? (
				<EmptyState>Нет элементов для отображения</EmptyState>
			) : (
				elements.map(element => (
					<ElementItem
						key={element.id}
						isSelected={element.id === selectedElementId}
						onClick={() => useCircuitStore.getState().selectElement(element.id)}
					>
						<ElementName>
							{element.name}
							<ElementType>({element.type})</ElementType>
						</ElementName>
						<ElementValue>
							{formatValue(element.value, element.unit)}
						</ElementValue>
						<ConnectionInfo>
							<span>От: {getNodeNameById(element.startNodeId)}</span>
							<span>→</span>
							<span>К: {getNodeNameById(element.endNodeId)}</span>
						</ConnectionInfo>
					</ElementItem>
				))
			)}
		</>
	)

	// Рендер простой вкладки с соединениями в формате "(название) (узел1) (узел2)"
	const renderSimpleTab = () => (
		<>
			{elements.length === 0 ? (
				<EmptyState>Нет элементов для отображения</EmptyState>
			) : (
				elements.map(element => (
					<SimpleConnectionItem key={element.id}>
						{element.name} {getNodeNameById(element.startNodeId)}{' '}
						{getNodeNameById(element.endNodeId)}
					</SimpleConnectionItem>
				))
			)}
		</>
	)

	// Рендер вкладки с узлами и их подключенными элементами
	const renderNodesTab = () => (
		<>
			{nodes.length === 0 ? (
				<EmptyState>Нет узлов для отображения</EmptyState>
			) : (
				nodesWithConnections.map(node => (
					<ElementItem
						key={node.id}
						isSelected={node.id === selectedNodeId}
						onClick={() => useCircuitStore.getState().selectNode(node.id)}
					>
						<ElementName>Узел {node.name}</ElementName>
						{node.connectedElementsInfo.length > 0 ? (
							<NodeConnectionsContainer>
								{node.connectedElementsInfo.map(element => (
									<NodeConnection key={element.id}>
										<span>{element.name}</span>
										<span>{element.value}</span>
									</NodeConnection>
								))}
							</NodeConnectionsContainer>
						) : (
							<div
								style={{
									fontSize: '12px',
									color: 'var(--text-secondary)',
									fontStyle: 'italic',
								}}
							>
								Нет подключенных элементов
							</div>
						)}
					</ElementItem>
				))
			)}
		</>
	)

	return (
		<PanelContainer>
			<Title>Информация о схеме</Title>

			{renderSelectedElementInfo()}

			<TabsContainer>
				<Tab
					active={activeTab === 'detailed'}
					onClick={() => setActiveTab('detailed')}
				>
					Элементы
				</Tab>
				<Tab
					active={activeTab === 'simple'}
					onClick={() => setActiveTab('simple')}
				>
					Простые
				</Tab>
				<Tab
					active={activeTab === 'nodes'}
					onClick={() => setActiveTab('nodes')}
				>
					Узлы
				</Tab>
			</TabsContainer>

			{activeTab === 'detailed'
				? renderDetailedTab()
				: activeTab === 'simple'
				? renderSimpleTab()
				: renderNodesTab()}
		</PanelContainer>
	)
}

export default ConnectionsPanel
