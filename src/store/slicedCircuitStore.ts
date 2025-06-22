import { useCircuitStore } from './circuitStore'

// Оптимизированные селекторы для хранилища схемы
// Эти хуки возвращают только необходимые части состояния, уменьшая количество рендеров

// Хук для получения элементов схемы
export const useElements = () => {
	return useCircuitStore(state => state.elements)
}

// Хук для получения узлов схемы
export const useNodes = () => {
	return useCircuitStore(state => state.nodes)
}

// Хук для получения выбранного элемента и узла
export const useSelection = () => {
	return useCircuitStore(state => ({
		selectedElementId: state.selectedElementId,
		selectedNodeId: state.selectedNodeId,
	}))
}

// Хук для получения режима размещения
export const usePlacementMode = () => {
	return useCircuitStore(state => ({
		active: state.placementMode.active,
		elementType: state.placementMode.elementType,
		startNodeId: state.placementMode.startNodeId,
	}))
}

// Хук для получения всех действий размещения
export const usePlacementActions = () => {
	return useCircuitStore(state => ({
		startPlacement: state.startPlacement,
		cancelPlacement: state.cancelPlacement,
		setPlacementStartNode: state.setPlacementStartNode,
		placeElementInDirection: state.placeElementInDirection,
		getAvailableDirections: state.getAvailableDirections,
	}))
}

// Хук для получения действий с узлами
export const useNodeActions = () => {
	return useCircuitStore(state => ({
		addNode: state.addNode,
		findNodeAtPosition: state.findNodeAtPosition,
		selectNode: state.selectNode,
		getNodeById: state.getNodeById,
	}))
}

// Хук для получения состояния подсветки
export const useHighlightState = () => {
	return useCircuitStore(state => ({
		highlightedElementId: state.highlightedElementId,
		highlightedNodeId: state.highlightedNodeId,
		setHighlightedElement: state.setHighlightedElement,
		setHighlightedNode: state.setHighlightedNode,
	}))
}

// Хук для получения действий с элементами
export const useElementActions = () => {
	return useCircuitStore(state => ({
		addElement: state.addElement,
		removeElement: state.removeElement,
		updateElementValue: state.updateElementValue,
		selectElement: state.selectElement,
	}))
}

// Дополнительные хуки для более точных обновлений
// Хук для подключения к конкретному элементу по ID
export const useElementById = (elementId: string | null) => {
	return useCircuitStore(state =>
		elementId ? state.elements.find(element => element.id === elementId) : null
	)
}

// Хук для подключения к конкретному узлу по ID
export const useNodeById = (nodeId: string | null) => {
	return useCircuitStore(state =>
		nodeId ? state.nodes.find(node => node.id === nodeId) : null
	)
}
