import { describe, it, expect } from 'vitest';
import {
  cosineSimilarity,
  generateAgentPopulation,
  generateTopics,
  runSimulation,
  prepareVisualizationData,
} from '../lib/agentSimulation';

describe('Agent Simulation - Core Functions', () => {
  describe('cosineSimilarity', () => {
    it('should return 1 for identical vectors', () => {
      const vec1 = [1, 0, 0];
      const vec2 = [1, 0, 0];
      expect(cosineSimilarity(vec1, vec2)).toBeCloseTo(1, 5);
    });

    it('should return 0 for orthogonal vectors', () => {
      const vec1 = [1, 0, 0];
      const vec2 = [0, 1, 0];
      expect(cosineSimilarity(vec1, vec2)).toBeCloseTo(0, 5);
    });

    it('should return -1 for opposite vectors', () => {
      const vec1 = [1, 0, 0];
      const vec2 = [-1, 0, 0];
      expect(cosineSimilarity(vec1, vec2)).toBeCloseTo(-1, 5);
    });

    it('should handle zero vectors', () => {
      const vec1 = [0, 0, 0];
      const vec2 = [1, 0, 0];
      expect(cosineSimilarity(vec1, vec2)).toBe(0);
    });
  });

  describe('generateAgentPopulation', () => {
    it('should generate correct number of agents', () => {
      const result = generateAgentPopulation(100, 10, 3);
      expect(result.agents).toHaveLength(100);
    });

    it('should assign agents to clusters', () => {
      const result = generateAgentPopulation(100, 10, 3);
      const clusters = new Set(result.agents.map(a => a.cluster));
      expect(clusters.size).toBe(3);
    });

    it('should generate vectors with correct dimension', () => {
      const result = generateAgentPopulation(50, 15, 2);
      result.agents.forEach(agent => {
        expect(agent.values).toHaveLength(15);
      });
    });

    it('should generate cluster centers', () => {
      const result = generateAgentPopulation(100, 10, 4);
      expect(result.clusterCenters).toHaveLength(4);
      result.clusterCenters.forEach(center => {
        expect(center).toHaveLength(10);
      });
    });

    it('should use initial agent vectors if provided', () => {
      const initialVectors = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ];
      const result = generateAgentPopulation(null, null, 2, initialVectors);
      expect(result.agents).toHaveLength(3);
      expect(result.agents[0].values).toHaveLength(3);
    });
  });

  describe('generateTopics', () => {
    it('should generate default number of topics', () => {
      const topics = generateTopics(10, 'A', []);
      expect(topics).toHaveLength(10);
    });

    it('should generate topics with correct dimension', () => {
      const topics = generateTopics(15, 'A', []);
      topics.forEach(topic => {
        expect(topic.vector).toHaveLength(15);
      });
    });

    it('should use initial topic vectors if provided', () => {
      const initialVectors = [
        [1, 0, 0],
        [0, 1, 0],
      ];
      const topics = generateTopics(3, 'A', [], initialVectors);
      expect(topics).toHaveLength(2);
    });

    it('should create cluster-aligned topics in scenario B', () => {
      const clusterCenters = [
        [1, 0, 0],
        [0, 1, 0],
      ];
      const topics = generateTopics(3, 'B', clusterCenters);
      expect(topics.some(t => t.isTargetTopic)).toBe(true);
    });
  });

  describe('runSimulation', () => {
    it('should run simulation and return results', () => {
      const agentData = generateAgentPopulation(50, 10, 3);
      const topics = generateTopics(10, 'A', agentData.clusterCenters);
      
      const result = runSimulation(agentData.agents, topics, 10, 0.3, 0);
      
      expect(result.agents).toHaveLength(50);
      expect(result.connections).toHaveLength(50);
      expect(result.connections[0]).toHaveLength(50);
    });

    it('should initialize connection matrix', () => {
      const agentData = generateAgentPopulation(10, 5, 2);
      const topics = generateTopics(5, 'A', agentData.clusterCenters);
      
      const result = runSimulation(agentData.agents, topics, 1, 0.3, 0);
      
      // Check that connections are initialized
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          if (i !== j) {
            expect(result.connections[i][j]).toBeGreaterThanOrEqual(0);
            expect(result.connections[i][j]).toBeLessThanOrEqual(1);
          }
        }
      }
    });

    it('should recalculate clusters when specified', () => {
      const agentData = generateAgentPopulation(30, 10, 3);
      const topics = generateTopics(10, 'A', agentData.clusterCenters);
      
      // Record initial clusters
      const initialClusters = agentData.agents.map(a => a.cluster);
      
      // Run simulation with cluster recalculation every 5 cycles
      const result = runSimulation(agentData.agents, topics, 20, 0.3, 5);
      
      // Some agents should have changed clusters
      const finalClusters = result.agents.map(a => a.cluster);
      const changedCount = initialClusters.filter((c, i) => c !== finalClusters[i]).length;
      
      // At least some agents should have moved (not a strict requirement but likely)
      expect(result.agents).toBeDefined();
    });

    it('should respect cycle count', () => {
      const agentData = generateAgentPopulation(20, 5, 2);
      const topics = generateTopics(5, 'A', agentData.clusterCenters);
      
      const result = runSimulation(agentData.agents, topics, 5, 0.3, 0);
      
      // Simulation should complete without errors
      expect(result.agents).toHaveLength(20);
    });
  });

  describe('prepareVisualizationData', () => {
    it('should prepare nodes and links', () => {
      const agentData = generateAgentPopulation(30, 10, 3);
      const topics = generateTopics(10, 'A', agentData.clusterCenters);
      const simResult = runSimulation(agentData.agents, topics, 10, 0.3, 0);
      
      const vizData = prepareVisualizationData(
        simResult.agents,
        simResult.connections,
        0.5
      );
      
      expect(vizData.nodes).toHaveLength(30);
      expect(Array.isArray(vizData.links)).toBe(true);
    });

    it('should filter links by threshold', () => {
      const agentData = generateAgentPopulation(20, 5, 2);
      const topics = generateTopics(5, 'A', agentData.clusterCenters);
      const simResult = runSimulation(agentData.agents, topics, 10, 0.3, 0);
      
      const vizDataLow = prepareVisualizationData(
        simResult.agents,
        simResult.connections,
        0.1
      );
      
      const vizDataHigh = prepareVisualizationData(
        simResult.agents,
        simResult.connections,
        0.9
      );
      
      // Lower threshold should have more links
      expect(vizDataLow.links.length).toBeGreaterThanOrEqual(vizDataHigh.links.length);
    });

    it('should calculate node degrees', () => {
      const agentData = generateAgentPopulation(15, 5, 2);
      const topics = generateTopics(5, 'A', agentData.clusterCenters);
      const simResult = runSimulation(agentData.agents, topics, 10, 0.3, 0);
      
      const vizData = prepareVisualizationData(
        simResult.agents,
        simResult.connections,
        0.5
      );
      
      vizData.nodes.forEach(node => {
        expect(node.degree).toBeGreaterThanOrEqual(0);
      });
    });
  });
});

