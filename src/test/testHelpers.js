/**
 * Test Helper Utilities
 * Provides common functions for testing simulation components
 */

import {
  generateAgentPopulation,
  generateTopics,
  runSimulation,
  prepareVisualizationData,
} from '../lib/agentSimulation';

/**
 * Create a complete simulation setup with default parameters
 */
export function createTestSimulation(options = {}) {
  const {
    numAgents = 50,
    dimension = 10,
    numClusters = 3,
    cycles = 20,
    threshold = 0.3,
    recalculateAfter = 0,
    scenario = 'A',
  } = options;

  const agentData = generateAgentPopulation(numAgents, dimension, numClusters);
  const topics = generateTopics(dimension, scenario, agentData.clusterCenters);
  const simResult = runSimulation(agentData.agents, topics, cycles, threshold, recalculateAfter);
  const vizData = prepareVisualizationData(simResult.agents, simResult.connections, threshold);

  return {
    agentData,
    topics,
    simResult,
    vizData,
    params: { numAgents, dimension, numClusters, cycles, threshold, recalculateAfter, scenario },
  };
}

/**
 * Compare two simulation results
 */
export function compareSimulations(sim1, sim2) {
  const comparison = {
    agentCountMatch: sim1.simResult.agents.length === sim2.simResult.agents.length,
    topicCountMatch: sim1.topics.length === sim2.topics.length,
    connectionsDifferent: false,
    clustersDifferent: false,
  };

  // Check connection differences
  let connectionDiffs = 0;
  for (let i = 0; i < sim1.simResult.agents.length; i++) {
    for (let j = 0; j < sim1.simResult.agents.length; j++) {
      if (Math.abs(sim1.simResult.connections[i][j] - sim2.simResult.connections[i][j]) > 0.01) {
        connectionDiffs++;
      }
    }
  }
  comparison.connectionsDifferent = connectionDiffs > 0;
  comparison.connectionDiffCount = connectionDiffs;

  // Check cluster differences
  let clusterDiffs = 0;
  for (let i = 0; i < sim1.simResult.agents.length; i++) {
    if (sim1.simResult.agents[i].cluster !== sim2.simResult.agents[i].cluster) {
      clusterDiffs++;
    }
  }
  comparison.clustersDifferent = clusterDiffs > 0;
  comparison.clusterDiffCount = clusterDiffs;

  return comparison;
}

/**
 * Calculate cluster statistics
 */
export function calculateClusterStats(agents) {
  const clusterMap = {};
  
  agents.forEach(agent => {
    if (!clusterMap[agent.cluster]) {
      clusterMap[agent.cluster] = [];
    }
    clusterMap[agent.cluster].push(agent);
  });

  const stats = Object.entries(clusterMap).map(([clusterId, clusterAgents]) => ({
    clusterId: parseInt(clusterId),
    count: clusterAgents.length,
    percentage: (clusterAgents.length / agents.length) * 100,
  }));

  return {
    clusters: stats,
    totalClusters: stats.length,
    averageSize: agents.length / stats.length,
    minSize: Math.min(...stats.map(s => s.count)),
    maxSize: Math.max(...stats.map(s => s.count)),
  };
}

/**
 * Calculate connection statistics
 */
export function calculateConnectionStats(connections, threshold = 0.5) {
  const n = connections.length;
  let totalConnections = 0;
  let strongConnections = 0;
  let weakConnections = 0;
  let connectionStrengthSum = 0;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const strength = connections[i][j];
      if (strength > 0) {
        totalConnections++;
        connectionStrengthSum += strength;
        
        if (strength >= threshold) {
          strongConnections++;
        } else {
          weakConnections++;
        }
      }
    }
  }

  const maxPossibleConnections = (n * (n - 1)) / 2;
  const density = totalConnections / maxPossibleConnections;
  const averageStrength = totalConnections > 0 ? connectionStrengthSum / totalConnections : 0;

  return {
    totalConnections,
    strongConnections,
    weakConnections,
    density,
    averageStrength,
    maxPossibleConnections,
  };
}

/**
 * Validate simulation parameters
 */
export function validateSimulationParams(params) {
  const errors = [];

  if (params.numAgents < 1) {
    errors.push('Number of agents must be at least 1');
  }

  if (params.dimension < 1) {
    errors.push('Vector dimension must be at least 1');
  }

  if (params.numClusters < 1) {
    errors.push('Number of clusters must be at least 1');
  }

  if (params.numClusters > params.numAgents) {
    errors.push('Number of clusters cannot exceed number of agents');
  }

  if (params.cycles < 1) {
    errors.push('Number of cycles must be at least 1');
  }

  if (params.threshold < 0 || params.threshold > 1) {
    errors.push('Threshold must be between 0 and 1');
  }

  if (params.recalculateAfter < 0) {
    errors.push('Recalculate after must be non-negative');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generate test vectors
 */
export function generateTestVectors(count, dimension) {
  return Array.from({ length: count }, () =>
    Array.from({ length: dimension }, () => Math.random() * 2 - 1)
  );
}

/**
 * Create mock simulation parameters
 */
export function createMockParams(overrides = {}) {
  return {
    agentCount: 150,
    vectorDimension: 10,
    numClusters: 3,
    cycles: 50,
    threshold: 0.5,
    recalculateClustersAfter: 0,
    scenario: 'A',
    ...overrides,
  };
}

/**
 * Create mock topic settings
 */
export function createMockTopicSettings(overrides = {}) {
  return {
    numTopics: 10,
    topics: [],
    ...overrides,
  };
}

/**
 * Create mock opinion settings
 */
export function createMockOpinionSettings(overrides = {}) {
  return {
    clusterOpinions: {},
    customMatrix: null,
    ...overrides,
  };
}

/**
 * Wait for async operations (useful for testing)
 */
export function waitFor(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if two vectors are approximately equal
 */
export function vectorsApproxEqual(vec1, vec2, epsilon = 0.0001) {
  if (vec1.length !== vec2.length) return false;
  
  for (let i = 0; i < vec1.length; i++) {
    if (Math.abs(vec1[i] - vec2[i]) > epsilon) {
      return false;
    }
  }
  
  return true;
}

/**
 * Generate a report summary for test results
 */
export function generateTestReport(testResults) {
  const passed = testResults.filter(r => r.passed).length;
  const failed = testResults.filter(r => !r.passed).length;
  const total = testResults.length;

  return {
    total,
    passed,
    failed,
    passRate: (passed / total) * 100,
    results: testResults,
  };
}

