import React from 'react'
import styled from 'styled-components'

const Navbar = styled.header`
	display: flex;
	align-items: center;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	backdrop-filter: blur(20px);
	height: 70px;
	padding: 0 32px;
	box-shadow: 0 4px 32px rgba(102, 126, 234, 0.2),
		inset 0 1px 0 rgba(255, 255, 255, 0.2);
	z-index: 100;
	border-bottom: 1px solid rgba(255, 255, 255, 0.2);
	position: relative;

	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: radial-gradient(
				circle at 20% 50%,
				rgba(255, 255, 255, 0.1) 0%,
				transparent 50%
			),
			radial-gradient(
				circle at 80% 50%,
				rgba(255, 255, 255, 0.1) 0%,
				transparent 50%
			);
		pointer-events: none;
		z-index: 0;
	}

	> * {
		position: relative;
		z-index: 1;
	}
`

const Logo = styled.div`
	font-size: 1.8rem;
	font-weight: 800;
	background: linear-gradient(45deg, #ffffff, #e0e7ff);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
	letter-spacing: -0.5px;
	display: flex;
	align-items: center;
	text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);

	span {
		background: linear-gradient(45deg, #f0f9ff, #dbeafe);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}
`

const LogoIcon = styled.div`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	margin-right: 16px;
	font-size: 28px;
	color: white;
	background: rgba(255, 255, 255, 0.2);
	backdrop-filter: blur(20px);
	border: 1px solid rgba(255, 255, 255, 0.3);
	border-radius: 12px;
	width: 48px;
	height: 48px;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2),
		inset 0 1px 0 rgba(255, 255, 255, 0.2);
	transition: all 0.3s ease;

	&:hover {
		transform: translateY(-2px);
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.3);
	}
`

const TabsContainer = styled.div`
	display: flex;
	align-items: center;
	height: 100%;
	margin-left: 48px;
	gap: 8px;
`

const TabButton = styled.button<{ isActive: boolean }>`
	padding: 12px 24px;
	font-size: 0.95rem;
	font-weight: 600;
	border: none;
	border-radius: 12px;
	background: ${props =>
		props.isActive ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)'};
	backdrop-filter: blur(20px);
	border: 1px solid
		${props =>
			props.isActive ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.2)'};
	cursor: pointer;
	color: ${props => (props.isActive ? 'white' : 'rgba(255, 255, 255, 0.8)')};
	transition: all 0.3s ease;
	height: 44px;
	position: relative;
	overflow: hidden;
	box-shadow: ${props =>
		props.isActive
			? '0 8px 32px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
			: '0 4px 16px rgba(0, 0, 0, 0.1)'};

	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			90deg,
			transparent,
			rgba(255, 255, 255, 0.2),
			transparent
		);
		transition: left 0.5s ease;
	}

	&:hover {
		background: ${props =>
			props.isActive
				? 'rgba(255, 255, 255, 0.3)'
				: 'rgba(255, 255, 255, 0.15)'};
		backdrop-filter: blur(20px);
		border-color: rgba(255, 255, 255, 0.5);
		color: white;
		transform: translateY(-2px);
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.3);

		&::before {
			left: 100%;
		}
	}

	&:active {
		transform: translateY(0);
	}

	&:focus {
		outline: none;
	}
`

interface HeaderProps {
	activeTab: 'circuit' | 'tasks' | 'topologies'
	onTabChange: (tab: 'circuit' | 'tasks' | 'topologies') => void
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
	return (
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

			<TabsContainer>
				<TabButton
					isActive={activeTab === 'circuit'}
					onClick={() => onTabChange('circuit')}
				>
					Работа с цепью
				</TabButton>
				<TabButton
					isActive={activeTab === 'tasks'}
					onClick={() => onTabChange('tasks')}
				>
					Генерация задач
				</TabButton>
				<TabButton
					isActive={activeTab === 'topologies'}
					onClick={() => onTabChange('topologies')}
				>
					Топологии
				</TabButton>
			</TabsContainer>
		</Navbar>
	)
}

export default Header
