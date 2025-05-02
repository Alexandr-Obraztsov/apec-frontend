import React, { useState } from 'react'
import styled from 'styled-components'
import { useCircuitStore } from '../store/circuitStore'

interface PanelContainerProps {
	collapsed: boolean
}

const PanelContainer = styled.div<PanelContainerProps>`
	position: fixed;
	bottom: 50px;
	right: 20px;
	width: 280px;
	height: ${props => (props.collapsed ? '46px' : '300px')};
	background-color: var(--surface-color);
	border-radius: 8px;
	padding: 12px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	z-index: 1000;
	overflow-y: ${props => (props.collapsed ? 'hidden' : 'auto')};
	border: 1px solid var(--border-color);
	font-size: 13px;
	transition: height 0.3s ease, max-height 0.3s ease;
`

const TitleContainer = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-weight: 600;
	font-size: 14px;
	margin-bottom: 10px;
	padding-bottom: 8px;
	border-bottom: 1px solid var(--border-color);
	color: var(--text-primary);
`

const Title = styled.div`
	font-weight: 600;
	font-size: 14px;
	color: var(--text-primary);
`

const CollapseButton = styled.button`
	background: none;
	border: none;
	cursor: pointer;
	color: var(--text-secondary);
	font-size: 16px;
	padding: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 24px;
	height: 24px;
	transition: transform 0.3s ease;
	outline: none;

	&:hover {
		color: var(--text-primary);
	}

	&:focus {
		outline: none;
	}
`

const ElementItem = styled.div`
	margin-bottom: 10px;
	padding: 8px;
	border-radius: 6px;
	background-color: var(--bg-color);

	&:hover {
		background-color: var(--hover-color);
	}
`

const ElementName = styled.div`
	font-weight: 500;
	margin-bottom: 5px;
	color: var(--text-primary);
`

const ConnectionInfo = styled.div`
	display: flex;
	justify-content: space-between;
	color: var(--text-secondary);
	font-size: 12px;
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
	const [activeTab, setActiveTab] = useState<'detailed' | 'simple'>('detailed')
	// Состояние для сворачивания панели
	const [collapsed, setCollapsed] = useState(false)

	// Минимизируем получение данных из хранилища
	const elements = useCircuitStore(state => state.elements)
	const nodes = useCircuitStore(state => state.nodes)

	// Переключение состояния сворачивания
	const toggleCollapse = () => {
		setCollapsed(!collapsed)
	}

	// Получаем имя узла по ID - базовая функция без зависимостей от хранилища
	const getNodeNameById = (nodeId: string): string => {
		const node = nodes.find(n => n.id === nodeId)
		return node ? node.name : '-'
	}

	// Рендер детальной вкладки с информацией о соединениях
	const renderDetailedTab = () => (
		<>
			{elements.length === 0 ? (
				<EmptyState>Нет элементов для отображения</EmptyState>
			) : (
				elements.map(element => (
					<ElementItem key={element.id}>
						<ElementName>
							{element.name} ({element.type})
						</ElementName>
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

	return (
		<PanelContainer collapsed={collapsed}>
			<TitleContainer>
				<Title>Соединения элементов</Title>
				<CollapseButton onClick={toggleCollapse}>
					{collapsed ? '▲' : '▼'}
				</CollapseButton>
			</TitleContainer>

			{!collapsed && (
				<>
					<TabsContainer>
						<Tab
							active={activeTab === 'detailed'}
							onClick={() => setActiveTab('detailed')}
						>
							Детальные
						</Tab>
						<Tab
							active={activeTab === 'simple'}
							onClick={() => setActiveTab('simple')}
						>
							Простые
						</Tab>
					</TabsContainer>

					{activeTab === 'detailed' ? renderDetailedTab() : renderSimpleTab()}
				</>
			)}
		</PanelContainer>
	)
}

export default ConnectionsPanel
