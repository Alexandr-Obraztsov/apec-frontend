import React from 'react'
import styled from 'styled-components'

const Navbar = styled.header`
	display: flex;
	align-items: center;
	background-color: var(--surface-color);
	height: 60px;
	padding: 0 16px;
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

const TabButton = styled.button<{ isActive: boolean }>`
	padding: 6px 12px;
	font-size: 0.9rem;
	font-weight: 500;
	border: none;
	border-radius: 0;
	background-color: transparent;
	cursor: pointer;
	color: ${props =>
		props.isActive ? 'var(--primary-color)' : 'var(--text-secondary)'};
	border-bottom: 2px solid
		${props => (props.isActive ? 'var(--primary-color)' : 'transparent')};
	transition: var(--transition);
	margin-right: 8px;
	height: 100%;

	&:hover {
		color: var(--primary-color);
	}

	&:focus {
		outline: none;
	}
`

interface HeaderProps {
	activeTab: 'circuit' | 'tasks'
	onTabChange: (tab: 'circuit' | 'tasks') => void
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

			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					height: '100%',
					marginLeft: '24px',
				}}
			>
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
			</div>
		</Navbar>
	)
}

export default Header
