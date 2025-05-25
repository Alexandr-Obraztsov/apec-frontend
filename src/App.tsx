import { memo, useState } from 'react'
import styled from 'styled-components'
import CircuitBoard from './components/CircuitBoard'
import Toolbox from './components/Toolbox'
import PropertiesPanel from './components/PropertiesPanel'
import ConnectionsPanel from './components/ConnectionsPanel'
import CircuitSolver from './components/CircuitSolver'
import Header from './components/Header'
import TaskGenerator from './components/TaskGenerator'

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
	background-color: white;
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
				{activeTab === 'tasks' && <TaskGenerator />}
			</MainContent>
		</AppContainer>
	)
}

export default App
