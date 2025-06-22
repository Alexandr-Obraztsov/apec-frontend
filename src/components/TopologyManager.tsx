import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Topology, circuitApi } from '../services/api'
import TopologyDetailModal from './TopologyDetailModal'

const Container = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
	background: var(--background-color);
`

const Header = styled.div`
	width: 100%;
	padding: 2rem;
	border-bottom: 1px solid var(--border-color);
	background: var(--surface-color);
`

const Title = styled.h1`
	margin: 0 0 0.5rem 0;
	color: var(--text-primary);
	font-size: 2rem;
	font-weight: 700;
`

const Subtitle = styled.p`
	margin: 0;
	color: var(--text-secondary);
	font-size: 1rem;
`

const Content = styled.div`
	flex: 1;
	width: 100%;
	padding: 2rem;
	overflow-y: auto;
`

const TopologyGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
	gap: 1.5rem;
`

const TopologyCard = styled.div`
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

const TopologyImage = styled.img`
	width: 100%;
	height: 200px;
	object-fit: contain;
	border-radius: var(--radius-md);
	background: white;
	border: 1px solid var(--border-color);
	margin-bottom: 1rem;
`

const TopologyInfo = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 1rem;
`

const TopologyTitle = styled.h3`
	margin: 0;
	color: var(--text-primary);
	font-size: 1.1rem;
	font-weight: 600;
`

const TopologyId = styled.span`
	color: var(--text-secondary);
	font-size: 0.9rem;
	background: var(--background-color);
	padding: 0.25rem 0.5rem;
	border-radius: var(--radius-sm);
`

const TopologyMeta = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 1rem;
	font-size: 0.85rem;
	color: var(--text-secondary);
`

const CircuitCount = styled.span`
	background: var(--primary-color);
	color: white;
	padding: 0.25rem 0.5rem;
	border-radius: var(--radius-sm);
	font-weight: 500;
`

const CreatedDate = styled.span``

const ActionButtons = styled.div`
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

const ViewButton = styled(Button)`
	background: var(--background-color);
	color: var(--text-primary);
	border: 1px solid var(--border-color);

	&:hover:not(:disabled) {
		background: var(--border-color);
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

	return (
		<Container>
			<Header>
				<Title>Управление топологиями</Title>
				<Subtitle>Просмотр и управление сохраненными топологиями схем</Subtitle>
			</Header>

			<Content>
				{error && <ErrorMessage>{error}</ErrorMessage>}
				{success && <SuccessMessage>{success}</SuccessMessage>}

				{isLoading ? (
					<LoadingContainer>Загрузка топологий...</LoadingContainer>
				) : topologies.length === 0 ? (
					<EmptyState>
						<EmptyStateIcon>📋</EmptyStateIcon>
						<EmptyStateTitle>Нет сохраненных топологий</EmptyStateTitle>
						<EmptyStateText>
							Создайте схему и сохраните её, чтобы топологии появились здесь
						</EmptyStateText>
					</EmptyState>
				) : (
					<TopologyGrid>
						{topologies.map(topology => (
							<TopologyCard key={topology.id}>
								<TopologyImage
									src={topology.image_base64}
									alt={`Топология ${topology.id}`}
									onError={e => {
										const target = e.target as HTMLImageElement
										target.style.display = 'none'
									}}
								/>

								<TopologyInfo>
									<TopologyTitle>Топология {topology.id}</TopologyTitle>
									<TopologyId>ID: {topology.id}</TopologyId>
								</TopologyInfo>

								<TopologyMeta>
									<CircuitCount>
										{topology.circuit_count || 0} схем
									</CircuitCount>
									<CreatedDate>{formatDate(topology.created_at)}</CreatedDate>
								</TopologyMeta>

								<ActionButtons>
									<ViewButton
										onClick={() => handleView(topology)}
										disabled={deletingId === topology.id}
									>
										Просмотр
									</ViewButton>
									<DeleteButton
										onClick={() => handleDelete(topology.id)}
										disabled={deletingId === topology.id}
									>
										{deletingId === topology.id ? 'Удаление...' : 'Удалить'}
									</DeleteButton>
								</ActionButtons>
							</TopologyCard>
						))}
					</TopologyGrid>
				)}
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
