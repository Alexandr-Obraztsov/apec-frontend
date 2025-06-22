import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Circuit, Topology, circuitApi } from '../services/api'

const ModalOverlay = styled.div`
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

const ModalContent = styled.div`
	background: var(--surface-color);
	border-radius: var(--radius-lg);
	width: 90vw;
	max-width: 1200px;
	height: 80vh;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
		0 10px 10px -5px rgba(0, 0, 0, 0.04);
`

const ModalHeader = styled.div`
	padding: 1.5rem 2rem;
	border-bottom: 1px solid var(--border-color);
	display: flex;
	justify-content: space-between;
	align-items: center;
`

const ModalTitle = styled.h2`
	margin: 0;
	color: var(--text-primary);
	font-size: 1.5rem;
	font-weight: 700;
`

const CloseButton = styled.button`
	background: none;
	border: none;
	font-size: 1.5rem;
	cursor: pointer;
	color: var(--text-secondary);
	padding: 0.5rem;
	border-radius: var(--radius-md);
	transition: all 0.2s ease;

	&:hover {
		background: var(--background-color);
		color: var(--text-primary);
	}
`

const ModalBody = styled.div`
	flex: 1;
	padding: 2rem;
	overflow-y: auto;
`

const TopologyInfo = styled.div`
	display: flex;
	gap: 2rem;
	margin-bottom: 2rem;
	padding: 1.5rem;
	background: var(--background-color);
	border-radius: var(--radius-lg);
`

const TopologyImage = styled.img`
	width: 300px;
	height: 200px;
	object-fit: contain;
	border-radius: var(--radius-md);
	background: white;
	border: 1px solid var(--border-color);
`

const TopologyMeta = styled.div`
	flex: 1;
`

const TopologyTitle = styled.h3`
	margin: 0 0 1rem 0;
	color: var(--text-primary);
	font-size: 1.3rem;
	font-weight: 600;
`

const TopologyDetail = styled.div`
	margin-bottom: 0.5rem;
	color: var(--text-secondary);
	font-size: 0.9rem;

	strong {
		color: var(--text-primary);
		font-weight: 600;
	}
`

const CircuitsSection = styled.div`
	margin-top: 2rem;
`

const SectionTitle = styled.h4`
	margin: 0 0 1.5rem 0;
	color: var(--text-primary);
	font-size: 1.2rem;
	font-weight: 600;
	display: flex;
	align-items: center;
	gap: 0.5rem;
`

const CircuitCount = styled.span`
	background: var(--primary-color);
	color: white;
	padding: 0.25rem 0.5rem;
	border-radius: var(--radius-sm);
	font-size: 0.8rem;
	font-weight: 500;
`

const CircuitsGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
	gap: 1.5rem;
`

const CircuitCard = styled.div`
	background: var(--surface-color);
	border: 1px solid var(--border-color);
	border-radius: var(--radius-lg);
	padding: 1.5rem;
	transition: all 0.2s ease;

	&:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		border-color: var(--primary-color);
	}
`

const CircuitImageContainer = styled.div`
	position: relative;
	margin-bottom: 1rem;
`

const CircuitImage = styled.img`
	width: 100%;
	height: 200px;
	object-fit: contain;
	border-radius: var(--radius-md);
	background: white;
	border: 1px solid var(--border-color);
`

const ImageLoadingOverlay = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(255, 255, 255, 0.8);
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: var(--radius-md);
	color: var(--text-secondary);
	font-size: 0.9rem;
`

const CircuitInfo = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 1rem;
`

const CircuitTitle = styled.h5`
	margin: 0;
	color: var(--text-primary);
	font-size: 1.1rem;
	font-weight: 600;
`

const CircuitOrder = styled.span<{ order: number }>`
	background: ${props => (props.order === 1 ? '#10b981' : '#3b82f6')};
	color: white;
	padding: 0.25rem 0.5rem;
	border-radius: var(--radius-sm);
	font-size: 0.8rem;
	font-weight: 500;
`

const CircuitMeta = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 1rem;
	font-size: 0.85rem;
	color: var(--text-secondary);
`

const CircuitId = styled.span`
	background: var(--background-color);
	padding: 0.25rem 0.5rem;
	border-radius: var(--radius-sm);
`

const CreatedDate = styled.span``

const CircuitActions = styled.div`
	display: flex;
	gap: 0.75rem;
`

const Button = styled.button`
	padding: 0.5rem 1rem;
	border-radius: var(--radius-md);
	font-size: 0.875rem;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
	border: none;

	&:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
`

const DeleteButton = styled(Button)`
	background: #ef4444;
	color: white;

	&:hover:not(:disabled) {
		background: #dc2626;
	}
`

const LoadingContainer = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	height: 200px;
	color: var(--text-secondary);
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

const EmptyState = styled.div`
	text-align: center;
	padding: 3rem;
	color: var(--text-secondary);
`

const EmptyStateIcon = styled.div`
	font-size: 3rem;
	margin-bottom: 1rem;
`

const EmptyStateTitle = styled.h3`
	margin: 0 0 0.5rem 0;
	color: var(--text-primary);
	font-size: 1.2rem;
`

const EmptyStateText = styled.p`
	margin: 0;
	font-size: 0.95rem;
`

interface CircuitWithImage extends Circuit {
	image_base64?: string
	imageLoading?: boolean
	imageError?: boolean
}

interface TopologyDetailModalProps {
	topology: Topology | null
	isOpen: boolean
	onClose: () => void
	onCircuitDeleted?: () => void
}

const TopologyDetailModal: React.FC<TopologyDetailModalProps> = ({
	topology,
	isOpen,
	onClose,
	onCircuitDeleted,
}) => {
	const [circuits, setCircuits] = useState<CircuitWithImage[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(null)
	const [deletingId, setDeletingId] = useState<number | null>(null)

	useEffect(() => {
		if (isOpen && topology) {
			loadCircuits()
		}
	}, [isOpen, topology])

	const loadCircuits = async () => {
		if (!topology) return

		try {
			setIsLoading(true)
			setError(null)

			const circuitsData = await circuitApi.getCircuitsByTopology(topology.id)
			setCircuits(
				circuitsData.map(circuit => ({ ...circuit, imageLoading: true }))
			)

			// Загружаем изображения для каждой схемы
			for (const circuit of circuitsData) {
				loadCircuitImage(circuit)
			}
		} catch (error) {
			console.error('Ошибка при загрузке схем:', error)
			setError('Ошибка при загрузке схем топологии')
		} finally {
			setIsLoading(false)
		}
	}

	const loadCircuitImage = async (circuit: Circuit) => {
		try {
			const response = await circuitApi.generateCircuitImage({
				circuit_string: circuit.circuit_string,
			})

			setCircuits(prev =>
				prev.map(c =>
					c.id === circuit.id
						? { ...c, image_base64: response.image_base64, imageLoading: false }
						: c
				)
			)
		} catch (error) {
			console.error(
				`Ошибка при загрузке изображения схемы ${circuit.id}:`,
				error
			)
			setCircuits(prev =>
				prev.map(c =>
					c.id === circuit.id
						? { ...c, imageError: true, imageLoading: false }
						: c
				)
			)
		}
	}

	const handleDeleteCircuit = async (circuitId: number) => {
		if (
			!confirm(
				'Вы уверены, что хотите удалить эту схему? Это действие нельзя отменить.'
			)
		) {
			return
		}

		try {
			setDeletingId(circuitId)
			setError(null)
			setSuccess(null)

			await circuitApi.deleteCircuit(circuitId)

			// Обновляем список схем
			setCircuits(prev => prev.filter(c => c.id !== circuitId))
			setSuccess('Схема успешно удалена')

			// Уведомляем родительский компонент
			if (onCircuitDeleted) {
				onCircuitDeleted()
			}

			// Убираем сообщение об успехе через 3 секунды
			setTimeout(() => setSuccess(null), 3000)
		} catch (error) {
			console.error('Ошибка при удалении схемы:', error)
			setError('Ошибка при удалении схемы')
		} finally {
			setDeletingId(null)
		}
	}

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('ru-RU', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		})
	}

	if (!isOpen || !topology) {
		return null
	}

	return (
		<ModalOverlay onClick={onClose}>
			<ModalContent onClick={e => e.stopPropagation()}>
				<ModalHeader>
					<ModalTitle>Топология {topology.id}</ModalTitle>
					<CloseButton onClick={onClose}>×</CloseButton>
				</ModalHeader>

				<ModalBody>
					{error && <ErrorMessage>{error}</ErrorMessage>}
					{success && <SuccessMessage>{success}</SuccessMessage>}

					<TopologyInfo>
						<TopologyImage
							src={topology.image_base64}
							alt={`Топология ${topology.id}`}
							onError={e => {
								const target = e.target as HTMLImageElement
								target.style.display = 'none'
							}}
						/>
						<TopologyMeta>
							<TopologyTitle>Информация о топологии</TopologyTitle>
							<TopologyDetail>
								<strong>ID:</strong> {topology.id}
							</TopologyDetail>
							<TopologyDetail>
								<strong>Создана:</strong> {formatDate(topology.created_at)}
							</TopologyDetail>
							{topology.updated_at && (
								<TopologyDetail>
									<strong>Обновлена:</strong> {formatDate(topology.updated_at)}
								</TopologyDetail>
							)}
							<TopologyDetail>
								<strong>Количество схем:</strong> {circuits.length}
							</TopologyDetail>
						</TopologyMeta>
					</TopologyInfo>

					<CircuitsSection>
						<SectionTitle>
							Схемы топологии
							<CircuitCount>{circuits.length}</CircuitCount>
						</SectionTitle>

						{isLoading ? (
							<LoadingContainer>Загрузка схем...</LoadingContainer>
						) : circuits.length === 0 ? (
							<EmptyState>
								<EmptyStateIcon>📋</EmptyStateIcon>
								<EmptyStateTitle>Нет схем</EmptyStateTitle>
								<EmptyStateText>
									В этой топологии пока нет сохраненных схем
								</EmptyStateText>
							</EmptyState>
						) : (
							<CircuitsGrid>
								{circuits.map(circuit => (
									<CircuitCard key={circuit.id}>
										<CircuitImageContainer>
											{circuit.image_base64 && !circuit.imageLoading ? (
												<CircuitImage
													src={circuit.image_base64}
													alt={`Схема ${circuit.id}`}
													onError={e => {
														const target = e.target as HTMLImageElement
														target.style.display = 'none'
													}}
												/>
											) : circuit.imageError ? (
												<CircuitImage
													style={{
														display: 'flex',
														alignItems: 'center',
														justifyContent: 'center',
														background: '#f3f4f6',
														color: '#6b7280',
													}}
													as='div'
												>
													Ошибка загрузки изображения
												</CircuitImage>
											) : (
												<>
													<CircuitImage
														style={{
															background: '#f3f4f6',
														}}
														as='div'
													/>
													<ImageLoadingOverlay>
														Загрузка изображения...
													</ImageLoadingOverlay>
												</>
											)}
										</CircuitImageContainer>

										<CircuitInfo>
											<CircuitTitle>Схема {circuit.id}</CircuitTitle>
											<CircuitOrder order={circuit.order}>
												{circuit.order}-й порядок
											</CircuitOrder>
										</CircuitInfo>

										<CircuitMeta>
											<CircuitId>ID: {circuit.id}</CircuitId>
											<CreatedDate>
												{formatDate(circuit.created_at)}
											</CreatedDate>
										</CircuitMeta>

										<CircuitActions>
											<DeleteButton
												onClick={() => handleDeleteCircuit(circuit.id)}
												disabled={deletingId === circuit.id}
											>
												{deletingId === circuit.id ? 'Удаление...' : 'Удалить'}
											</DeleteButton>
										</CircuitActions>
									</CircuitCard>
								))}
							</CircuitsGrid>
						)}
					</CircuitsSection>
				</ModalBody>
			</ModalContent>
		</ModalOverlay>
	)
}

export default TopologyDetailModal
