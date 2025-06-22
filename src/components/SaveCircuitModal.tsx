import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'
import { Topology, circuitApi, formatCircuitToLCapy } from '../services/api'
import { Node, AnyCircuitElement } from '../types'

interface SaveCircuitModalProps {
	isOpen: boolean
	onClose: () => void
	nodes: Node[]
	elements: AnyCircuitElement[]
	circuitImage?: string // base64 изображение схемы
}

const ModalBackground = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
`

const ModalContainer = styled.div`
	background: white;
	border-radius: var(--radius-lg);
	padding: 0;
	max-width: 600px;
	width: 90%;
	max-height: 80vh;
	overflow-y: auto;
	box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
		0 10px 10px -5px rgba(0, 0, 0, 0.04);
`

const ModalHeader = styled.div`
	padding: 1.5rem;
	border-bottom: 1px solid var(--border-color);
`

const Title = styled.h2`
	margin: 0;
	color: var(--text-primary);
	font-size: 1.5rem;
	font-weight: 600;
`

const Content = styled.div`
	padding: 1.5rem;
`

const OptionGroup = styled.div`
	margin-bottom: 1.5rem;
`

const Label = styled.label`
	display: block;
	margin-bottom: 0.5rem;
	color: var(--text-primary);
	font-weight: 500;
	font-size: 0.95rem;
`

const RadioGroup = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
`

const RadioButton = styled.label`
	display: flex;
	align-items: center;
	gap: 0.5rem;
	cursor: pointer;
	color: var(--text-primary);
	font-size: 0.95rem;

	input {
		cursor: pointer;
	}

	&:hover {
		color: var(--primary-color);
	}
`

const TopologyGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(120px, 150px));
	gap: 0.75rem;
	max-height: 200px;
	overflow-y: auto;
	padding: 0.5rem;
	border: 1px solid var(--border-color);
	border-radius: var(--radius-sm);
	background: var(--surface-color);
	justify-content: start;
`

const TopologyOption = styled.div<{ selected?: boolean }>`
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 0.5rem;
	border: 2px solid
		${props =>
			props.selected ? 'var(--primary-color)' : 'var(--border-color)'};
	border-radius: var(--radius-sm);
	cursor: pointer;
	transition: all 0.2s ease;
	background: ${props =>
		props.selected ? 'var(--primary-color)10' : 'var(--background-color)'};
	width: 160px;
	height: 120px;

	&:hover {
		border-color: var(--primary-color);
		background: var(--primary-color) 10;
	}
`

const TopologyImage = styled.img`
	width: 100%;
	height: 100%;
	object-fit: contain;
	margin-bottom: 0.25rem;
	border-radius: var(--radius-sm);
	background: white;
`

const ButtonGroup = styled.div`
	display: flex;
	gap: 1rem;
	justify-content: flex-end;
	padding: 1.5rem;
	border-top: 1px solid var(--border-color);
`

const Button = styled.button`
	padding: 0.75rem 1rem;
	border-radius: var(--radius-md);
	font-size: 0.875rem;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
	min-width: 100px;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;

	&:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
`

const CancelButton = styled(Button)`
	background: var(--surface-color);
	color: var(--text-primary);
	border: 1px solid var(--border-color);

	&:hover:not(:disabled) {
		background: var(--border-color);
	}
`

const SaveButton = styled(Button)`
	background: var(--primary-color);
	color: white;
	border: none;

	&:hover:not(:disabled) {
		background: var(--primary-dark);
	}
`

const LoadingSpinner = styled.div`
	display: inline-block;
	width: 1rem;
	height: 1rem;
	border: 2px solid #ffffff;
	border-radius: 50%;
	border-top-color: transparent;
	animation: spin 1s linear infinite;

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
`

const ErrorMessage = styled.div`
	color: #ef4444;
	background: #fee2e2;
	padding: 1rem;
	border-radius: var(--radius-md);
	margin-bottom: 1rem;
	font-size: 0.9rem;
	border: 1px solid #fca5a5;
	display: flex;
	align-items: center;
	gap: 0.5rem;

	&::before {
		content: '⚠️';
	}
`

const SuccessMessage = styled.div`
	color: #059669;
	background: #d1fae5;
	padding: 1rem;
	border-radius: var(--radius-md);
	margin-bottom: 1rem;
	font-size: 0.9rem;
	border: 1px solid #6ee7b7;
	display: flex;
	align-items: center;
	gap: 0.5rem;

	&::before {
		content: '✓';
	}
`

const SaveCircuitModal: React.FC<SaveCircuitModalProps> = ({
	isOpen,
	onClose,
	nodes,
	elements,
	circuitImage,
}) => {
	const [saveMode, setSaveMode] = useState<'existing' | 'new'>('existing')
	const [order, setOrder] = useState<1 | 2>(2)
	const [selectedTopologyId, setSelectedTopologyId] = useState<number | null>(
		null
	)
	const [availableTopologies, setAvailableTopologies] = useState<Topology[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [isLoadingTopologies, setIsLoadingTopologies] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(null)

	// Загружаем топологии при открытии модального окна
	useEffect(() => {
		if (isOpen) {
			loadTopologies()
		}
	}, [isOpen])

	const loadTopologies = async () => {
		try {
			setIsLoadingTopologies(true)
			const response = await circuitApi.getTopologies()
			setAvailableTopologies(response.topologies)
		} catch (error) {
			console.error('Ошибка при загрузке топологий:', error)
			setAvailableTopologies([])
		} finally {
			setIsLoadingTopologies(false)
		}
	}

	const handleSave = async () => {
		try {
			setIsLoading(true)
			setError(null)
			setSuccess(null)

			if (elements.length === 0) {
				setError('Нет элементов для сохранения')
				return
			}

			// Преобразуем схему в строковый формат
			const circuit = formatCircuitToLCapy(nodes, elements, false)

			let topologyId: number

			if (saveMode === 'new') {
				// Создаем новую топологию
				if (!circuitImage) {
					setError('Изображение схемы не найдено')
					return
				}

				const topologyResponse = await circuitApi.createTopology({
					image_base64: circuitImage,
				})
				topologyId = topologyResponse.id
			} else {
				// Используем существующую топологию
				if (!selectedTopologyId) {
					setError('Выберите топологию')
					return
				}
				topologyId = selectedTopologyId
			}

			// Создаем схему
			await circuitApi.createCircuit({
				topology_id: topologyId,
				circuit_string: circuit.circuitString,
				order: order,
			})

			setSuccess('Схема успешно сохранена!')

			// Закрываем модальное окно через 2 секунды
			setTimeout(() => {
				onClose()
			}, 2000)
		} catch (error) {
			console.error('Ошибка при сохранении схемы:', error)
			setError('Ошибка при сохранении схемы. Попробуйте позже.')
		} finally {
			setIsLoading(false)
		}
	}

	const handleClose = () => {
		setError(null)
		setSuccess(null)
		setSaveMode('existing')
		setSelectedTopologyId(null)
		setOrder(2)
		onClose()
	}

	if (!isOpen) return null

	return createPortal(
		<ModalBackground onClick={handleClose}>
			<ModalContainer onClick={e => e.stopPropagation()}>
				<ModalHeader>
					<Title>Сохранить схему</Title>
				</ModalHeader>

				<Content>
					{error && <ErrorMessage>{error}</ErrorMessage>}
					{success && <SuccessMessage>{success}</SuccessMessage>}

					<OptionGroup>
						<Label>Порядок цепи:</Label>
						<RadioGroup>
							<RadioButton>
								<input
									type='radio'
									name='order'
									value={1}
									checked={order === 1}
									onChange={() => setOrder(1)}
									disabled={isLoading}
								/>
								<span>Первого порядка</span>
							</RadioButton>
							<RadioButton>
								<input
									type='radio'
									name='order'
									value={2}
									checked={order === 2}
									onChange={() => setOrder(2)}
									disabled={isLoading}
								/>
								<span>Второго порядка</span>
							</RadioButton>
						</RadioGroup>
					</OptionGroup>

					<OptionGroup>
						<Label>Способ сохранения:</Label>
						<RadioGroup>
							<RadioButton>
								<input
									type='radio'
									name='saveMode'
									value='existing'
									checked={saveMode === 'existing'}
									onChange={() => setSaveMode('existing')}
									disabled={isLoading}
								/>
								<span>Добавить к существующей топологии</span>
							</RadioButton>
							<RadioButton>
								<input
									type='radio'
									name='saveMode'
									value='new'
									checked={saveMode === 'new'}
									onChange={() => setSaveMode('new')}
									disabled={isLoading}
								/>
								<span>Создать новую топологию</span>
							</RadioButton>
						</RadioGroup>
					</OptionGroup>

					{saveMode === 'existing' && (
						<OptionGroup>
							<Label>Выберите топологию:</Label>
							{isLoadingTopologies ? (
								<div>Загрузка топологий...</div>
							) : (
								<TopologyGrid>
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
										</TopologyOption>
									))}
								</TopologyGrid>
							)}
						</OptionGroup>
					)}
				</Content>

				<ButtonGroup>
					<CancelButton onClick={handleClose} disabled={isLoading}>
						Отмена
					</CancelButton>

					<SaveButton onClick={handleSave} disabled={isLoading}>
						{isLoading && <LoadingSpinner />}
						{isLoading ? 'Сохранение...' : 'Сохранить'}
					</SaveButton>
				</ButtonGroup>
			</ModalContainer>
		</ModalBackground>,
		document.body
	)
}

export default SaveCircuitModal
