import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { ElementType, Node as CircuitNode } from '../types'
import { useCircuitStore } from '../store/circuitStore'
import GenerateChainModal, { ChainOptions } from './GenerateChainModal'
import CircuitSolutionModal from './CircuitSolutionModal'
import { circuitApi, CircuitSolutionResult } from '../services/api'

// Label mapping
const ELEMENT_LABELS: Record<ElementType, string> = {
	wire: 'Провод',
	resistor: 'Резистор (R)',
	capacitor: 'Конденсатор (C)',
	inductor: 'Катушка (L)',
	voltage: 'Источник напряжения (V)',

	switch: 'Ключ (SW)',
}

const ToolboxContainer = styled.div`
	width: 280px;
	height: 100%;
	background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
	border-right: 1px solid var(--border-color);
	box-shadow: 4px 0 20px rgba(0, 0, 0, 0.08);
	padding: 20px;
	display: flex;
	flex-direction: column;
	overflow-y: auto;
	flex-shrink: 0;
`

const ToolboxHeader = styled.div`
	margin-bottom: 20px;
	padding-bottom: 16px;
	border-bottom: 2px solid var(--border-color);
`

const Title = styled.h3`
	margin: 0;
	color: var(--text-primary);
	font-size: 1.3rem;
	font-weight: 700;
	background: linear-gradient(135deg, #1e40af, #3b82f6);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
`

const SubTitle = styled.p`
	margin: 8px 0 0 0;
	color: var(--text-secondary);
	font-size: 0.9rem;
	font-weight: 500;
`

const Section = styled.div`
	margin-bottom: 24px;
`

const SectionTitle = styled.h4`
	margin: 0 0 12px 0;
	color: var(--text-primary);
	font-size: 1rem;
	font-weight: 600;
	display: flex;
	align-items: center;
	gap: 8px;
`

const ErrorsContainer = styled.div`
	background-color: rgba(239, 68, 68, 0.1);
	border: 1px solid rgba(239, 68, 68, 0.3);
	border-radius: 8px;
	padding: 16px;
	margin-bottom: 20px;
`

const ErrorTitle = styled.div`
	font-weight: 600;
	font-size: 0.95rem;
	margin-bottom: 12px;
	display: flex;
	align-items: center;
	gap: 8px;
	color: #dc2626;
`

const ErrorList = styled.ul`
	margin: 0;
	padding-left: 16px;
	font-size: 0.85rem;
	line-height: 1.4;
	color: #991b1b;
`

const ErrorItem = styled.li`
	margin-bottom: 6px;
	font-weight: 500;
`

const SuccessContainer = styled.div`
	background-color: rgba(34, 197, 94, 0.1);
	border: 1px solid rgba(34, 197, 94, 0.3);
	border-radius: 8px;
	padding: 16px;
	margin-bottom: 20px;
	display: flex;
	align-items: center;
	gap: 10px;
	color: #059669;
	font-weight: 600;
	font-size: 0.95rem;
`

const ToolGrid = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 10px;
`

const GenerateButton = styled.button`
	width: 100%;
	padding: 12px;
	background-color: #0066cc;
	color: white;
	border: none;
	border-radius: var(--radius-sm);
	font-weight: 500;
	cursor: pointer;
	transition: background-color 0.2s;
	display: flex;
	align-items: center;
	justify-content: center;

	&:hover {
		background-color: #0052a3;
	}
`

const SolveButton = styled.button`
	width: 100%;
	padding: 12px;
	background-color: #008000;
	color: white;
	border: none;
	border-radius: var(--radius-sm);
	font-weight: 500;
	cursor: pointer;
	transition: background-color 0.2s;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-top: 10px;

	&:hover {
		background-color: #006400;
	}

	&:disabled {
		background-color: #9dbb9d;
		cursor: not-allowed;
	}
`

const CopyButton = styled.button`
	width: 100%;
	padding: 12px;
	background-color: #6366f1;
	color: white;
	border: none;
	border-radius: var(--radius-sm);
	font-weight: 500;
	cursor: pointer;
	transition: background-color 0.2s;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-top: 10px;

	&:hover {
		background-color: #4f46e5;
	}

	&:disabled {
		background-color: #a5b4fc;
		cursor: not-allowed;
	}
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
	const generateChain = useCircuitStore(state => state.generateChain)
	const nodes = useCircuitStore(state => state.nodes)
	const elements = useCircuitStore(state => state.elements)

	const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)
	const [isSolveModalOpen, setIsSolveModalOpen] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [solutionEquations, setSolutionEquations] =
		useState<CircuitSolutionResult | null>(null)
	const [unconnectedNodes, setUnconnectedNodes] = useState<CircuitNode[]>([])

	// Проверяем узлы на наличие соединений
	useEffect(() => {
		const badNodes = nodes.filter(node => node.connectedElements.length < 2)
		setUnconnectedNodes(badNodes)
	}, [nodes])

	// Проверяем, можно ли решить цепь
	const canSolveCircuit = nodes.length > 0 && unconnectedNodes.length === 0

	const handleItemClick = (type: ElementType) => {
		if (placementMode.active && placementMode.elementType === type) {
			cancelPlacement()
		} else {
			startPlacement(type)
		}
	}

	const handleGenerateChain = (options: ChainOptions) => {
		generateChain(options)
		setIsGenerateModalOpen(false)
	}

	const handleSolveCircuit = async () => {
		setError(null)
		setSolutionEquations(null)
		setIsLoading(true)
		setIsSolveModalOpen(true)

		try {
			const response = await circuitApi.solveCircuit({
				nodes: nodes,
				elements: elements,
			})

			if (response.status === 'success' && response.solution) {
				setSolutionEquations(response.solution)
			}
		} catch {
			setError('Ошибка при решении цепи')
		} finally {
			setIsLoading(false)
		}
	}

	const handleCloseSolveModal = () => {
		setIsSolveModalOpen(false)
		if (isLoading) {
			setIsLoading(false)
		}
	}

	// Функция для копирования цепи без значений
	const handleCopyCircuit = async () => {
		if (elements.length === 0) {
			return // Нет элементов для копирования
		}

		try {
			// Создаем копию цепи без значений элементов
			const circuitWithoutValues = elements
				.map(element => {
					const startNode = nodes.find(n => n.id === element.startNodeId)
					const endNode = nodes.find(n => n.id === element.endNodeId)

					if (!startNode || !endNode) return ''

					if (element.type === 'switch') {
						return `${element.name} ${startNode.name} ${endNode.name} ${
							element.isOpen ? 'no' : 'nc'
						}; ${element.direction}`
					} else if (element.type === 'wire') {
						return `W ${startNode.name} ${endNode.name}; ${element.direction}`
					} else {
						return `${element.name} ${startNode.name} ${endNode.name}; ${element.direction}`
					}
				})
				.filter(line => line !== '')
				.join('\n')

			// Копируем в буфер обмена
			await navigator.clipboard.writeText(circuitWithoutValues)

			console.log('Цепь скопирована в буфер обмена:', circuitWithoutValues)
		} catch (error) {
			console.error('Ошибка при копировании цепи:', error)
		}
	}

	// Компонент для отображения статуса цепи
	const CircuitStatus = () => {
		if (nodes.length === 0) {
			return null
		}

		if (unconnectedNodes.length > 0) {
			return (
				<ErrorsContainer>
					<ErrorTitle>
						<span>⚠️</span>
						<span>Неполные соединения</span>
					</ErrorTitle>
					{unconnectedNodes.length < 5 ? (
						<ErrorList>
							{unconnectedNodes.map(node => (
								<ErrorItem key={node.id}>
									Узел {node.name} имеет только {node.connectedElements.length}{' '}
									соединение{node.connectedElements.length === 1 ? '' : 'я'}
								</ErrorItem>
							))}
						</ErrorList>
					) : (
						<ErrorList>
							<ErrorItem>
								Узлы {unconnectedNodes.map(node => node.name).join(', ')} имеют
								только одно соединение
							</ErrorItem>
						</ErrorList>
					)}
				</ErrorsContainer>
			)
		}

		return (
			<SuccessContainer>
				<span>✓</span>
				<span>Схема корректна</span>
			</SuccessContainer>
		)
	}

	return (
		<ToolboxContainer>
			<ToolboxHeader>
				<Title>Элементы схемы</Title>
				<SubTitle>Создание и анализ электрических цепей</SubTitle>
			</ToolboxHeader>

			<CircuitStatus />

			<Section>
				<SectionTitle>
					<span>🔧</span>
					Компоненты
				</SectionTitle>
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
			</Section>

			<Section>
				<SectionTitle>
					<span>⚡</span>
					Действия
				</SectionTitle>

				<GenerateButton onClick={() => setIsGenerateModalOpen(true)}>
					Сгенерировать цепь
				</GenerateButton>

				<SolveButton onClick={handleSolveCircuit} disabled={!canSolveCircuit}>
					Решить цепь
				</SolveButton>

				<CopyButton
					onClick={handleCopyCircuit}
					disabled={elements.length === 0}
				>
					Копировать цепь
				</CopyButton>
			</Section>

			<GenerateChainModal
				isOpen={isGenerateModalOpen}
				onClose={() => setIsGenerateModalOpen(false)}
				onGenerate={handleGenerateChain}
			/>

			<CircuitSolutionModal
				isOpen={isSolveModalOpen}
				onClose={handleCloseSolveModal}
				isLoading={isLoading}
				error={error}
				solutionEquations={solutionEquations}
			/>
		</ToolboxContainer>
	)
}

export default Toolbox
