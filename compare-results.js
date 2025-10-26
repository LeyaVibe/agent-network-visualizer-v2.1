/**
 * Automated Comparison Script
 * Runs simulations with different parameters and compares results
 */

import {
  generateAgentPopulation,
  generateTopics,
  runSimulation,
} from './src/lib/agentSimulation.js';

function calculateStats(agents, connections, threshold = 0.5) {
  // Cluster stats
  const clusterMap = {};
  agents.forEach(agent => {
    if (!clusterMap[agent.cluster]) {
      clusterMap[agent.cluster] = 0;
    }
    clusterMap[agent.cluster]++;
  });

  // Connection stats
  let totalConnections = 0;
  let strongConnections = 0;
  let connectionSum = 0;

  for (let i = 0; i < connections.length; i++) {
    for (let j = i + 1; j < connections.length; j++) {
      const strength = connections[i][j];
      if (strength > 0) {
        totalConnections++;
        connectionSum += strength;
        if (strength >= threshold) {
          strongConnections++;
        }
      }
    }
  }

  const maxConnections = (agents.length * (agents.length - 1)) / 2;
  const density = totalConnections / maxConnections;
  const avgStrength = totalConnections > 0 ? connectionSum / totalConnections : 0;

  return {
    totalAgents: agents.length,
    clusters: Object.keys(clusterMap).length,
    clusterDistribution: clusterMap,
    totalConnections,
    strongConnections,
    networkDensity: (density * 100).toFixed(2) + '%',
    avgConnectionStrength: avgStrength.toFixed(3),
  };
}

function runTest(name, params) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`TEST: ${name}`);
  console.log(`${'='.repeat(70)}`);
  console.log('Parameters:', JSON.stringify(params, null, 2));

  const startTime = Date.now();

  // Generate agents
  const agentData = generateAgentPopulation(
    params.numAgents,
    params.dimension,
    params.numClusters
  );

  // Generate topics
  const topics = generateTopics(
    params.dimension,
    params.scenario || 'A',
    agentData.clusterCenters
  );

  // Run simulation
  const result = runSimulation(
    agentData.agents,
    topics,
    params.cycles,
    params.threshold,
    params.recalculateAfter || 0
  );

  const duration = Date.now() - startTime;

  // Calculate stats
  const stats = calculateStats(result.agents, result.connections, params.threshold);

  console.log('\nResults:');
  console.log('  Total Agents:', stats.totalAgents);
  console.log('  Clusters:', stats.clusters);
  console.log('  Cluster Distribution:', stats.clusterDistribution);
  console.log('  Total Connections:', stats.totalConnections);
  console.log('  Strong Connections (>= threshold):', stats.strongConnections);
  console.log('  Network Density:', stats.networkDensity);
  console.log('  Average Connection Strength:', stats.avgConnectionStrength);
  console.log('  Execution Time:', duration + 'ms');

  return { params, stats, duration };
}

// Test configurations
const tests = [
  {
    name: 'Test Run 1: Small Population',
    params: {
      numAgents: 30,
      dimension: 10,
      numClusters: 2,
      cycles: 20,
      threshold: 0.5,
    },
  },
  {
    name: 'Test Run 2: Medium Population',
    params: {
      numAgents: 100,
      dimension: 10,
      numClusters: 3,
      cycles: 30,
      threshold: 0.6,
    },
  },
  {
    name: 'Test Run 3: Large Population with Recalculation',
    params: {
      numAgents: 150,
      dimension: 10,
      numClusters: 5,
      cycles: 50,
      threshold: 0.5,
      recalculateAfter: 10,
    },
  },
  {
    name: 'Test Run 4: High-Dimensional Vectors',
    params: {
      numAgents: 80,
      dimension: 30,
      numClusters: 4,
      cycles: 25,
      threshold: 0.4,
    },
  },
];

// Run all tests
console.log('\n' + '='.repeat(70));
console.log('AUTOMATED SIMULATION COMPARISON');
console.log('='.repeat(70));

const results = [];
for (const test of tests) {
  const result = runTest(test.name, test.params);
  results.push(result);
}

// Summary
console.log('\n' + '='.repeat(70));
console.log('SUMMARY');
console.log('='.repeat(70));

results.forEach((result, index) => {
  console.log(`\n${index + 1}. ${tests[index].name}`);
  console.log(`   Agents: ${result.stats.totalAgents}, Clusters: ${result.stats.clusters}`);
  console.log(`   Connections: ${result.stats.totalConnections}, Density: ${result.stats.networkDensity}`);
  console.log(`   Duration: ${result.duration}ms`);
});

console.log('\n' + '='.repeat(70));
console.log('All tests completed successfully!');
console.log('='.repeat(70) + '\n');

