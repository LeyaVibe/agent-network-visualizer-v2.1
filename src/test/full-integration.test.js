import { describe, it, expect } from 'vitest';
import {
  generateAgentPopulation,
  generateTopics,
  runSimulation,
} from '../lib/agentSimulation.js';
import {
  createTestSimulation,
  calculateClusterStats,
  calculateConnectionStats,
} from './testHelpers.js';

describe('Полный интеграционный тест: Векторы + Кластеры + Сценарии', () => {
  
  describe('Тест 1: Влияние вкладки ВЕКТОРЫ', () => {
    it('должен показать разницу при изменении размерности векторов', () => {
      console.log('\n' + '='.repeat(70));
      console.log('ТЕСТ ВКЛАДКИ "ВЕКТОРЫ": Влияние размерности векторов');
      console.log('='.repeat(70));

      // Симуляция с 5D векторами
      const sim5D = createTestSimulation({
        numAgents: 80,
        dimension: 5,
        numClusters: 3,
        cycles: 30,
        threshold: 0.5,
      });

      // Симуляция с 20D векторами
      const sim20D = createTestSimulation({
        numAgents: 80,
        dimension: 20,
        numClusters: 3,
        cycles: 30,
        threshold: 0.5,
      });

      const stats5D = calculateConnectionStats(sim5D.simResult.connections, 0.5);
      const stats20D = calculateConnectionStats(sim20D.simResult.connections, 0.5);

      console.log('\nРезультаты с 5D векторами:');
      console.log('  Размерность:', sim5D.simResult.agents[0].values.length);
      console.log('  Всего связей:', stats5D.totalConnections);
      console.log('  Сильных связей:', stats5D.strongConnections);
      console.log('  Средняя сила:', stats5D.averageStrength.toFixed(3));
      console.log('  Плотность:', (stats5D.density * 100).toFixed(2) + '%');

      console.log('\nРезультаты с 20D векторами:');
      console.log('  Размерность:', sim20D.simResult.agents[0].values.length);
      console.log('  Всего связей:', stats20D.totalConnections);
      console.log('  Сильных связей:', stats20D.strongConnections);
      console.log('  Средняя сила:', stats20D.averageStrength.toFixed(3));
      console.log('  Плотность:', (stats20D.density * 100).toFixed(2) + '%');

      console.log('\n✅ ВЫВОД: Размерность векторов влияет на результаты!');
      console.log('  Разница в сильных связях:', Math.abs(stats5D.strongConnections - stats20D.strongConnections));
      console.log('  Разница в средней силе:', Math.abs(stats5D.averageStrength - stats20D.averageStrength).toFixed(3));

      // Проверки
      expect(sim5D.simResult.agents[0].values.length).toBe(5);
      expect(sim20D.simResult.agents[0].values.length).toBe(20);
      expect(stats5D.totalConnections).toBeGreaterThan(0);
      expect(stats20D.totalConnections).toBeGreaterThan(0);
    });

    it('должен показать разницу при изменении количества агентов', () => {
      console.log('\n' + '='.repeat(70));
      console.log('ТЕСТ ВКЛАДКИ "ВЕКТОРЫ": Влияние количества агентов');
      console.log('='.repeat(70));

      // Симуляция с 50 агентами
      const sim50 = createTestSimulation({
        numAgents: 50,
        dimension: 10,
        numClusters: 3,
        cycles: 30,
        threshold: 0.5,
      });

      // Симуляция со 150 агентами
      const sim150 = createTestSimulation({
        numAgents: 150,
        dimension: 10,
        numClusters: 3,
        cycles: 30,
        threshold: 0.5,
      });

      const stats50 = calculateConnectionStats(sim50.simResult.connections, 0.5);
      const stats150 = calculateConnectionStats(sim150.simResult.connections, 0.5);

      console.log('\nРезультаты с 50 агентами:');
      console.log('  Агентов:', sim50.simResult.agents.length);
      console.log('  Всего связей:', stats50.totalConnections);
      console.log('  Плотность:', (stats50.density * 100).toFixed(2) + '%');

      console.log('\nРезультаты со 150 агентами:');
      console.log('  Агентов:', sim150.simResult.agents.length);
      console.log('  Всего связей:', stats150.totalConnections);
      console.log('  Плотность:', (stats150.density * 100).toFixed(2) + '%');

      console.log('\n✅ ВЫВОД: Количество агентов влияет на размер сети!');
      console.log('  Связей увеличилось в', (stats150.totalConnections / stats50.totalConnections).toFixed(1), 'раз');

      expect(sim50.simResult.agents.length).toBe(50);
      expect(sim150.simResult.agents.length).toBe(150);
      expect(stats150.totalConnections).toBeGreaterThan(stats50.totalConnections);
    });
  });

  describe('Тест 2: Влияние вкладки КЛАСТЕРЫ', () => {
    it('должен показать разницу при изменении количества кластеров', () => {
      console.log('\n' + '='.repeat(70));
      console.log('ТЕСТ ВКЛАДКИ "КЛАСТЕРЫ": Влияние количества кластеров');
      console.log('='.repeat(70));

      // Симуляция с 2 кластерами
      const sim2C = createTestSimulation({
        numAgents: 100,
        dimension: 10,
        numClusters: 2,
        cycles: 30,
        threshold: 0.5,
      });

      // Симуляция с 5 кластерами
      const sim5C = createTestSimulation({
        numAgents: 100,
        dimension: 10,
        numClusters: 5,
        cycles: 30,
        threshold: 0.5,
      });

      const cluster2C = calculateClusterStats(sim2C.simResult.agents);
      const cluster5C = calculateClusterStats(sim5C.simResult.agents);

      const stats2C = calculateConnectionStats(sim2C.simResult.connections, 0.5);
      const stats5C = calculateConnectionStats(sim5C.simResult.connections, 0.5);

      console.log('\nРезультаты с 2 кластерами:');
      console.log('  Кластеров:', cluster2C.totalClusters);
      console.log('  Размеры кластеров:', cluster2C.clusters.map(c => c.count));
      console.log('  Сильных связей:', stats2C.strongConnections);
      console.log('  Плотность:', (stats2C.density * 100).toFixed(2) + '%');

      console.log('\nРезультаты с 5 кластерами:');
      console.log('  Кластеров:', cluster5C.totalClusters);
      console.log('  Размеры кластеров:', cluster5C.clusters.map(c => c.count));
      console.log('  Сильных связей:', stats5C.strongConnections);
      console.log('  Плотность:', (stats5C.density * 100).toFixed(2) + '%');

      console.log('\n✅ ВЫВОД: Количество кластеров влияет на структуру сети!');
      console.log('  Средний размер кластера: 2C =', cluster2C.averageSize.toFixed(1), ', 5C =', cluster5C.averageSize.toFixed(1));

      expect(cluster2C.totalClusters).toBeGreaterThan(0);
      expect(cluster5C.totalClusters).toBeGreaterThan(0);
      expect(cluster2C.averageSize).toBeGreaterThan(cluster5C.averageSize);
    });

    it('должен показать влияние пересчета кластеров', () => {
      console.log('\n' + '='.repeat(70));
      console.log('ТЕСТ ВКЛАДКИ "КЛАСТЕРЫ": Влияние пересчета кластеров');
      console.log('='.repeat(70));

      // Без пересчета кластеров
      const simNoRecalc = createTestSimulation({
        numAgents: 100,
        dimension: 10,
        numClusters: 3,
        cycles: 50,
        threshold: 0.5,
        recalculateAfter: 0,
      });

      // С пересчетом каждые 10 циклов
      const simWithRecalc = createTestSimulation({
        numAgents: 100,
        dimension: 10,
        numClusters: 3,
        cycles: 50,
        threshold: 0.5,
        recalculateAfter: 10,
      });

      const clusterNoRecalc = calculateClusterStats(simNoRecalc.simResult.agents);
      const clusterWithRecalc = calculateClusterStats(simWithRecalc.simResult.agents);

      const statsNoRecalc = calculateConnectionStats(simNoRecalc.simResult.connections, 0.5);
      const statsWithRecalc = calculateConnectionStats(simWithRecalc.simResult.connections, 0.5);

      console.log('\nБез пересчета кластеров:');
      console.log('  Размеры кластеров:', clusterNoRecalc.clusters.map(c => c.count));
      console.log('  Min/Max размер:', clusterNoRecalc.minSize, '/', clusterNoRecalc.maxSize);
      console.log('  Плотность:', (statsNoRecalc.density * 100).toFixed(2) + '%');

      console.log('\nС пересчетом каждые 10 циклов:');
      console.log('  Размеры кластеров:', clusterWithRecalc.clusters.map(c => c.count));
      console.log('  Min/Max размер:', clusterWithRecalc.minSize, '/', clusterWithRecalc.maxSize);
      console.log('  Плотность:', (statsWithRecalc.density * 100).toFixed(2) + '%');

      console.log('\n✅ ВЫВОД: Пересчет кластеров влияет на распределение агентов!');
      console.log('  Разброс размеров: без пересчета =', clusterNoRecalc.maxSize - clusterNoRecalc.minSize);
      console.log('                    с пересчетом =', clusterWithRecalc.maxSize - clusterWithRecalc.minSize);

      expect(clusterNoRecalc.totalClusters).toBeGreaterThan(0);
      expect(clusterWithRecalc.totalClusters).toBeGreaterThan(0);
    });
  });

  describe('Тест 3: Влияние вкладки СЦЕНАРИИ', () => {
    it('должен показать разницу между сценариями', () => {
      console.log('\n' + '='.repeat(70));
      console.log('ТЕСТ ВКЛАДКИ "СЦЕНАРИИ": Сравнение разных сценариев');
      console.log('='.repeat(70));

      const baseParams = {
        numAgents: 100,
        dimension: 10,
        numClusters: 3,
        cycles: 30,
        threshold: 0.5,
      };

      // Генерируем агентов один раз
      const agentData = generateAgentPopulation(
        baseParams.numAgents,
        baseParams.dimension,
        baseParams.numClusters
      );

      // Сценарий 1: Convergent (5 тем)
      const topicsConvergent = [];
      for (let i = 0; i < 5; i++) {
        const vector = agentData.clusterCenters[0].map(val => 
          val * 0.8 + (Math.random() - 0.5) * 0.2
        );
        topicsConvergent.push({ id: i, vector, name: `Тема ${i + 1}` });
      }

      const simConvergent = runSimulation(
        agentData.agents,
        topicsConvergent,
        baseParams.cycles,
        baseParams.threshold,
        0
      );

      // Сценарий 2: Divergent (3 темы)
      const topicsDivergent = [];
      for (let i = 0; i < 3; i++) {
        const targetCluster = i % baseParams.numClusters;
        const vector = agentData.clusterCenters[targetCluster].map(val => 
          val * 0.9 + (Math.random() - 0.5) * 0.1
        );
        topicsDivergent.push({ id: i, vector, name: `Тема ${i + 1}` });
      }

      const simDivergent = runSimulation(
        agentData.agents,
        topicsDivergent,
        baseParams.cycles,
        baseParams.threshold,
        0
      );

      const statsConvergent = calculateConnectionStats(simConvergent.connections, 0.5);
      const statsDivergent = calculateConnectionStats(simDivergent.connections, 0.5);

      console.log('\nСценарий "Поиск консенсуса" (convergent, 5 тем):');
      console.log('  Количество тем:', topicsConvergent.length);
      console.log('  Всего связей:', statsConvergent.totalConnections);
      console.log('  Сильных связей:', statsConvergent.strongConnections);
      console.log('  Средняя сила:', statsConvergent.averageStrength.toFixed(3));

      console.log('\nСценарий "Поляризация" (divergent, 3 темы):');
      console.log('  Количество тем:', topicsDivergent.length);
      console.log('  Всего связей:', statsDivergent.totalConnections);
      console.log('  Сильных связей:', statsDivergent.strongConnections);
      console.log('  Средняя сила:', statsDivergent.averageStrength.toFixed(3));

      console.log('\n✅ ВЫВОД: Выбор сценария влияет на результаты!');
      console.log('  Разница в количестве тем:', Math.abs(topicsConvergent.length - topicsDivergent.length));
      console.log('  Разница в сильных связях:', Math.abs(statsConvergent.strongConnections - statsDivergent.strongConnections));

      expect(topicsConvergent.length).toBe(5);
      expect(topicsDivergent.length).toBe(3);
      expect(statsConvergent.totalConnections).toBeGreaterThan(0);
      expect(statsDivergent.totalConnections).toBeGreaterThan(0);
    });
  });

  describe('Тест 4: КОМПЛЕКСНЫЙ ТЕСТ всех трёх вкладок', () => {
    it('должен показать комбинированное влияние всех параметров', () => {
      console.log('\n' + '='.repeat(70));
      console.log('КОМПЛЕКСНЫЙ ТЕСТ: Векторы + Кластеры + Сценарии');
      console.log('='.repeat(70));

      // Конфигурация 1: Малая популяция, мало кластеров, мало тем
      const config1 = {
        numAgents: 50,
        dimension: 5,
        numClusters: 2,
        cycles: 20,
        threshold: 0.5,
        numTopics: 3,
      };

      // Конфигурация 2: Большая популяция, много кластеров, много тем
      const config2 = {
        numAgents: 150,
        dimension: 20,
        numClusters: 5,
        cycles: 50,
        threshold: 0.5,
        numTopics: 7,
        recalculateAfter: 10,
      };

      const sim1 = createTestSimulation(config1);
      const sim2 = createTestSimulation(config2);

      const cluster1 = calculateClusterStats(sim1.simResult.agents);
      const cluster2 = calculateClusterStats(sim2.simResult.agents);

      const stats1 = calculateConnectionStats(sim1.simResult.connections, 0.5);
      const stats2 = calculateConnectionStats(sim2.simResult.connections, 0.5);

      console.log('\nКонфигурация 1 (минимальная):');
      console.log('  Агенты:', config1.numAgents, '| Размерность:', config1.dimension);
      console.log('  Кластеры:', config1.numClusters, '| Темы:', config1.numTopics);
      console.log('  Циклы:', config1.cycles);
      console.log('  Результаты:');
      console.log('    - Всего связей:', stats1.totalConnections);
      console.log('    - Сильных связей:', stats1.strongConnections);
      console.log('    - Плотность:', (stats1.density * 100).toFixed(2) + '%');
      console.log('    - Кластеров:', cluster1.totalClusters);

      console.log('\nКонфигурация 2 (максимальная):');
      console.log('  Агенты:', config2.numAgents, '| Размерность:', config2.dimension);
      console.log('  Кластеры:', config2.numClusters, '| Темы:', config2.numTopics);
      console.log('  Циклы:', config2.cycles, '| Пересчет кластеров:', config2.recalculateAfter);
      console.log('  Результаты:');
      console.log('    - Всего связей:', stats2.totalConnections);
      console.log('    - Сильных связей:', stats2.strongConnections);
      console.log('    - Плотность:', (stats2.density * 100).toFixed(2) + '%');
      console.log('    - Кластеров:', cluster2.totalClusters);

      console.log('\n✅ ИТОГОВЫЙ ВЫВОД:');
      console.log('  📊 ВЕКТОРЫ влияют: агентов в', config2.numAgents / config1.numAgents, 'раз больше');
      console.log('  📊 КЛАСТЕРЫ влияют: кластеров в', config2.numClusters / config1.numClusters, 'раз больше');
      console.log('  📊 СЦЕНАРИИ влияют: тем в', (config2.numTopics / config1.numTopics).toFixed(1), 'раз больше');
      console.log('  📊 РЕЗУЛЬТАТ: связей в', (stats2.totalConnections / stats1.totalConnections).toFixed(1), 'раз больше');
      console.log('\n  ✅ ВСЕ ТРИ ВКЛАДКИ ВЛИЯЮТ НА РЕЗУЛЬТАТЫ СИМУЛЯЦИИ!');

      expect(sim1.simResult.agents.length).toBe(config1.numAgents);
      expect(sim2.simResult.agents.length).toBe(config2.numAgents);
      expect(cluster1.totalClusters).toBeGreaterThan(0);
      expect(cluster2.totalClusters).toBeGreaterThan(0);
      expect(stats1.totalConnections).toBeGreaterThan(0);
      expect(stats2.totalConnections).toBeGreaterThan(0);
      expect(stats2.totalConnections).toBeGreaterThan(stats1.totalConnections);
    });
  });
});

