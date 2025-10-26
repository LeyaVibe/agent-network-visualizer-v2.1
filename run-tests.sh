#!/bin/bash

# Quick Test Runner for Agent Network Visualizer
# Usage: ./run-tests.sh [option]

echo "🧪 Agent Network Visualizer - Test Runner"
echo "=========================================="
echo ""

case "$1" in
  "unit")
    echo "Running unit tests only..."
    pnpm vitest run src/test/agentSimulation.test.js
    ;;
  "integration")
    echo "Running integration tests only..."
    pnpm vitest run src/test/simulation.integration.test.js
    ;;
  "scenarios")
    echo "Running scenario tests only..."
    pnpm vitest run src/test/scenarios.test.js
    ;;
  "watch")
    echo "Running tests in watch mode..."
    pnpm vitest
    ;;
  "coverage")
    echo "Running tests with coverage..."
    pnpm test:coverage
    ;;
  "quick")
    echo "Running quick smoke tests..."
    pnpm vitest run --reporter=dot
    ;;
  *)
    echo "Running all tests..."
    pnpm test:run
    ;;
esac

echo ""
echo "✅ Test run complete!"

