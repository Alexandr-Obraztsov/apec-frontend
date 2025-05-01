import styled from 'styled-components'
import CircuitBoard from './components/CircuitBoard'
import Toolbox from './components/Toolbox'
import PropertiesPanel from './components/PropertiesPanel'
import ConnectionsPanel from './components/ConnectionsPanel'

const AppContainer = styled.div`
	display: flex;
	flex-direction: column;
	width: 100vw;
	height: 100vh;
	overflow: hidden;
`

const Navbar = styled.header`
	display: flex;
	align-items: center;
	background-color: var(--surface-color);
	height: 60px;
	padding: 0 24px;
	box-shadow: var(--shadow-sm);
	z-index: 100;
`

const Logo = styled.div`
	font-size: 1.4rem;
	font-weight: 700;
	color: var(--primary-color);
	letter-spacing: -0.5px;
	display: flex;
	align-items: center;

	span {
		color: var(--text-primary);
	}
`

const LogoIcon = styled.div`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	margin-right: 12px;
	font-size: 24px;
	color: var(--primary-color);
`

const MainContent = styled.main`
	display: flex;
	flex: 1;
	position: relative;
	overflow: hidden;
`

function App() {
	return (
		<AppContainer>
			<Navbar>
				<Logo>
					<LogoIcon>
						<svg
							width='24'
							height='24'
							viewBox='0 0 24 24'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path
								d='M3 11H11V3H13V11H21V13H13V21H11V13H3V11Z'
								fill='currentColor'
							/>
							<circle
								cx='12'
								cy='12'
								r='9'
								stroke='currentColor'
								strokeWidth='2'
								fill='none'
							/>
						</svg>
					</LogoIcon>
					Circuit<span>Designer</span>
				</Logo>
			</Navbar>
			<MainContent>
				<CircuitBoard />
				<Toolbox />
				<PropertiesPanel />
				<ConnectionsPanel />
			</MainContent>
		</AppContainer>
	)
}

export default App
