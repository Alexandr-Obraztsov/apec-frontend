import React from 'react'
import styled from 'styled-components'
import { ElementType } from '../types'
import { useCircuitStore } from '../store/circuitStore'

// Label mapping
const ELEMENT_LABELS: Record<ElementType, string> = {
	wire: 'Провод',
	resistor: 'Резистор (R)',
	capacitor: 'Конденсатор (C)',
	inductor: 'Катушка (L)',
	voltage: 'Источник напряжения (V)',
	current: 'Источник тока (I)',
	switch: 'Ключ (SW)',
}

const ToolboxContainer = styled.div`
	position: fixed;
	left: 20px;
	top: 80px;
	width: 220px;
	background-color: var(--surface-color);
	border-radius: var(--radius-md);
	box-shadow: var(--shadow-md);
	padding: 20px;
	z-index: 100;
	display: flex;
	flex-direction: column;
	gap: 10px;
`

const ToolboxHeader = styled.div`
	margin-bottom: 12px;
	border-bottom: 1px solid var(--border-color);
	padding-bottom: 12px;
`

const Title = styled.h3`
	margin: 0;
	color: var(--text-primary);
	font-size: 1.1rem;
	font-weight: 600;
`

const SubTitle = styled.p`
	margin: 5px 0 0 0;
	color: var(--text-secondary);
	font-size: 0.85rem;
`

const ToolGrid = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 10px;
`

const ToolItem = styled.div<{ $isActive: boolean }>`
	padding: 14px 10px;
	background-color: ${props =>
		props.$isActive ? 'var(--primary-light)' : 'var(--surface-color)'};
	border: 1px solid
		${props =>
			props.$isActive ? 'var(--primary-color)' : 'var(--border-color)'};
	border-radius: var(--radius-sm);
	cursor: pointer;
	user-select: none;
	transition: var(--transition);
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	color: ${props =>
		props.$isActive ? 'var(--primary-color)' : 'var(--text-primary)'};
	box-shadow: ${props =>
		props.$isActive ? '0 0 0 1px var(--primary-color)' : 'none'};

	&:hover {
		background-color: ${props =>
			props.$isActive ? 'var(--primary-light)' : 'var(--bg-color)'};
		border-color: ${props =>
			props.$isActive ? 'var(--primary-color)' : 'var(--primary-light)'};
	}
`

const IconWrapper = styled.div`
	width: 36px;
	height: 36px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 8px;
`

const Label = styled.span`
	font-size: 0.8rem;
	font-weight: 500;
	text-align: center;
`

const ToolTip = styled.div`
	font-size: 0.75rem;
	color: var(--text-secondary);
	margin-top: 8px;
	text-align: center;
	padding: 10px;
	background-color: var(--bg-color);
	border-radius: var(--radius-sm);
`

// Компоненты иконок для элементов
const WireIcon = () => (
	<svg
		width='28'
		height='28'
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
	>
		<path
			d='M2 12H22'
			stroke='currentColor'
			strokeWidth='2'
			strokeLinecap='round'
		/>
	</svg>
)

const ResistorIcon = () => (
	<svg
		width='28'
		height='28'
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
	>
		<path
			d='M2 12H5M19 12H22M5 12V9H19V15H5V12Z'
			stroke='currentColor'
			strokeWidth='2'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
	</svg>
)

const CapacitorIcon = () => (
	<svg
		width='28'
		height='28'
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
	>
		<path
			d='M2 12H10M14 12H22M10 5V19M14 5V19'
			stroke='currentColor'
			strokeWidth='2'
			strokeLinecap='round'
		/>
	</svg>
)

const InductorIcon = () => (
	<svg
		width='28'
		height='28'
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
	>
		<path
			d='M2 12H4M20 12H22M4 12C4 12 6 8 10 8S16 12 16 12'
			stroke='currentColor'
			strokeWidth='2'
			strokeLinecap='round'
		/>
		<path
			d='M10 8C14 8 17 12 17 12C17 12 14 16 10 16C6 16 4 12 4 12'
			stroke='currentColor'
			strokeWidth='2'
			strokeLinecap='round'
		/>
	</svg>
)

const VoltageIcon = () => (
	<svg
		width='28'
		height='28'
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
	>
		<circle cx='12' cy='12' r='7' stroke='currentColor' strokeWidth='2' />
		<path
			d='M8 12H16M12 8V16'
			stroke='currentColor'
			strokeWidth='2'
			strokeLinecap='round'
		/>
	</svg>
)

const CurrentIcon = () => (
	<svg
		width='28'
		height='28'
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
	>
		<circle cx='12' cy='12' r='7' stroke='currentColor' strokeWidth='2' />
		<path
			d='M8 12H16'
			stroke='currentColor'
			strokeWidth='2'
			strokeLinecap='round'
		/>
		<path
			d='M14 10L16 12L14 14'
			stroke='currentColor'
			strokeWidth='2'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
	</svg>
)

const SwitchIcon = () => (
	<svg
		width='28'
		height='28'
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
	>
		<path
			d='M2 12H5'
			stroke='currentColor'
			strokeWidth='2'
			strokeLinecap='round'
		/>
		<path
			d='M19 12H22'
			stroke='currentColor'
			strokeWidth='2'
			strokeLinecap='round'
		/>
		<circle
			cx='5'
			cy='12'
			r='2.5'
			stroke='currentColor'
			strokeWidth='2'
			fill='white'
		/>
		<circle
			cx='19'
			cy='12'
			r='2.5'
			stroke='currentColor'
			strokeWidth='2'
			fill='white'
		/>
		<path
			d='M7 12L18 7'
			stroke='currentColor'
			strokeWidth='2.5'
			strokeLinecap='round'
		/>
	</svg>
)

// Карта иконок для типов элементов
const ELEMENT_ICONS: Record<ElementType, React.ReactNode> = {
	wire: <WireIcon />,
	resistor: <ResistorIcon />,
	capacitor: <CapacitorIcon />,
	inductor: <InductorIcon />,
	voltage: <VoltageIcon />,
	current: <CurrentIcon />,
	switch: <SwitchIcon />,
}

interface ToolItemProps {
	type: ElementType
	label: string
	isActive: boolean
	onClick: (type: ElementType) => void
}

const ToolboxItem: React.FC<ToolItemProps> = ({
	type,
	label,
	isActive,
	onClick,
}) => {
	return (
		<ToolItem $isActive={isActive} onClick={() => onClick(type)}>
			<IconWrapper>{ELEMENT_ICONS[type]}</IconWrapper>
			<Label>{label}</Label>
		</ToolItem>
	)
}

const Toolbox: React.FC = () => {
	const placementMode = useCircuitStore(state => state.placementMode)
	const startPlacement = useCircuitStore(state => state.startPlacement)
	const cancelPlacement = useCircuitStore(state => state.cancelPlacement)

	const handleItemClick = (type: ElementType) => {
		if (placementMode.active && placementMode.elementType === type) {
			// Если выбран тот же элемент, отменяем размещение
			cancelPlacement()
		} else {
			// Иначе начинаем размещение нового элемента
			startPlacement(type)
		}
	}

	return (
		<ToolboxContainer>
			<ToolboxHeader>
				<Title>Элементы схемы</Title>
				<SubTitle>Выберите элемент для размещения</SubTitle>
			</ToolboxHeader>

			<ToolGrid>
				<ToolboxItem
					type='wire'
					label={ELEMENT_LABELS.wire}
					isActive={
						placementMode.active && placementMode.elementType === 'wire'
					}
					onClick={handleItemClick}
				/>
				<ToolboxItem
					type='resistor'
					label={ELEMENT_LABELS.resistor}
					isActive={
						placementMode.active && placementMode.elementType === 'resistor'
					}
					onClick={handleItemClick}
				/>
				<ToolboxItem
					type='capacitor'
					label={ELEMENT_LABELS.capacitor}
					isActive={
						placementMode.active && placementMode.elementType === 'capacitor'
					}
					onClick={handleItemClick}
				/>
				<ToolboxItem
					type='inductor'
					label={ELEMENT_LABELS.inductor}
					isActive={
						placementMode.active && placementMode.elementType === 'inductor'
					}
					onClick={handleItemClick}
				/>
				<ToolboxItem
					type='voltage'
					label={ELEMENT_LABELS.voltage}
					isActive={
						placementMode.active && placementMode.elementType === 'voltage'
					}
					onClick={handleItemClick}
				/>
				<ToolboxItem
					type='current'
					label={ELEMENT_LABELS.current}
					isActive={
						placementMode.active && placementMode.elementType === 'current'
					}
					onClick={handleItemClick}
				/>
				<ToolboxItem
					type='switch'
					label={ELEMENT_LABELS.switch}
					isActive={
						placementMode.active && placementMode.elementType === 'switch'
					}
					onClick={handleItemClick}
				/>
			</ToolGrid>

			{placementMode.active && (
				<ToolTip>
					Поместите курсор над узлом, чтобы начать соединение. Затем выберите
					второй узел для завершения.
				</ToolTip>
			)}
		</ToolboxContainer>
	)
}

export default Toolbox
