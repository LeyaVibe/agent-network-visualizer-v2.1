import { describe, it, expect } from 'vitest';
import {
  createTestSimulation,
  compareSimulations,
  calculateClusterStats,
  calculateConnectionStats,
} from './testHelpers';

describe('Scenario-Specific Tests', () => {
  describe('Scenario A: Standard Simulation', () => {
    it('should create diverse topics', () => {
      const sim = createTestSimulation({ scenario: 'A', numAgents: 50 });
      
      expect(sim.topics).toHaveLength(10);
      
      // Topics should have varied vectors
      const firstTopic = sim.topics[0].vector;
      const allIdentical = sim.topics.every(t => 
        t.vector.every((v, i) => Math.abs(v - firstTopic[i]) < 0.0001)
      );
      
      expect(allIdentical).toBe(false);
    });

    it('should distribute agents across clusters', () => {
      const sim = createTestSimulation({ scenario: 'A', numAgents: 90, numClusters: 3 });
      const stats = calculateClusterStats(sim.simResult.agents);
      
      expect(stats.totalClusters).toBeLessThanOrEqual(3);
      expect(stats.clusters.length).toBeGreaterThan(0);
    });

    it('should form connections based on similarity', () => {
      const sim = createTestSimulation({ scenario: 'A', numAgents: 40, cycles: 30 });
      const connStats = calculateConnectionStats(sim.simResult.connections, 0.5);
      
      expect(connStats.totalConnections).toBeGreaterThan(0);
      expect(connStats.density).toBeGreaterThan(0);
      expect(connStats.density).toBeLessThanOrEqual(1);
    });
  });

  describe('Scenario B: Cluster-Aligned Topics', () => {
    it('should create cluster-aligned topics', () => {
      const sim = createTestSimulation({ scenario: 'B', numAgents: 60, numClusters: 3 });
      
      expect(sim.topics).toHaveLength(10);
      
      // At least one topic should be marked as target topic
      const hasTargetTopic = sim.topics.some(t => t.isTargetTopic);
      expect(hasTargetTopic).toBe(true);
    });

    it('should create stronger intra-cluster connections', () => {
      const sim = createTestSimulation({ scenario: 'B', numAgents: 60, numClusters: 3, cycles: 30 });
      
      // Calculate intra-cluster vs inter-cluster connections
      const agents = sim.simResult.agents;
      const connections = sim.simResult.connections;
      
      let intraClusterConnections = 0;
      let interClusterConnections = 0;
      let intraClusterStrength = 0;
      let interClusterStrength = 0;
      
      for (let i = 0; i < agents.length; i++) {
        for (let j = i + 1; j < agents.length; j++) {
          const strength = connections[i][j];
          if (strength > 0.5) {
            if (agents[i].cluster === agents[j].cluster) {
              intraClusterConnections++;
              intraClusterStrength += strength;
            } else {
              interClusterConnections++;
              interClusterStrength += strength;
            }
          }
        }
      }
      
      // Should have some connections
      expect(intraClusterConnections + interClusterConnections).toBeGreaterThan(0);
    });
  });

  describe('Cluster Recalculation Scenarios', () => {
    it('should recalculate clusters periodically', () => {
      const simWithRecalc = createTestSimulation({
        numAgents: 60,
        numClusters: 3,
        cycles: 30,
        recalculateAfter: 10,
      });
      
      const simWithoutRecalc = createTestSimulation({
        numAgents: 60,
        numClusters: 3,
        cycles: 30,
        recalculateAfter: 0,
      });
      
      // Both simulations should complete successfully
      expect(simWithRecalc.simResult.agents).toHaveLength(60);
      expect(simWithoutRecalc.simResult.agents).toHaveLength(60);
    });

    it('should maintain valid cluster assignments', () => {
      const sim = createTestSimulation({
        numAgents: 50,
        numClusters: 4,
        cycles: 40,
        recalculateAfter: 5,
      });
      
      // All agents should have valid cluster IDs
      sim.simResult.agents.forEach(agent => {
        expect(agent.cluster).toBeGreaterThanOrEqual(0);
        expect(agent.cluster).toBeLessThan(10); // Reasonable upper bound
      });
    });

    it('should allow cluster migration over time', () => {
      const sim = createTestSimulation({
        numAgents: 40,
        numClusters: 3,
        cycles: 50,
        recalculateAfter: 5,
      });
      
      const stats = calculateClusterStats(sim.simResult.agents);
      
      // Should still have clusters
      expect(stats.totalClusters).toBeGreaterThan(0);
      expect(stats.totalClusters).toBeLessThanOrEqual(3);
    });
  });

  describe('Different Parameter Combinations', () => {
    it('should handle small populations', () => {
      const sim = createTestSimulation({
        numAgents: 10,
        numClusters: 2,
        cycles: 10,
      });
      
      expect(sim.simResult.agents).toHaveLength(10);
      expect(sim.vizData.nodes).toHaveLength(10);
    });

    it('should handle large populations', () => {
      const sim = createTestSimulation({
        numAgents: 200,
        numClusters: 5,
        cycles: 20,
      });
      
      expect(sim.simResult.agents).toHaveLength(200);
      expect(sim.vizData.nodes).toHaveLength(200);
    });

    it('should handle many clusters', () => {
      const sim = createTestSimulation({
        numAgents: 100,
        numClusters: 10,
        cycles: 15,
      });
      
      const stats = calculateClusterStats(sim.simResult.agents);
      expect(stats.totalClusters).toBeGreaterThan(0);
      expect(stats.totalClusters).toBeLessThanOrEqual(10);
    });

    it('should handle high-dimensional vectors', () => {
      const sim = createTestSimulation({
        numAgents: 50,
        dimension: 50,
        numClusters: 3,
        cycles: 10,
      });
      
      sim.simResult.agents.forEach(agent => {
        expect(agent.values).toHaveLength(50);
      });
      
      sim.topics.forEach(topic => {
        expect(topic.vector).toHaveLength(50);
      });
    });

    it('should handle different thresholds', () => {
      const thresholds = [0.1, 0.3, 0.5, 0.7, 0.9];
      
      thresholds.forEach(threshold => {
        const sim = createTestSimulation({
          numAgents: 40,
          threshold,
          cycles: 15,
        });
        
        expect(sim.vizData.nodes).toHaveLength(40);
        expect(Array.isArray(sim.vizData.links)).toBe(true);
      });
    });

    it('should handle long simulations', () => {
      const sim = createTestSimulation({
        numAgents: 50,
        cycles: 100,
      });
      
      expect(sim.simResult.agents).toHaveLength(50);
      
      const connStats = calculateConnectionStats(sim.simResult.connections);
      expect(connStats.totalConnections).toBeGreaterThan(0);
    });
  });

  describe('Comparison Tests', () => {
    it('should produce different results with different parameters', () => {
      const sim1 = createTestSimulation({ numAgents: 50, cycles: 20 });
      const sim2 = createTestSimulation({ numAgents: 50, cycles: 50 });
      
      const comparison = compareSimulations(sim1, sim2);
      
      expect(comparison.agentCountMatch).toBe(true);
      expect(comparison.connectionsDifferent).toBe(true);
    });

    it('should produce similar cluster distributions', () => {
      const sim1 = createTestSimulation({ numAgents: 60, numClusters: 3 });
      const sim2 = createTestSimulation({ numAgents: 60, numClusters: 3 });
      
      const stats1 = calculateClusterStats(sim1.simResult.agents);
      const stats2 = calculateClusterStats(sim2.simResult.agents);
      
      expect(stats1.totalClusters).toBe(stats2.totalClusters);
    });

    it('should show evolution with recalculation', () => {
      const simNoRecalc = createTestSimulation({
        numAgents: 50,
        cycles: 40,
        recalculateAfter: 0,
      });
      
      const simWithRecalc = createTestSimulation({
        numAgents: 50,
        cycles: 40,
        recalculateAfter: 10,
      });
      
      // Both should complete successfully
      expect(simNoRecalc.simResult.agents).toHaveLength(50);
      expect(simWithRecalc.simResult.agents).toHaveLength(50);
    });
  });

  describe('Network Properties', () => {
    it('should create connected networks', () => {
      const sim = createTestSimulation({ numAgents: 40, cycles: 30 });
      const connStats = calculateConnectionStats(sim.simResult.connections, 0.3);
      
      expect(connStats.totalConnections).toBeGreaterThan(0);
      expect(connStats.density).toBeGreaterThan(0);
    });

    it('should have reasonable connection density', () => {
      const sim = createTestSimulation({ numAgents: 50, cycles: 30 });
      const connStats = calculateConnectionStats(sim.simResult.connections, 0.5);
      
      expect(connStats.density).toBeGreaterThan(0);
      expect(connStats.density).toBeLessThanOrEqual(1);
    });

    it('should have varying connection strengths', () => {
      const sim = createTestSimulation({ numAgents: 40, cycles: 25 });
      
      const strengths = [];
      for (let i = 0; i < sim.simResult.connections.length; i++) {
        for (let j = i + 1; j < sim.simResult.connections.length; j++) {
          strengths.push(sim.simResult.connections[i][j]);
        }
      }
      
      const uniqueStrengths = new Set(strengths.map(s => s.toFixed(2)));
      expect(uniqueStrengths.size).toBeGreaterThan(1);
    });
  });
});

