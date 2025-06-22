import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Topology, circuitApi } from '../services/api'
import TopologyDetailModal from './TopologyDetailModal'

const Container = styled.div`
	width: 100%;
	height: 100%;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	overflow-y: auto;
	position: relative;
`

const BackgroundPattern = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-image: radial-gradient(
			circle at 25% 25%,
			rgba(255, 255, 255, 0.1) 2px,
			transparent 2px
		),
		radial-gradient(
			circle at 75% 75%,
			rgba(255, 255, 255, 0.1) 2px,
			transparent 2px
		);
	background-size: 60px 60px;
	pointer-events: none;
`

const Content = styled.div`
	position: relative;
	z-index: 1;
	padding: 2rem;
	max-width: 1400px;
	margin: 0 auto;
`

const Header = styled.div`
	text-align: center;
	margin-bottom: 3rem;
	color: white;
`

const MainTitle = styled.h1`
	font-size: 3rem;
	font-weight: 800;
	margin: 0 0 1rem 0;
	background: linear-gradient(45deg, #ffffff, #e0e7ff);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
	text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
`

const Subtitle = styled.p`
	font-size: 1.2rem;
	margin: 0 0 0.5rem 0;
	opacity: 0.9;
	font-weight: 300;
`

const StatsContainer = styled.div`
	display: inline-flex;
	align-items: center;
	gap: 1rem;
	background: rgba(255, 255, 255, 0.2);
	backdrop-filter: blur(10px);
	border-radius: 50px;
	padding: 0.75rem 2rem;
	border: 1px solid rgba(255, 255, 255, 0.3);
`

const StatItem = styled.div`
	display: flex;
	align-items: center;
	gap: 0.5rem;
	font-size: 0.9rem;
	font-weight: 500;
`

const StatBadge = styled.span`
	background: #10b981;
	color: white;
	border-radius: 50px;
	padding: 0.25rem 0.75rem;
	font-size: 0.8rem;
	font-weight: 700;
	min-width: 24px;
	text-align: center;
`

const MainCard = styled.div`
	background: rgba(255, 255, 255, 0.95);
	backdrop-filter: blur(20px);
	border-radius: 24px;
	padding: 3rem;
	box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
		0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(255, 255, 255, 0.2);
	border: 1px solid rgba(255, 255, 255, 0.3);
`

const SectionTitle = styled.h2`
	color: var(--text-primary);
	margin: 0 0 2rem 0;
	font-size: 1.8rem;
	font-weight: 700;
	display: flex;
	align-items: center;
	gap: 0.75rem;

	&::before {
		content: '';
		width: 4px;
		height: 2rem;
		background: linear-gradient(135deg, #667eea, #764ba2);
		border-radius: 2px;
	}
`

const TopologyGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
	gap: 2rem;
`

const TopologyCard = styled.div`
	background: linear-gradient(135deg, #f8fafc, #f1f5f9);
	border-radius: 20px;
	padding: 2rem;
	border: 1px solid #e2e8f0;
	transition: all 0.3s ease;
	position: relative;
	overflow: hidden;
	cursor: pointer;

	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: linear-gradient(90deg, #667eea, #764ba2);
	}

	&:hover {
		transform: translateY(-8px);
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
		border-color: #667eea;

		.topology-image {
			transform: scale(1.05);
		}
	}
`

const TopologyImageContainer = styled.div`
	position: relative;
	margin-bottom: 1.5rem;
	border-radius: 16px;
	overflow: hidden;
	background: white;
	border: 1px solid #e2e8f0;
`

const TopologyImage = styled.img`
	padding: 1rem;
	width: 100%;
	height: 100%;
	object-fit: contain;
	transition: transform 0.3s ease;
	background: white;
`

const TopologyInfo = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 1.5rem;
`

const TopologyTitleSection = styled.div`
	flex: 1;
`

const TopologyTitle = styled.h3`
	margin: 0 0 0.5rem 0;
	color: var(--text-primary);
	font-size: 1.3rem;
	font-weight: 700;
`

const TopologyId = styled.span`
	color: var(--text-secondary);
	font-size: 0.9rem;
	background: #e2e8f0;
	padding: 0.25rem 0.75rem;
	border-radius: 50px;
	font-weight: 500;
`

const TopologyMeta = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 1rem;
	margin-bottom: 1.5rem;
	padding: 1rem;
	background: rgba(102, 126, 234, 0.05);
	border-radius: 12px;
	border: 1px solid rgba(102, 126, 234, 0.1);
`

const MetaItem = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
`

const MetaLabel = styled.span`
	font-size: 0.8rem;
	color: var(--text-secondary);
	font-weight: 500;
	text-transform: uppercase;
	letter-spacing: 0.5px;
`

const MetaValue = styled.span`
	font-size: 0.95rem;
	color: var(--text-primary);
	font-weight: 600;
`

const CircuitCount = styled.span`
	background: linear-gradient(135deg, #10b981, #059669);
	color: white;
	padding: 0.5rem 1rem;
	border-radius: 50px;
	font-weight: 600;
	font-size: 0.9rem;
	display: inline-flex;
	align-items: center;
	gap: 0.5rem;
	box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);

	&::before {
		content: '📋';
		font-size: 0.8rem;
	}
`

const ActionButtons = styled.div`
	display: flex;
	gap: 0.75rem;
`

const Button = styled.button`
	padding: 0.75rem 1.5rem;
	border-radius: 12px;
	font-size: 0.875rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.3s ease;
	border: none;
	display: flex;
	align-items: center;
	gap: 0.5rem;
	position: relative;
	overflow: hidden;

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
		transform: none;
	}
`

const ViewButton = styled(Button)`
	background: linear-gradient(135deg, #6b7280, #4b5563);
	color: white;
	flex: 1;

	&:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px -8px rgba(107, 114, 128, 0.4);
	}
`

const DeleteButton = styled(Button)`
	background: linear-gradient(135deg, #ef4444, #dc2626);
	color: white;
	flex: 1;

	&:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px -8px rgba(239, 68, 68, 0.4);
	}
`

const LoadingContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	height: 400px;
	color: var(--text-secondary);
	gap: 1.5rem;
`

const LoadingSpinner = styled.div`
	width: 48px;
	height: 48px;
	border: 4px solid #e2e8f0;
	border-radius: 50%;
	border-top-color: #667eea;
	animation: spin 1s linear infinite;

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
`

const LoadingText = styled.div`
	font-size: 1.1rem;
	font-weight: 500;
`

const ErrorMessage = styled.div`
	color: #dc2626;
	background: linear-gradient(135deg, #fee2e2, #fecaca);
	padding: 1.5rem;
	border-radius: 16px;
	margin-bottom: 2rem;
	font-size: 0.95rem;
	border: 1px solid #fca5a5;
	display: flex;
	align-items: center;
	gap: 0.75rem;
	box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.1);

	&::before {
		content: '⚠️';
		font-size: 1.5rem;
	}
`

const SuccessMessage = styled.div`
	color: #059669;
	background: linear-gradient(135deg, #d1fae5, #a7f3d0);
	padding: 1.5rem;
	border-radius: 16px;
	margin-bottom: 2rem;
	font-size: 0.95rem;
	border: 1px solid #6ee7b7;
	display: flex;
	align-items: center;
	gap: 0.75rem;
	box-shadow: 0 4px 6px -1px rgba(5, 150, 105, 0.1);

	&::before {
		content: '✅';
		font-size: 1.5rem;
	}
`

const EmptyState = styled.div`
	text-align: center;
	padding: 4rem 2rem;
	color: var(--text-secondary);
`

const EmptyStateIcon = styled.div`
	font-size: 4rem;
	margin-bottom: 1.5rem;
	opacity: 0.5;
`

const EmptyStateTitle = styled.h3`
	margin: 0 0 0.5rem 0;
	color: var(--text-primary);
	font-size: 1.5rem;
	font-weight: 700;
`

const EmptyStateText = styled.p`
	margin: 0;
	font-size: 1rem;
	line-height: 1.6;
	max-width: 500px;
	margin: 0 auto;
`

const EmptyStateSubtext = styled.p`
	margin: 1rem 0 0 0;
	font-size: 0.9rem;
	color: var(--text-secondary);
	font-style: italic;
`

interface TopologyWithCircuitCount extends Topology {
	circuit_count?: number
}

const TopologyManager: React.FC = () => {
	const [topologies, setTopologies] = useState<TopologyWithCircuitCount[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(null)
	const [deletingId, setDeletingId] = useState<number | null>(null)
	const [selectedTopology, setSelectedTopology] = useState<Topology | null>(
		null
	)
	const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

	useEffect(() => {
		loadTopologies()
	}, [])

	const loadTopologies = async () => {
		try {
			setIsLoading(true)
			setError(null)

			// Получаем топологии
			const response = await circuitApi.getTopologies()

			// Для каждой топологии получаем количество схем
			const topologiesWithCounts = await Promise.all(
				response.topologies.map(async topology => {
					try {
						const circuits = await circuitApi.getCircuitsByTopology(
							topology.id,
							0,
							1000
						)
						return {
							...topology,
							circuit_count: circuits.length,
						}
					} catch {
						return {
							...topology,
							circuit_count: 0,
						}
					}
				})
			)

			setTopologies(topologiesWithCounts)
		} catch (error) {
			console.error('Ошибка при загрузке топологий:', error)
			setError('Ошибка при загрузке топологий')
		} finally {
			setIsLoading(false)
		}
	}

	const handleDelete = async (topologyId: number) => {
		if (
			!confirm(
				'Вы уверены, что хотите удалить эту топологию? Это действие нельзя отменить.'
			)
		) {
			return
		}

		try {
			setDeletingId(topologyId)
			setError(null)
			setSuccess(null)

			await circuitApi.deleteTopology(topologyId)

			// Обновляем список топологий
			setTopologies(prev => prev.filter(t => t.id !== topologyId))
			setSuccess('Топология успешно удалена')

			// Убираем сообщение об успехе через 3 секунды
			setTimeout(() => setSuccess(null), 3000)
		} catch (error) {
			console.error('Ошибка при удалении топологии:', error)
			setError('Ошибка при удалении топологии')
		} finally {
			setDeletingId(null)
		}
	}

	const handleView = (topology: Topology) => {
		setSelectedTopology(topology)
		setIsDetailModalOpen(true)
	}

	const handleCloseDetailModal = () => {
		setIsDetailModalOpen(false)
		setSelectedTopology(null)
	}

	const handleCircuitDeleted = () => {
		// Перезагружаем топологии для обновления счетчика схем
		loadTopologies()
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

	const totalCircuits = topologies.reduce(
		(sum, topology) => sum + (topology.circuit_count || 0),
		0
	)

	return (
		<Container>
			<BackgroundPattern />
			<Content>
				<Header>
					<MainTitle>Управление топологиями</MainTitle>
					<Subtitle>
						Просмотр и управление сохраненными топологиями схем
					</Subtitle>
					<StatsContainer>
						<StatItem>
							<span>Топологий:</span>
							<StatBadge>{topologies.length}</StatBadge>
						</StatItem>
						<StatItem>
							<span>Всего схем:</span>
							<StatBadge>{totalCircuits}</StatBadge>
						</StatItem>
					</StatsContainer>
				</Header>

				<MainCard>
					<SectionTitle>🗂️ Сохраненные топологии</SectionTitle>

					{error && <ErrorMessage>{error}</ErrorMessage>}
					{success && <SuccessMessage>{success}</SuccessMessage>}

					{isLoading ? (
						<LoadingContainer>
							<LoadingSpinner />
							<LoadingText>Загрузка топологий...</LoadingText>
						</LoadingContainer>
					) : topologies.length === 0 ? (
						<EmptyState>
							<EmptyStateIcon>📋</EmptyStateIcon>
							<EmptyStateTitle>Нет сохраненных топологий</EmptyStateTitle>
							<EmptyStateText>
								Пока что у вас нет сохраненных топологий схем. Создайте схему в
								редакторе и сохраните её, чтобы топологии появились здесь.
							</EmptyStateText>
							<EmptyStateSubtext>
								Топологии автоматически создаются при сохранении схем
							</EmptyStateSubtext>
						</EmptyState>
					) : (
						<TopologyGrid>
							{topologies.map(topology => (
								<TopologyCard
									key={topology.id}
									onClick={() => handleView(topology)}
								>
									<TopologyImageContainer>
										<TopologyImage
											className='topology-image'
											src={topology.image_base64}
											alt={`Топология ${topology.id}`}
											onError={e => {
												const target = e.target as HTMLImageElement
												target.style.display = 'none'
											}}
										/>
									</TopologyImageContainer>

									<TopologyInfo>
										<TopologyTitleSection>
											<TopologyTitle>Топология {topology.id}</TopologyTitle>
											<TopologyId>ID: {topology.id}</TopologyId>
										</TopologyTitleSection>
									</TopologyInfo>

									<TopologyMeta>
										<MetaItem>
											<MetaLabel>Схем в топологии</MetaLabel>
											<MetaValue>{topology.circuit_count || 0}</MetaValue>
										</MetaItem>
										<MetaItem>
											<MetaLabel>Дата создания</MetaLabel>
											<MetaValue>{formatDate(topology.created_at)}</MetaValue>
										</MetaItem>
									</TopologyMeta>

									<div
										style={{
											display: 'flex',
											justifyContent: 'space-between',
											alignItems: 'center',
											marginBottom: '1rem',
										}}
									>
										<CircuitCount>
											{topology.circuit_count || 0} схем
										</CircuitCount>
									</div>

									<ActionButtons onClick={e => e.stopPropagation()}>
										<ViewButton
											onClick={e => {
												e.stopPropagation()
												handleView(topology)
											}}
											disabled={deletingId === topology.id}
										>
											<span>👁️</span>
											<span>Просмотр</span>
										</ViewButton>
										<DeleteButton
											onClick={e => {
												e.stopPropagation()
												handleDelete(topology.id)
											}}
											disabled={deletingId === topology.id}
										>
											<span>{deletingId === topology.id ? '⏳' : '🗑️'}</span>
											<span>
												{deletingId === topology.id ? 'Удаление...' : 'Удалить'}
											</span>
										</DeleteButton>
									</ActionButtons>
								</TopologyCard>
							))}
						</TopologyGrid>
					)}
				</MainCard>
			</Content>

			<TopologyDetailModal
				topology={selectedTopology}
				isOpen={isDetailModalOpen}
				onClose={handleCloseDetailModal}
				onCircuitDeleted={handleCircuitDeleted}
			/>
		</Container>
	)
}

export default TopologyManager
