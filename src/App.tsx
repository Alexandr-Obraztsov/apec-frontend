import { memo, useState } from 'react'
import styled from 'styled-components'
import CircuitBoard from './components/CircuitBoard'
import Toolbox from './components/Toolbox'
import PropertiesPanel from './components/PropertiesPanel'
import ConnectionsPanel from './components/ConnectionsPanel'
import CircuitSolver from './components/CircuitSolver'
import Header from './components/Header'

const AppContainer = styled.div`
	display: flex;
	flex-direction: column;
	width: 100vw;
	height: 100vh;
	overflow: hidden;
`

const MainContent = styled.main`
	display: flex;
	flex: 1;
	position: relative;
	overflow: hidden;
`

const TabContent = styled.div`
	padding: 24px;
	flex: 1;
	overflow-y: auto;
	display: flex;
	flex-direction: column;
`

// Мемоизированные компоненты
const MemoizedToolbox = memo(Toolbox)
const MemoizedPropertiesPanel = memo(PropertiesPanel)
const MemoizedConnectionsPanel = memo(ConnectionsPanel)

function App() {
	const [activeTab, setActiveTab] = useState<'circuit' | 'tasks'>('circuit')

	return (
		<AppContainer>
			<Header activeTab={activeTab} onTabChange={setActiveTab} />
			<MainContent>
				{activeTab === 'circuit' && (
					<>
						<CircuitBoard />
						<MemoizedToolbox />
						<MemoizedPropertiesPanel />
						<MemoizedConnectionsPanel />
						<CircuitSolver />
					</>
				)}
				{activeTab === 'tasks' && (
					<TabContent>
						<h2>Генерация Задач</h2>
						<p>
							Здесь будет размещен интерфейс для генерации и управления
							задачами.
						</p>
					</TabContent>
				)}
			</MainContent>
		</AppContainer>
	)
}

export default App
