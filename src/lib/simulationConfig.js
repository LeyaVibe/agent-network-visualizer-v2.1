/**
 * Simulation Configuration Module
 * Centralized configuration and validation for simulation parameters
 */

/**
 * Default simulation parameters
 */
export const DEFAULT_PARAMS = {
  agentCount: 150,
  vectorDimension: 10,
  numClusters: 3,
  cycles: 50,
  threshold: 0.5,
  recalculateClustersAfter: 0,
  scenario: 'A',
};

/**
 * Parameter constraints
 */
export const PARAM_CONSTRAINTS = {
  agentCount: { min: 1, max: 1000, step: 1 },
  vectorDimension: { min: 2, max: 100, step: 1 },
  numClusters: { min: 1, max: 20, step: 1 },
  cycles: { min: 1, max: 200, step: 1 },
  threshold: { min: 0, max: 1, step: 0.01 },
  recalculateClustersAfter: { min: 0, max: 100, step: 1 },
};

/**
 * Scenario definitions
 */
export const SCENARIOS = {
  A: {
    id: 'A',
    name: 'Standard Simulation',
    description: 'Diverse topics with random distribution',
  },
  B: {
    id: 'B',
    name: 'Cluster-Aligned Topics',
    description: 'Topics aligned with specific clusters',
  },
};

/**
 * Preset scenarios for EnhancedScenarioManager
 */
export const PRESET_SCENARIOS = [
  {
    id: 'consensus',
    name: 'Поиск консенсуса',
    description: 'Агенты стремятся к общему мнению по всем темам',
    topics: 5,
    proximitySettings: {
      type: 'convergent',
      strength: 0.8,
    },
    opinionDistribution: 'normal',
  },
  {
    id: 'polarization',
    name: 'Поляризация мнений',
    description: 'Формирование противоположных групп мнений',
    topics: 3,
    proximitySettings: {
      type: 'divergent',
      strength: 0.9,
    },
    opinionDistribution: 'bimodal',
  },
  {
    id: 'echo_chambers',
    name: 'Эхо-камеры',
    description: 'Изолированные группы с усилением собственных взглядов',
    topics: 7,
    proximitySettings: {
      type: 'cluster_isolated',
      strength: 0.7,
    },
    opinionDistribution: 'cluster_based',
  },
  {
    id: 'information_cascade',
    name: 'Информационный каскад',
    description: 'Быстрое распространение мнения через сеть',
    topics: 4,
    proximitySettings: {
      type: 'cascade',
      strength: 0.6,
    },
    opinionDistribution: 'random',
  },
];

/**
 * Validate simulation parameters
 * @param {Object} params - Parameters to validate
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export function validateParams(params) {
  const errors = [];

  // Check agent count
  if (params.agentCount < PARAM_CONSTRAINTS.agentCount.min) {
    errors.push(`Agent count must be at least ${PARAM_CONSTRAINTS.agentCount.min}`);
  }
  if (params.agentCount > PARAM_CONSTRAINTS.agentCount.max) {
    errors.push(`Agent count cannot exceed ${PARAM_CONSTRAINTS.agentCount.max}`);
  }

  // Check vector dimension
  if (params.vectorDimension < PARAM_CONSTRAINTS.vectorDimension.min) {
    errors.push(`Vector dimension must be at least ${PARAM_CONSTRAINTS.vectorDimension.min}`);
  }
  if (params.vectorDimension > PARAM_CONSTRAINTS.vectorDimension.max) {
    errors.push(`Vector dimension cannot exceed ${PARAM_CONSTRAINTS.vectorDimension.max}`);
  }

  // Check cluster count
  if (params.numClusters < PARAM_CONSTRAINTS.numClusters.min) {
    errors.push(`Number of clusters must be at least ${PARAM_CONSTRAINTS.numClusters.min}`);
  }
  if (params.numClusters > params.agentCount) {
    errors.push('Number of clusters cannot exceed number of agents');
  }

  // Check cycles
  if (params.cycles < PARAM_CONSTRAINTS.cycles.min) {
    errors.push(`Cycles must be at least ${PARAM_CONSTRAINTS.cycles.min}`);
  }
  if (params.cycles > PARAM_CONSTRAINTS.cycles.max) {
    errors.push(`Cycles cannot exceed ${PARAM_CONSTRAINTS.cycles.max}`);
  }

  // Check threshold
  if (params.threshold < PARAM_CONSTRAINTS.threshold.min || params.threshold > PARAM_CONSTRAINTS.threshold.max) {
    errors.push('Threshold must be between 0 and 1');
  }

  // Check recalculate after
  if (params.recalculateClustersAfter < 0) {
    errors.push('Recalculate clusters after must be non-negative');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Merge parameters with defaults
 * @param {Object} params - User-provided parameters
 * @returns {Object} - Complete parameters with defaults
 */
export function mergeWithDefaults(params = {}) {
  return {
    ...DEFAULT_PARAMS,
    ...params,
  };
}

/**
 * Sanitize parameters to ensure they're within constraints
 * @param {Object} params - Parameters to sanitize
 * @returns {Object} - Sanitized parameters
 */
export function sanitizeParams(params) {
  const sanitized = { ...params };

  // Clamp values to constraints
  Object.keys(PARAM_CONSTRAINTS).forEach(key => {
    if (sanitized[key] !== undefined) {
      const { min, max } = PARAM_CONSTRAINTS[key];
      sanitized[key] = Math.max(min, Math.min(max, sanitized[key]));
    }
  });

  // Ensure numClusters doesn't exceed agentCount
  if (sanitized.numClusters > sanitized.agentCount) {
    sanitized.numClusters = sanitized.agentCount;
  }

  return sanitized;
}

/**
 * Get scenario by ID
 * @param {string} scenarioId - Scenario ID
 * @returns {Object|null} - Scenario object or null if not found
 */
export function getScenario(scenarioId) {
  return SCENARIOS[scenarioId] || null;
}

/**
 * Get preset scenario by ID
 * @param {string} presetId - Preset scenario ID
 * @returns {Object|null} - Preset scenario object or null if not found
 */
export function getPresetScenario(presetId) {
  return PRESET_SCENARIOS.find(s => s.id === presetId) || null;
}

/**
 * Create a simulation configuration object
 * @param {Object} params - Simulation parameters
 * @returns {Object} - Complete configuration object
 */
export function createConfig(params = {}) {
  const merged = mergeWithDefaults(params);
  const sanitized = sanitizeParams(merged);
  const validation = validateParams(sanitized);

  return {
    params: sanitized,
    validation,
    scenario: getScenario(sanitized.scenario),
  };
}

