import { describe, it, expect } from 'vitest';
import {
  createTestSimulation,
  calculateClusterStats,
  calculateConnectionStats,
} from './testHelpers';

describe('Validation Tests - Comparing Different Parameters', () => {
  describe('Test Run 1: Small Population', () => {
    it('should handle 30 agents with 2 clusters', () => {
      const sim = createTestSimulation({
        numAgents: 30,
        numClusters: 2,
        cycles: 20,
        threshold: 0.5,
      });

      // Validate agents
      expect(sim.simResult.agents).toHaveLength(30);
      
      // Validate clusters
      const clusterStats = calculateClusterStats(sim.simResult.agents);
      expect(clusterStats.totalClusters).toBeGreaterThan(0);
      expect(clusterStats.totalClusters).toBeLessThanOrEqual(2);
      
      // Validate connections
      const connStats = calculateConnectionStats(sim.simResult.connections, 0.5);
      expect(connStats.totalConnections).toBeGreaterThan(0);
      expect(connStats.density).toBeGreaterThan(0);
      expect(connStats.density).toBeLessThanOrEqual(1);

      // Log results for manual verification
      console.log('\n=== Test Run 1: Small Population (30 agents, 2 clusters) ===');
      console.log('Agents:', sim.simResult.agents.length);
      console.log('Clusters:', clusterStats.totalClusters);
      console.log('Cluster distribution:', clusterStats.clusters.map(c => `Cluster ${c.clusterId}: ${c.count} agents`));
      console.log('Total connections:', connStats.totalConnections);
      console.log('Network density:', (connStats.density * 100).toFixed(2) + '%');
      console.log('Average connection strength:', connStats.averageStrength.toFixed(3));
    });
  });

  describe('Test Run 2: Medium Population', () => {
    it('should handle 100 agents with 3 clusters', () => {
      const sim = createTestSimulation({
        numAgents: 100,
        numClusters: 3,
        cycles: 30,
        threshold: 0.6,
      });

      expect(sim.simResult.agents).toHaveLength(100);
      
      const clusterStats = calculateClusterStats(sim.simResult.agents);
      expect(clusterStats.totalClusters).toBeGreaterThan(0);
      expect(clusterStats.totalClusters).toBeLessThanOrEqual(3);
      
      const connStats = calculateConnectionStats(sim.simResult.connections, 0.6);
      expect(connStats.totalConnections).toBeGreaterThan(0);

      console.log('\n=== Test Run 2: Medium Population (100 agents, 3 clusters) ===');
      console.log('Agents:', sim.simResult.agents.length);
      console.log('Clusters:', clusterStats.totalClusters);
      console.log('Cluster distribution:', clusterStats.clusters.map(c => `Cluster ${c.clusterId}: ${c.count} agents`));
      console.log('Total connections:', connStats.totalConnections);
      console.log('Network density:', (connStats.density * 100).toFixed(2) + '%');
      console.log('Average connection strength:', connStats.averageStrength.toFixed(3));
      console.log('Strong connections (>= 0.6):', connStats.strongConnections);
    });
  });

  describe('Test Run 3: Large Population with Cluster Recalculation', () => {
    it('should handle 150 agents with 5 clusters and recalculation', () => {
      const sim = createTestSimulation({
        numAgents: 150,
        numClusters: 5,
        cycles: 50,
        threshold: 0.5,
        recalculateAfter: 10,
      });

      expect(sim.simResult.agents).toHaveLength(150);
      
      const clusterStats = calculateClusterStats(sim.simResult.agents);
      expect(clusterStats.totalClusters).toBeGreaterThan(0);
      expect(clusterStats.totalClusters).toBeLessThanOrEqual(5);
      
      const connStats = calculateConnectionStats(sim.simResult.connections, 0.5);
      expect(connStats.totalConnections).toBeGreaterThan(0);

      console.log('\n=== Test Run 3: Large Population (150 agents, 5 clusters, recalc every 10) ===');
      console.log('Agents:', sim.simResult.agents.length);
      console.log('Clusters:', clusterStats.totalClusters);
      console.log('Cluster distribution:', clusterStats.clusters.map(c => `Cluster ${c.clusterId}: ${c.count} agents`));
      console.log('Min cluster size:', clusterStats.minSize);
      console.log('Max cluster size:', clusterStats.maxSize);
      console.log('Average cluster size:', clusterStats.averageSize.toFixed(1));
      console.log('Total connections:', connStats.totalConnections);
      console.log('Network density:', (connStats.density * 100).toFixed(2) + '%');
      console.log('Average connection strength:', connStats.averageStrength.toFixed(3));
    });
  });

  describe('Test Run 4: High-Dimensional Vectors', () => {
    it('should handle 80 agents with 30-dimensional vectors', () => {
      const sim = createTestSimulation({
        numAgents: 80,
        dimension: 30,
        numClusters: 4,
        cycles: 25,
        threshold: 0.4,
      });

      expect(sim.simResult.agents).toHaveLength(80);
      
      // Validate vector dimensions
      sim.simResult.agents.forEach(agent => {
        expect(agent.values).toHaveLength(30);
      });
      
      sim.topics.forEach(topic => {
        expect(topic.vector).toHaveLength(30);
      });
      
      const clusterStats = calculateClusterStats(sim.simResult.agents);
      const connStats = calculateConnectionStats(sim.simResult.connections, 0.4);

      console.log('\n=== Test Run 4: High-Dimensional (80 agents, 30D vectors, 4 clusters) ===');
      console.log('Agents:', sim.simResult.agents.length);
      console.log('Vector dimension:', sim.simResult.agents[0].values.length);
      console.log('Topics:', sim.topics.length);
      console.log('Clusters:', clusterStats.totalClusters);
      console.log('Cluster distribution:', clusterStats.clusters.map(c => `Cluster ${c.clusterId}: ${c.count} agents`));
      console.log('Total connections:', connStats.totalConnections);
      console.log('Network density:', (connStats.density * 100).toFixed(2) + '%');
      console.log('Average connection strength:', connStats.averageStrength.toFixed(3));
    });
  });

  describe('Comparison Tests: Different Thresholds', () => {
    it('should show different network densities with different thresholds', () => {
      const baseParams = {
        numAgents: 60,
        numClusters: 3,
        cycles: 30,
      };

      const sim1 = createTestSimulation({ ...baseParams, threshold: 0.3 });
      const sim2 = createTestSimulation({ ...baseParams, threshold: 0.5 });
      const sim3 = createTestSimulation({ ...baseParams, threshold: 0.7 });

      const stats1 = calculateConnectionStats(sim1.simResult.connections, 0.3);
      const stats2 = calculateConnectionStats(sim2.simResult.connections, 0.5);
      const stats3 = calculateConnectionStats(sim3.simResult.connections, 0.7);

      console.log('\n=== Comparison: Different Thresholds (60 agents, 3 clusters) ===');
      console.log('Threshold 0.3:');
      console.log('  - Strong connections:', stats1.strongConnections);
      console.log('  - Network density:', (stats1.density * 100).toFixed(2) + '%');
      console.log('Threshold 0.5:');
      console.log('  - Strong connections:', stats2.strongConnections);
      console.log('  - Network density:', (stats2.density * 100).toFixed(2) + '%');
      console.log('Threshold 0.7:');
      console.log('  - Strong connections:', stats3.strongConnections);
      console.log('  - Network density:', (stats3.density * 100).toFixed(2) + '%');

      // Higher threshold should result in fewer strong connections
      expect(stats1.strongConnections).toBeGreaterThanOrEqual(stats2.strongConnections);
      expect(stats2.strongConnections).toBeGreaterThanOrEqual(stats3.strongConnections);
    });
  });

  describe('Comparison Tests: Different Cycle Counts', () => {
    it('should show evolution over different cycle counts', () => {
      const baseParams = {
        numAgents: 50,
        numClusters: 3,
        threshold: 0.5,
      };

      const sim1 = createTestSimulation({ ...baseParams, cycles: 10 });
      const sim2 = createTestSimulation({ ...baseParams, cycles: 30 });
      const sim3 = createTestSimulation({ ...baseParams, cycles: 50 });

      const stats1 = calculateConnectionStats(sim1.simResult.connections, 0.5);
      const stats2 = calculateConnectionStats(sim2.simResult.connections, 0.5);
      const stats3 = calculateConnectionStats(sim3.simResult.connections, 0.5);

      console.log('\n=== Comparison: Different Cycle Counts (50 agents, 3 clusters) ===');
      console.log('10 cycles:');
      console.log('  - Total connections:', stats1.totalConnections);
      console.log('  - Average strength:', stats1.averageStrength.toFixed(3));
      console.log('30 cycles:');
      console.log('  - Total connections:', stats2.totalConnections);
      console.log('  - Average strength:', stats2.averageStrength.toFixed(3));
      console.log('50 cycles:');
      console.log('  - Total connections:', stats3.totalConnections);
      console.log('  - Average strength:', stats3.averageStrength.toFixed(3));

      // All should have connections
      expect(stats1.totalConnections).toBeGreaterThan(0);
      expect(stats2.totalConnections).toBeGreaterThan(0);
      expect(stats3.totalConnections).toBeGreaterThan(0);
    });
  });

  describe('Comparison Tests: With and Without Cluster Recalculation', () => {
    it('should compare simulations with and without recalculation', () => {
      const baseParams = {
        numAgents: 70,
        numClusters: 3,
        cycles: 40,
        threshold: 0.5,
      };

      const simNoRecalc = createTestSimulation({ ...baseParams, recalculateAfter: 0 });
      const simWithRecalc = createTestSimulation({ ...baseParams, recalculateAfter: 10 });

      const statsNoRecalc = calculateClusterStats(simNoRecalc.simResult.agents);
      const statsWithRecalc = calculateClusterStats(simWithRecalc.simResult.agents);

      const connNoRecalc = calculateConnectionStats(simNoRecalc.simResult.connections, 0.5);
      const connWithRecalc = calculateConnectionStats(simWithRecalc.simResult.connections, 0.5);

      console.log('\n=== Comparison: With/Without Cluster Recalculation (70 agents) ===');
      console.log('Without recalculation:');
      console.log('  - Clusters:', statsNoRecalc.totalClusters);
      console.log('  - Cluster sizes:', statsNoRecalc.clusters.map(c => c.count));
      console.log('  - Network density:', (connNoRecalc.density * 100).toFixed(2) + '%');
      console.log('With recalculation (every 10 cycles):');
      console.log('  - Clusters:', statsWithRecalc.totalClusters);
      console.log('  - Cluster sizes:', statsWithRecalc.clusters.map(c => c.count));
      console.log('  - Network density:', (connWithRecalc.density * 100).toFixed(2) + '%');

      // Both should have valid cluster counts
      expect(statsNoRecalc.totalClusters).toBeGreaterThan(0);
      expect(statsWithRecalc.totalClusters).toBeGreaterThan(0);
    });
  });
});

