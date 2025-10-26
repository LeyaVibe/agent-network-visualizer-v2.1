# Quick Reference Guide - Agent Network Visualizer

## 🚀 Быстрый старт

### Запуск приложения
```bash
cd /home/ubuntu/agent-network-visualizer-v2.1
pnpm dev
```

### Запуск тестов
```bash
# Все тесты
./run-tests.sh

# Только unit-тесты
./run-tests.sh unit

# С покрытием
./run-tests.sh coverage
```

---

## 📁 Структура проекта

```
agent-network-visualizer-v2.1/
├── src/
│   ├── lib/
│   │   ├── agentSimulation.js       # Основная логика симуляции
│   │   ├── simulationConfig.js      # Конфигурация и валидация
│   │   └── simulationState.js       # Управление состоянием
│   ├── components/
│   │   ├── VectorManager.jsx        # Управление векторами
│   │   ├── ClusterManager.jsx       # Управление кластерами
│   │   └── EnhancedScenarioManager.jsx  # Сценарии
│   ├── test/
│   │   ├── agentSimulation.test.js  # Unit-тесты
│   │   ├── simulation.integration.test.js  # Интеграционные тесты
│   │   ├── scenarios.test.js        # Тесты сценариев
│   │   └── testHelpers.js           # Вспомогательные функции
│   └── App.jsx                      # Главный компонент
├── run-tests.sh                     # Скрипт запуска тестов
├── vitest.config.js                 # Конфигурация Vitest
└── package.json
```

---

## 🧪 Тестирование

### Статистика тестов
- **Всего тестов**: 55
- **Unit-тесты**: 20
- **Интеграционные тесты**: 15
- **Тесты сценариев**: 20

### Покрытие
- `agentSimulation.js`: Основные функции
- `simulationConfig.js`: Валидация параметров
- `simulationState.js`: Управление состоянием

---

## 🔧 Основные модули

### `simulationConfig.js`

**Валидация параметров:**
```javascript
import { validateParams, createConfig } from './lib/simulationConfig';

const params = {
  agentCount: 150,
  vectorDimension: 10,
  numClusters: 3,
  cycles: 50,
};

const config = createConfig(params);
if (!config.validation.valid) {
  console.error(config.validation.errors);
}
```

**Предустановленные сценарии:**
```javascript
import { PRESET_SCENARIOS, getPresetScenario } from './lib/simulationConfig';

const scenario = getPresetScenario('consensus');
console.log(scenario.name); // "Поиск консенсуса"
```

### `simulationState.js`

**Управление состоянием:**
```javascript
import { createInitialState, setRunning, setResults } from './lib/simulationState';

let state = createInitialState();
state = setRunning(state, true);
// ... run simulation ...
state = setResults(state, simulationResults);
```

**Получение сводки:**
```javascript
import { getSimulationSummary } from './lib/simulationState';

const summary = getSimulationSummary(state);
console.log(summary.totalAgents);
console.log(summary.networkDensity);
```

---

## 📝 Добавление новых функций

### 1. Добавить новый параметр

**В `simulationConfig.js`:**
```javascript
export const DEFAULT_PARAMS = {
  // ... existing params
  newParameter: 42,
};

export const PARAM_CONSTRAINTS = {
  // ... existing constraints
  newParameter: { min: 0, max: 100, step: 1 },
};
```

**Обновить валидацию:**
```javascript
export function validateParams(params) {
  // ... existing validation
  if (params.newParameter < 0 || params.newParameter > 100) {
    errors.push('New parameter must be between 0 and 100');
  }
  return { valid: errors.length === 0, errors };
}
```

### 2. Добавить новый тест

**Создать файл `src/test/newFeature.test.js`:**
```javascript
import { describe, it, expect } from 'vitest';
import { myNewFunction } from '../lib/agentSimulation';

describe('New Feature', () => {
  it('should work correctly', () => {
    const result = myNewFunction(input);
    expect(result).toBe(expectedOutput);
  });
});
```

**Запустить тест:**
```bash
pnpm vitest run src/test/newFeature.test.js
```

---

## 🐛 Отладка

### Запуск тестов в режиме отладки
```bash
pnpm vitest --inspect-brk
```

### Просмотр покрытия кода
```bash
./run-tests.sh coverage
# Откройте coverage/index.html в браузере
```

### Проверка конкретного теста
```bash
pnpm vitest run -t "should return 1 for identical vectors"
```

---

## 📊 Ключевые функции

### Генерация агентов
```javascript
import { generateAgentPopulation } from './lib/agentSimulation';

const agentData = generateAgentPopulation(
  150,  // количество агентов
  10,   // размерность вектора
  3     // количество кластеров
);
```

### Запуск симуляции
```javascript
import { runSimulation } from './lib/agentSimulation';

const result = runSimulation(
  agents,
  topics,
  50,   // циклы
  0.5,  // порог
  10    // пересчет кластеров каждые N циклов
);
```

### Подготовка визуализации
```javascript
import { prepareVisualizationData } from './lib/agentSimulation';

const vizData = prepareVisualizationData(
  agents,
  connections,
  0.5  // порог для отображения связей
);
```

---

## 🎯 Лучшие практики

1. **Всегда запускайте тесты перед коммитом**
   ```bash
   ./run-tests.sh
   ```

2. **Используйте `createTestSimulation()` для быстрого создания тестовых данных**
   ```javascript
   import { createTestSimulation } from './test/testHelpers';
   const sim = createTestSimulation({ numAgents: 50 });
   ```

3. **Валидируйте параметры перед запуском симуляции**
   ```javascript
   const config = createConfig(params);
   if (!config.validation.valid) {
     throw new Error(config.validation.errors.join(', '));
   }
   ```

4. **Используйте `isReadyToRun()` для проверки готовности**
   ```javascript
   if (isReadyToRun(state, params)) {
     // Запустить симуляцию
   }
   ```

---

## 🔍 Часто используемые команды

```bash
# Разработка
pnpm dev                    # Запустить dev-сервер
pnpm build                  # Собрать для продакшена
pnpm preview                # Предпросмотр сборки

# Тестирование
pnpm test                   # Интерактивный режим
pnpm test:run               # Один запуск
pnpm test:coverage          # С покрытием
./run-tests.sh unit         # Только unit-тесты

# Линтинг
pnpm lint                   # Проверить код
```

---

## 📚 Дополнительные ресурсы

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [D3.js Documentation](https://d3js.org/)

---

**Последнее обновление**: 21 октября 2025

