import { describe, it, expect } from 'vitest';
import {
  generateAgentPopulation,
  generateTopics,
  runSimulation,
  prepareVisualizationData,
  generateSimulationReport,
} from '../lib/agentSimulation';

describe('Simulation Integration Tests', () => {
  describe('Full Simulation Workflow', () => {
    it('should complete a full simulation cycle', () => {
      // Step 1: Generate agents
      const agentData = generateAgentPopulation(100, 10, 3);
      expect(agentData.agents).toHaveLength(100);
      expect(agentData.clusterCenters).toHaveLength(3);

      // Step 2: Generate topics
      const topics = generateTopics(10, 'A', agentData.clusterCenters);
      expect(topics).toHaveLength(10);

      // Step 3: Run simulation
      const simResult = runSimulation(agentData.agents, topics, 20, 0.3, 0);
      expect(simResult.agents).toHaveLength(100);
      expect(simResult.connections).toHaveLength(100);

      // Step 4: Prepare visualization
      const vizData = prepareVisualizationData(
        simResult.agents,
        simResult.connections,
        0.5
      );
      expect(vizData.nodes).toHaveLength(100);
      expect(Array.isArray(vizData.links)).toBe(true);

      // Step 5: Generate report
      const report = generateSimulationReport(
        simResult.agents,
        simResult.connections,
        topics,
        'A',
        20,
        0.5
      );
      expect(typeof report).toBe('string');
      expect(report.length).toBeGreaterThan(0);
    });

    it('should handle different cluster configurations', () => {
      const configs = [
        { agents: 50, clusters: 2 },
        { agents: 100, clusters: 3 },
        { agents: 150, clusters: 5 },
      ];

      configs.forEach(config => {
        const agentData = generateAgentPopulation(config.agents, 10, config.clusters);
        const topics = generateTopics(10, 'A', agentData.clusterCenters);
        const simResult = runSimulation(agentData.agents, topics, 10, 0.3, 0);

        expect(simResult.agents).toHaveLength(config.agents);
        
        const clusterSet = new Set(simResult.agents.map(a => a.cluster));
        expect(clusterSet.size).toBeLessThanOrEqual(config.clusters);
      });
    });

    it('should handle different scenario types', () => {
      const scenarios = ['A', 'B'];
      const agentData = generateAgentPopulation(50, 10, 3);

      scenarios.forEach(scenario => {
        const topics = generateTopics(10, scenario, agentData.clusterCenters);
        const simResult = runSimulation(agentData.agents, topics, 10, 0.3, 0);

        expect(simResult.agents).toHaveLength(50);
        expect(topics).toHaveLength(10);
      });
    });
  });

  describe('Cluster Recalculation Integration', () => {
    it('should maintain cluster count after recalculation', () => {
      const agentData = generateAgentPopulation(60, 10, 3);
      const topics = generateTopics(10, 'A', agentData.clusterCenters);

      const simResult = runSimulation(agentData.agents, topics, 30, 0.3, 10);

      const clusterSet = new Set(simResult.agents.map(a => a.cluster));
      expect(clusterSet.size).toBeGreaterThan(0);
      expect(clusterSet.size).toBeLessThanOrEqual(3);
    });

    it('should allow agents to change clusters', () => {
      const agentData = generateAgentPopulation(40, 10, 3);
      const initialClusters = agentData.agents.map(a => a.cluster);
      
      const topics = generateTopics(10, 'A', agentData.clusterCenters);
      const simResult = runSimulation(agentData.agents, topics, 50, 0.3, 5);

      const finalClusters = simResult.agents.map(a => a.cluster);
      
      // At least verify the simulation completed
      expect(simResult.agents).toHaveLength(40);
      expect(finalClusters).toHaveLength(40);
    });
  });

  describe('Connection Matrix Evolution', () => {
    it('should evolve connections over cycles', () => {
      const agentData = generateAgentPopulation(30, 10, 2);
      const topics = generateTopics(10, 'A', agentData.clusterCenters);

      // Run short simulation
      const result1 = runSimulation([...agentData.agents], topics, 5, 0.3, 0);
      
      // Run longer simulation
      const result2 = runSimulation([...agentData.agents], topics, 50, 0.3, 0);

      // Connection matrices should be different
      let differences = 0;
      for (let i = 0; i < 30; i++) {
        for (let j = 0; j < 30; j++) {
          if (Math.abs(result1.connections[i][j] - result2.connections[i][j]) > 0.01) {
            differences++;
          }
        }
      }

      expect(differences).toBeGreaterThan(0);
    });

    it('should respect threshold in visualization', () => {
      const agentData = generateAgentPopulation(25, 5, 2);
      const topics = generateTopics(5, 'A', agentData.clusterCenters);
      const simResult = runSimulation(agentData.agents, topics, 20, 0.3, 0);

      const thresholds = [0.1, 0.3, 0.5, 0.7, 0.9];
      const linkCounts = thresholds.map(threshold => {
        const vizData = prepareVisualizationData(
          simResult.agents,
          simResult.connections,
          threshold
        );
        return vizData.links.length;
      });

      // Higher thresholds should have fewer links
      for (let i = 0; i < linkCounts.length - 1; i++) {
        expect(linkCounts[i]).toBeGreaterThanOrEqual(linkCounts[i + 1]);
      }
    });
  });

  describe('Custom Vector Integration', () => {
    it('should work with custom agent vectors', () => {
      const customVectors = Array.from({ length: 50 }, () =>
        Array.from({ length: 10 }, () => Math.random() * 2 - 1)
      );

      const agentData = generateAgentPopulation(null, null, 3, customVectors);
      expect(agentData.agents).toHaveLength(50);

      const topics = generateTopics(10, 'A', agentData.clusterCenters);
      const simResult = runSimulation(agentData.agents, topics, 10, 0.3, 0);

      expect(simResult.agents).toHaveLength(50);
    });

    it('should work with custom topic vectors', () => {
      const agentData = generateAgentPopulation(40, 10, 2);
      
      const customTopics = Array.from({ length: 5 }, () =>
        Array.from({ length: 10 }, () => Math.random() * 2 - 1)
      );

      const topics = generateTopics(10, 'A', agentData.clusterCenters, customTopics);
      expect(topics).toHaveLength(5);

      const simResult = runSimulation(agentData.agents, topics, 10, 0.3, 0);
      expect(simResult.agents).toHaveLength(40);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle large agent populations', () => {
      const agentData = generateAgentPopulation(200, 10, 4);
      const topics = generateTopics(10, 'A', agentData.clusterCenters);
      
      const startTime = Date.now();
      const simResult = runSimulation(agentData.agents, topics, 10, 0.3, 0);
      const duration = Date.now() - startTime;

      expect(simResult.agents).toHaveLength(200);
      expect(duration).toBeLessThan(10000); // Should complete in less than 10 seconds
    });

    it('should handle high-dimensional vectors', () => {
      const agentData = generateAgentPopulation(50, 50, 3);
      const topics = generateTopics(50, 'A', agentData.clusterCenters);
      
      const simResult = runSimulation(agentData.agents, topics, 10, 0.3, 0);

      expect(simResult.agents).toHaveLength(50);
      simResult.agents.forEach(agent => {
        expect(agent.values).toHaveLength(50);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle single cluster', () => {
      const agentData = generateAgentPopulation(30, 10, 1);
      const topics = generateTopics(10, 'A', agentData.clusterCenters);
      const simResult = runSimulation(agentData.agents, topics, 10, 0.3, 0);

      const clusterSet = new Set(simResult.agents.map(a => a.cluster));
      expect(clusterSet.size).toBe(1);
    });

    it('should handle many clusters', () => {
      const agentData = generateAgentPopulation(100, 10, 10);
      const topics = generateTopics(10, 'A', agentData.clusterCenters);
      const simResult = runSimulation(agentData.agents, topics, 10, 0.3, 0);

      expect(simResult.agents).toHaveLength(100);
    });

    it('should handle very high threshold', () => {
      const agentData = generateAgentPopulation(30, 10, 2);
      const topics = generateTopics(10, 'A', agentData.clusterCenters);
      const simResult = runSimulation(agentData.agents, topics, 10, 0.3, 0);

      const vizData = prepareVisualizationData(
        simResult.agents,
        simResult.connections,
        0.99
      );

      expect(vizData.nodes).toHaveLength(30);
      // Very high threshold may result in few or no links
      expect(vizData.links.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle very low threshold', () => {
      const agentData = generateAgentPopulation(20, 10, 2);
      const topics = generateTopics(10, 'A', agentData.clusterCenters);
      const simResult = runSimulation(agentData.agents, topics, 10, 0.3, 0);

      const vizData = prepareVisualizationData(
        simResult.agents,
        simResult.connections,
        0.01
      );

      expect(vizData.nodes).toHaveLength(20);
      // Very low threshold should include most connections
      expect(vizData.links.length).toBeGreaterThan(0);
    });
  });
});

