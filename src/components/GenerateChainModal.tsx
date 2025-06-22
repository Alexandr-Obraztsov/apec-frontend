import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import {
	circuitApi,
	RootType,
	DifficultyLevel,
	Topology,
} from '../services/api'
import { createPortal } from 'react-dom'

const ModalBackground = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 10000;
`

const ModalContainer = styled.div`
	background-color: var(--surface-color);
	border-radius: var(--radius-md);
	box-shadow: var(--shadow-lg);
	width: 600px;
	max-width: 90%;
	max-height: 90vh;
	padding: 24px;
	margin-bottom: 8px;
	overflow-y: auto;
`

const ModalHeader = styled.div`
	margin-bottom: 20px;
`

const Title = styled.h3`
	margin: 0;
	color: var(--text-primary);
	font-size: 1.2rem;
	font-weight: 600;
`

const Content = styled.div`
	margin-bottom: 24px;
`

const OptionGroup = styled.div`
	margin-bottom: 16px;
`

const Label = styled.div`
	font-size: 0.9rem;
	font-weight: 500;
	color: var(--text-primary);
	margin-bottom: 8px;
`

const RadioGroup = styled.div`
	display: flex;
	gap: 16px;
	margin-bottom: 12px;
`

const RadioButton = styled.label`
	display: flex;
	align-items: center;
	gap: 8px;
	cursor: pointer;

	input {
		cursor: pointer;
	}

	span {
		font-size: 0.9rem;
		color: var(--text-primary);
	}
`

const ButtonGroup = styled.div`
	display: flex;
	justify-content: flex-end;
	gap: 12px;
`

const Button = styled.button`
	padding: 8px 16px;
	border-radius: var(--radius-sm);
	font-size: 0.9rem;
	font-weight: 500;
	cursor: pointer;
	transition: var(--transition);

	&:focus {
		outline: none;
	}

	&:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}
`

const CancelButton = styled(Button)`
	background-color: transparent;
	border: 1px solid var(--border-color);
	color: var(--text-secondary);

	&:hover:not(:disabled) {
		background-color: var(--bg-color);
		border-color: var(--text-secondary);
	}
`

const GenerateButton = styled(Button)`
	background-color: var(--primary-color);
	border: 1px solid var(--primary-color);
	color: white;
	position: relative;

	&:hover:not(:disabled) {
		background-color: var(--primary-dark);
	}
`

const LoadingSpinner = styled.div`
	display: inline-block;
	width: 16px;
	height: 16px;
	margin-right: 8px;
	border: 2px solid rgba(255, 255, 255, 0.3);
	border-radius: 50%;
	border-top-color: white;
	animation: spin 1s linear infinite;

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
`

const ErrorMessage = styled.div`
	color: red;
	margin-bottom: 16px;
	font-size: 0.9rem;
`

const Input = styled.input`
	width: 100px;
	padding: 8px;
	border-radius: var(--radius-sm);
	border: 1px solid var(--border-color);
	background-color: var(--bg-color);
	color: var(--text-primary);
	font-size: 0.9rem;

	&:focus {
		outline: none;
		border-color: var(--primary-color);
	}
`

// Стили для выбора топологий
const TopologySection = styled.div`
	margin-bottom: 20px;
`

const TopologyGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
	gap: 1rem;
	max-height: 200px;
	overflow-y: auto;
	padding: 1rem;
	background: white;
	border-radius: 12px;
	border: 1px solid #e2e8f0;

	&::-webkit-scrollbar {
		width: 6px;
	}

	&::-webkit-scrollbar-track {
		background: #f1f5f9;
		border-radius: 3px;
	}

	&::-webkit-scrollbar-thumb {
		background: #cbd5e1;
		border-radius: 3px;
	}

	&::-webkit-scrollbar-thumb:hover {
		background: #94a3b8;
	}
`

const TopologyOption = styled.div<{ selected?: boolean }>`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 0.8rem;
	border: 2px solid ${props => (props.selected ? '#667eea' : '#e2e8f0')};
	border-radius: 12px;
	cursor: pointer;
	transition: all 0.2s ease;
	background: ${props =>
		props.selected ? 'rgba(102, 126, 234, 0.1)' : 'white'};
	height: 100px;
	position: relative;

	&:hover {
		border-color: #667eea;
		background: rgba(102, 126, 234, 0.05);
		transform: translateY(-2px);
		box-shadow: 0 8px 25px -8px rgba(102, 126, 234, 0.3);
	}

	${props =>
		props.selected &&
		`
		&::after {
			content: '✓';
			position: absolute;
			top: 0.4rem;
			right: 0.4rem;
			width: 18px;
			height: 18px;
			background: #667eea;
			color: white;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 0.7rem;
			font-weight: bold;
		}
	`}
`

const TopologyImage = styled.img`
	width: 100%;
	height: 60px;
	object-fit: contain;
	border-radius: 6px;
	background: white;
`

const TopologyLabel = styled.span`
	color: var(--text-secondary);
	text-align: center;
	font-size: 0.7rem;
	font-weight: 500;
	margin-top: 0.4rem;
`

const LoadingTopologies = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 2rem;
	color: var(--text-secondary);
	font-size: 0.9rem;
	gap: 1rem;
`

const TopologyLoadingSpinner = styled.div`
	width: 24px;
	height: 24px;
	border: 2px solid #e2e8f0;
	border-radius: 50%;
	border-top-color: #667eea;
	animation: spin 1s linear infinite;

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
`

interface GenerateChainModalProps {
	isOpen: boolean
	onClose: () => void
	onGenerate: (options: ChainOptions) => void
}

export interface ChainOptions {
	order: 'first' | 'second'
	rootType?: RootType
	difficulty?: DifficultyLevel
	resistors_count?: number
	circuit: string
	topology_id?: number
}

const GenerateChainModal: React.FC<GenerateChainModalProps> = ({
	isOpen,
	onClose,
	onGenerate,
}) => {
	const [order, setOrder] = useState<'first' | 'second'>('first')
	const [rootType, setRootType] = useState<RootType>(RootType.DIFFERENT)
	const [difficulty, setDifficulty] = useState<DifficultyLevel>(
		DifficultyLevel.BASIC
	)
	const [resistorsCount, setResistorsCount] = useState<number>(3)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// Новые состояния для топологий
	const [availableTopologies, setAvailableTopologies] = useState<Topology[]>([])
	const [selectedTopologyId, setSelectedTopologyId] = useState<number | null>(
		null
	)
	const [isLoadingTopologies, setIsLoadingTopologies] = useState(false)

	// Загружаем топологии при изменении порядка
	useEffect(() => {
		const loadTopologies = async () => {
			try {
				setIsLoadingTopologies(true)
				const orderValue = order === 'first' ? 1 : 2
				const topologies = await circuitApi.getTopologiesWithOrder(orderValue)
				setAvailableTopologies(topologies)
				setSelectedTopologyId(null) // Сбрасываем выбранную топологию
			} catch (error) {
				console.error('Ошибка при загрузке топологий:', error)
				setAvailableTopologies([])
			} finally {
				setIsLoadingTopologies(false)
			}
		}

		if (isOpen) {
			loadTopologies()
		}
	}, [order, isOpen])

	if (!isOpen) return null

	const handleSubmit = async () => {
		try {
			setIsLoading(true)
			setError(null)

			// Преобразуем порядок из строкового в числовой
			const orderValue = order === 'first' ? 1 : 2

			// Для одиночной генерации используем существующий метод
			const response = await circuitApi.generateCircuit({
				order: orderValue,
				rootType: order === 'second' ? rootType : undefined,
				difficulty: difficulty,
				resistors_count:
					difficulty === DifficultyLevel.ADVANCED ? resistorsCount : undefined,
				topology_id: selectedTopologyId || undefined, // Передаем ID топологии
			})

			if (response.status === 'success' && response.circuit) {
				console.log('Сгенерированная цепь:', response.circuit)
				onGenerate({
					order,
					rootType: order === 'second' ? rootType : undefined,
					difficulty: difficulty,
					resistors_count:
						difficulty === DifficultyLevel.ADVANCED
							? resistorsCount
							: undefined,
					circuit: response.circuit,
					topology_id: selectedTopologyId || undefined, // Передаем ID топологии
				})
				onClose() // Закрываем модальное окно после успешной генерации
			} else {
				setError(response.message || 'Не удалось сгенерировать цепь')
			}
		} catch (err) {
			console.error('Ошибка при генерации цепи:', err)
			let errorMessage = 'Ошибка при генерации цепи. Попробуйте позже.'
			if (err instanceof Error) {
				errorMessage = err.message
			}
			setError(errorMessage)
		} finally {
			setIsLoading(false)
		}
	}

	return createPortal(
		<ModalBackground onClick={onClose}>
			<ModalContainer onClick={e => e.stopPropagation()}>
				<ModalHeader>
					<Title>Генерация цепи</Title>
				</ModalHeader>

				<Content>
					{error && <ErrorMessage>{error}</ErrorMessage>}

					<OptionGroup>
						<Label>Порядок цепи:</Label>
						<RadioGroup>
							<RadioButton>
								<input
									type='radio'
									name='order'
									value='first'
									checked={order === 'first'}
									onChange={() => {
										setOrder('first')
									}}
									disabled={isLoading}
								/>
								<span>Первого порядка</span>
							</RadioButton>
							<RadioButton>
								<input
									type='radio'
									name='order'
									value='second'
									checked={order === 'second'}
									onChange={() => setOrder('second')}
									disabled={isLoading}
								/>
								<span>Второго порядка</span>
							</RadioButton>
						</RadioGroup>
					</OptionGroup>

					{order === 'second' && (
						<OptionGroup>
							<Label>Тип корневого элемента:</Label>
							<RadioGroup>
								<RadioButton>
									<input
										type='radio'
										name='rootType'
										value={RootType.DIFFERENT}
										checked={rootType === RootType.DIFFERENT}
										onChange={() => setRootType(RootType.DIFFERENT)}
										disabled={isLoading}
									/>
									<span>Разные</span>
								</RadioButton>
								<RadioButton>
									<input
										type='radio'
										name='rootType'
										value={RootType.COMPLEX}
										checked={rootType === RootType.COMPLEX}
										onChange={() => setRootType(RootType.COMPLEX)}
										disabled={isLoading}
									/>
									<span>Комплексные</span>
								</RadioButton>
							</RadioGroup>
						</OptionGroup>
					)}

					<OptionGroup>
						<Label>Уровень сложности:</Label>
						<RadioGroup>
							<RadioButton>
								<input
									type='radio'
									name='difficulty'
									value={DifficultyLevel.BASIC}
									checked={difficulty === DifficultyLevel.BASIC}
									onChange={() => setDifficulty(DifficultyLevel.BASIC)}
									disabled={isLoading}
								/>
								<span>Базовый</span>
							</RadioButton>
							<RadioButton>
								<input
									type='radio'
									name='difficulty'
									value={DifficultyLevel.ADVANCED}
									checked={difficulty === DifficultyLevel.ADVANCED}
									onChange={() => setDifficulty(DifficultyLevel.ADVANCED)}
									disabled={isLoading}
								/>
								<span>Продвинутый</span>
							</RadioButton>
						</RadioGroup>
					</OptionGroup>

					{difficulty === DifficultyLevel.ADVANCED && (
						<OptionGroup>
							<Label>Количество резисторов для исследования:</Label>
							<Input
								type='number'
								value={resistorsCount}
								onChange={e =>
									setResistorsCount(Math.max(1, parseInt(e.target.value) || 1))
								}
								disabled={isLoading}
								min='1'
								max='10'
							/>
						</OptionGroup>
					)}

					{/* Выбор топологии с картинками */}
					<TopologySection>
						<Label>Выбор топологии:</Label>
						{isLoadingTopologies ? (
							<LoadingTopologies>
								<TopologyLoadingSpinner />
								<span>Загрузка доступных топологий...</span>
							</LoadingTopologies>
						) : (
							<TopologyGrid>
								{/* Опция "Любая топология" */}
								<TopologyOption
									selected={selectedTopologyId === null}
									onClick={() => setSelectedTopologyId(null)}
								>
									<div
										style={{
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											height: '60px',
											fontSize: '1.5rem',
										}}
									>
										🎲
									</div>
									<TopologyLabel>Любая</TopologyLabel>
								</TopologyOption>

								{/* Конкретные топологии */}
								{availableTopologies.map(topology => (
									<TopologyOption
										key={topology.id}
										selected={selectedTopologyId === topology.id}
										onClick={() => setSelectedTopologyId(topology.id)}
									>
										<TopologyImage
											src={topology.image_base64}
											alt={`Топология ${topology.id}`}
											onError={e => {
												const target = e.target as HTMLImageElement
												target.style.display = 'none'
											}}
										/>
										<TopologyLabel>Топология {topology.id}</TopologyLabel>
									</TopologyOption>
								))}
							</TopologyGrid>
						)}
					</TopologySection>
				</Content>

				<ButtonGroup>
					<CancelButton onClick={onClose} disabled={isLoading}>
						Отмена
					</CancelButton>

					<GenerateButton onClick={handleSubmit} disabled={isLoading}>
						{isLoading && <LoadingSpinner />}
						{isLoading ? 'Генерация...' : 'Сгенерировать'}
					</GenerateButton>
				</ButtonGroup>
			</ModalContainer>
		</ModalBackground>,
		document.body
	)
}

export default GenerateChainModal
