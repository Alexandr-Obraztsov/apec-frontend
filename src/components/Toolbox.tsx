import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { ElementType, Node as CircuitNode } from '../types'
import { useCircuitStore } from '../store/circuitStore'
import GenerateChainModal, { ChainOptions } from './GenerateChainModal'
import CircuitSolutionModal from './CircuitSolutionModal'
import {
	circuitApi,
	CircuitSolutionResult,
	formatCircuitToLCapy,
} from '../services/api'
import SaveCircuitModal from './SaveCircuitModal'

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
	background: rgba(255, 255, 255, 0.95);
	backdrop-filter: blur(20px);
	border-right: 1px solid rgba(102, 126, 234, 0.2);
	box-shadow: 4px 0 32px rgba(102, 126, 234, 0.15);
	padding: 24px;
	display: flex;
	flex-direction: column;
	overflow-y: auto;
	flex-shrink: 0;
	position: relative;
`

const ToolboxHeader = styled.div`
	margin-bottom: 24px;
	padding: 20px;
	background: linear-gradient(135deg, #f8fafc, #f1f5f9);
	border: 1px solid #e2e8f0;
	border-radius: 16px;
	box-shadow: 0 8px 32px rgba(102, 126, 234, 0.1);
	position: relative;
	overflow: hidden;

	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: linear-gradient(90deg, #667eea, #764ba2);
	}
`

const Title = styled.h3`
	margin: 0;
	font-size: 1.4rem;
	font-weight: 700;
	background: linear-gradient(135deg, #667eea, #764ba2);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
	text-shadow: 0 2px 4px rgba(102, 126, 234, 0.2);
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
	margin: 0 0 16px 0;
	font-size: 1.1rem;
	font-weight: 600;
	display: flex;
	align-items: center;
	gap: 8px;
	color: var(--text-primary);
`

const ErrorsContainer = styled.div`
	background: linear-gradient(135deg, #fef2f2, #fee2e2);
	border: 1px solid #fecaca;
	border-radius: 12px;
	padding: 16px;
	margin-bottom: 20px;
	box-shadow: 0 8px 32px rgba(239, 68, 68, 0.1);
	position: relative;
	overflow: hidden;

	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: linear-gradient(90deg, #ef4444, #dc2626);
	}
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
	background: linear-gradient(135deg, #f0fdf4, #dcfce7);
	border: 1px solid #bbf7d0;
	border-radius: 12px;
	padding: 16px;
	margin-bottom: 20px;
	display: flex;
	align-items: center;
	gap: 10px;
	color: #059669;
	font-weight: 600;
	font-size: 0.95rem;
	box-shadow: 0 8px 32px rgba(34, 197, 94, 0.1);
	position: relative;
	overflow: hidden;

	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: linear-gradient(90deg, #10b981, #059669);
	}
`

const ToolGrid = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 12px;
`

const BaseButton = styled.button`
	width: 100%;
	padding: 14px 16px;
	border: none;
	border-radius: 12px;
	font-weight: 600;
	font-size: 0.9rem;
	cursor: pointer;
	transition: all 0.3s ease;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	position: relative;
	overflow: hidden;
	backdrop-filter: blur(20px);
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

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

	&:hover::before {
		left: 100%;
	}

	&:disabled {
		opacity: 0.6;
		cursor: not-allowed;

		&:hover::before {
			left: -100%;
		}
	}
`

const GenerateButton = styled(BaseButton)`
	background: linear-gradient(135deg, #3b82f6, #1e40af);
	color: white;
	border: 1px solid rgba(59, 130, 246, 0.3);

	&:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 12px 40px rgba(59, 130, 246, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
	}

	&:active:not(:disabled) {
		transform: translateY(0);
	}
`

const SolveButton = styled(BaseButton)`
	background: linear-gradient(135deg, #10b981, #059669);
	color: white;
	border: 1px solid rgba(16, 185, 129, 0.3);
	margin-top: 12px;

	&:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 12px 40px rgba(16, 185, 129, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
	}

	&:active:not(:disabled) {
		transform: translateY(0);
	}
`

const CopyButton = styled(BaseButton)`
	background: linear-gradient(135deg, #8b5cf6, #7c3aed);
	color: white;
	border: 1px solid rgba(139, 92, 246, 0.3);
	margin-top: 12px;

	&:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 12px 40px rgba(139, 92, 246, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
	}

	&:active:not(:disabled) {
		transform: translateY(0);
	}
`

const ToolItem = styled.div<{ $isActive: boolean }>`
	padding: 16px 12px;
	background: ${props =>
		props.$isActive
			? 'linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(59, 130, 246, 0.2))'
			: 'rgba(255, 255, 255, 0.1)'};
	backdrop-filter: blur(20px);
	border: 1px solid
		${props =>
			props.$isActive ? 'rgba(124, 58, 237, 0.4)' : 'rgba(124, 58, 237, 0.2)'};
	border-radius: 12px;
	cursor: pointer;
	transition: all 0.3s ease;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8px;
	text-align: center;
	position: relative;
	overflow: hidden;
	box-shadow: 0 4px 16px rgba(124, 58, 237, 0.1),
		inset 0 1px 0 rgba(255, 255, 255, 0.1);

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
			rgba(255, 255, 255, 0.1),
			transparent
		);
		transition: left 0.5s ease;
	}

	&:hover {
		transform: translateY(-2px);
		border-color: rgba(124, 58, 237, 0.4);
		box-shadow: 0 8px 32px rgba(124, 58, 237, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);

		&::before {
			left: 100%;
		}
	}

	&:active {
		transform: translateY(0);
	}
`

const ToolIcon = styled.div`
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #7c3aed;
	font-size: 1.2rem;
`

const ToolLabel = styled.span`
	font-size: 0.8rem;
	font-weight: 500;
	color: rgba(124, 58, 237, 0.9);
	line-height: 1.2;
`

const ToolTip = styled.div`
	margin-top: 12px;
	padding: 12px;
	background: rgba(59, 130, 246, 0.1);
	backdrop-filter: blur(20px);
	border: 1px solid rgba(59, 130, 246, 0.2);
	border-radius: 8px;
	font-size: 0.8rem;
	color: rgba(59, 130, 246, 0.9);
	line-height: 1.4;
	box-shadow: 0 4px 16px rgba(59, 130, 246, 0.1),
		inset 0 1px 0 rgba(255, 255, 255, 0.1);
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
			<ToolIcon>{ELEMENT_ICONS[type]}</ToolIcon>
			<ToolLabel>{label}</ToolLabel>
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

	// Состояние для модального окна сохранения
	const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
	const [circuitImage, setCircuitImage] = useState<string | undefined>(
		undefined
	)

	// Функция для сохранения цепи
	const handleSaveCircuit = async () => {
		try {
			// Преобразуем схему в строковый формат
			const circuit = formatCircuitToLCapy(nodes, elements)

			// Получаем изображение схемы с сервера
			const response = await circuitApi.generateCircuitImage({
				circuit_string: circuit.circuitString,
			})

			setCircuitImage(response.image_base64)
			setIsSaveModalOpen(true)
		} catch (error) {
			console.error('Ошибка при создании изображения схемы:', error)
			// Открываем модальное окно даже без изображения
			setCircuitImage(undefined)
			setIsSaveModalOpen(true)
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
					onClick={handleSaveCircuit}
					disabled={elements.length === 0}
				>
					Сохранить цепь
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

			<SaveCircuitModal
				isOpen={isSaveModalOpen}
				onClose={() => setIsSaveModalOpen(false)}
				nodes={nodes}
				elements={elements}
				circuitImage={circuitImage}
			/>
		</ToolboxContainer>
	)
}

export default Toolbox
