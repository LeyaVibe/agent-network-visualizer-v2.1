/**
 * Simulation State Manager
 * Manages simulation state and provides utilities for state manipulation
 */

/**
 * Create initial simulation state
 */
export function createInitialState() {
  return {
    agents: null,
    topics: null,
    connections: null,
    clusterCenters: null,
    isRunning: false,
    progress: 0,
    currentCycle: 0,
    error: null,
    results: null,
    visualizationData: null,
    report: null,
  };
}

/**
 * Update simulation progress
 */
export function updateProgress(state, currentCycle, totalCycles) {
  return {
    ...state,
    currentCycle,
    progress: (currentCycle / totalCycles) * 100,
  };
}

/**
 * Set simulation running state
 */
export function setRunning(state, isRunning) {
  return {
    ...state,
    isRunning,
    error: isRunning ? null : state.error,
  };
}

/**
 * Set simulation error
 */
export function setError(state, error) {
  return {
    ...state,
    error,
    isRunning: false,
  };
}

/**
 * Set simulation results
 */
export function setResults(state, results) {
  return {
    ...state,
    results,
    isRunning: false,
    progress: 100,
  };
}

/**
 * Reset simulation state
 */
export function resetState() {
  return createInitialState();
}

/**
 * Check if simulation is ready to run
 */
export function isReadyToRun(state, params) {
  if (state.isRunning) return false;
  if (!params) return false;
  
  const hasAgents = params.agentCount > 0;
  const hasValidParams = params.vectorDimension > 0 && params.numClusters > 0;
  
  return hasAgents && hasValidParams;
}

/**
 * Get simulation summary
 */
export function getSimulationSummary(state) {
  if (!state.results) return null;

  const { agents, connections } = state.results;
  
  // Count active connections
  let activeConnections = 0;
  for (let i = 0; i < connections.length; i++) {
    for (let j = i + 1; j < connections.length; j++) {
      if (connections[i][j] > 0.5) {
        activeConnections++;
      }
    }
  }

  // Calculate network density
  const maxConnections = (agents.length * (agents.length - 1)) / 2;
  const density = maxConnections > 0 ? (activeConnections / maxConnections) * 100 : 0;

  // Count agents per cluster
  const clusterCounts = {};
  agents.forEach(agent => {
    clusterCounts[agent.cluster] = (clusterCounts[agent.cluster] || 0) + 1;
  });

  return {
    totalAgents: agents.length,
    activeConnections,
    networkDensity: density.toFixed(1),
    clusters: Object.keys(clusterCounts).length,
    clusterDistribution: clusterCounts,
  };
}

/**
 * Export simulation state to JSON
 */
export function exportState(state) {
  return JSON.stringify({
    agents: state.agents,
    topics: state.topics,
    connections: state.connections,
    results: state.results,
  }, null, 2);
}

/**
 * Import simulation state from JSON
 */
export function importState(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    return {
      ...createInitialState(),
      ...data,
    };
  } catch (error) {
    throw new Error('Invalid simulation state JSON');
  }
}

