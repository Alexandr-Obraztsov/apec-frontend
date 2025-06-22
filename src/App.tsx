import { memo, useState } from 'react'
import styled from 'styled-components'
import CircuitBoard from './components/CircuitBoard'
import Toolbox from './components/Toolbox'
import PropertiesPanel from './components/PropertiesPanel'
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

const CircuitSection = styled.div`
	display: flex;
	flex: 1;
	height: 100%;
`

// Мемоизированные компоненты
const MemoizedToolbox = memo(Toolbox)
const MemoizedPropertiesPanel = memo(PropertiesPanel)

function App() {
	const [activeTab, setActiveTab] = useState<'circuit' | 'tasks'>('circuit')

	return (
		<AppContainer>
			<Header activeTab={activeTab} onTabChange={setActiveTab} />
			<MainContent>
				{activeTab === 'circuit' && (
					<>
						<CircuitSection>
							<MemoizedToolbox />
							<CircuitBoard />
						</CircuitSection>
						<MemoizedPropertiesPanel />
					</>
				)}
				{activeTab === 'tasks' && <TaskGenerator />}
			</MainContent>
		</AppContainer>
	)
}

export default App
