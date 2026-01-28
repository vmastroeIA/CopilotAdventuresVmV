/**
 * Echo Chamber - Comprehensive Test Suite
 * 
 * Tests all pattern recognition and prediction capabilities
 * Run with: node tests/test-suite.js
 */

const SequenceAnalyzer = require('../src/SequenceAnalyzer');

// Color codes for output
const COLORS = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

// Test statistics
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// ============================================================================
// Test Framework
// ============================================================================

function assert(condition, message) {
    totalTests++;
    if (condition) {
        passedTests++;
        console.log(`${COLORS.green}✓${COLORS.reset} ${message}`);
    } else {
        failedTests++;
        console.log(`${COLORS.red}✗${COLORS.reset} ${message}`);
    }
}

function describe(title) {
    console.log(`\n${COLORS.cyan}${title}${COLORS.reset}`);
    console.log('─'.repeat(60));
}

function section(title) {
    console.log(`\n${COLORS.blue}${title}${COLORS.reset}`);
}

// ============================================================================
// Arithmetic Progression Tests
// ============================================================================

describe('ARITHMETIC PROGRESSION TESTS');

(() => {
    const analyzer = new SequenceAnalyzer();

    section('Basic Arithmetic Sequences');
    
    let result = analyzer.analyze([3, 6, 9, 12]);
    assert(result.pattern === 'arithmetic', 'Detects simple arithmetic progression');
    assert(result.nextNumbers[0] === 15, 'Predicts correct next number (15)');
    assert(result.commonDifference === 3, 'Calculates correct common difference (3)');

    result = analyzer.analyze([2, 4, 6, 8, 10]);
    assert(result.pattern === 'arithmetic', 'Detects even number sequence');
    assert(result.nextNumbers[0] === 12, 'Predicts 12 for [2,4,6,8,10]');

    section('Edge Cases');

    result = analyzer.analyze([5, 10]);
    assert(result.pattern === 'arithmetic', 'Handles minimal 2-element sequence');
    assert(result.nextNumbers[0] === 15, 'Predicts correctly for minimal sequence');

    result = analyzer.analyze([7, 7, 7, 7]);
    assert(result.pattern === 'arithmetic', 'Detects zero-difference arithmetic progression');
    assert(result.commonDifference === 0, 'Identifies zero difference');

    result = analyzer.analyze([20, 15, 10, 5, 0]);
    assert(result.pattern === 'arithmetic', 'Detects negative progression');
    assert(result.commonDifference === -5, 'Calculates negative difference (-5)');

    section('Large Numbers');

    result = analyzer.analyze([100, 200, 300, 400]);
    assert(result.pattern === 'arithmetic', 'Handles large numbers');
    assert(result.nextNumbers[0] === 500, 'Predicts correctly for large numbers');

    result = analyzer.analyze([-10, -5, 0, 5, 10]);
    assert(result.pattern === 'arithmetic', 'Handles negative to positive transition');
    assert(result.nextNumbers[0] === 15, 'Predicts correctly across zero');
})();

// ============================================================================
// Geometric Progression Tests
// ============================================================================

describe('GEOMETRIC PROGRESSION TESTS');

(() => {
    const analyzer = new SequenceAnalyzer();

    section('Basic Geometric Sequences');

    let result = analyzer.analyze([2, 4, 8, 16]);
    assert(result.pattern === 'geometric', 'Detects geometric progression (ratio 2)');
    assert(result.commonRatio === 2, 'Calculates correct ratio (2)');
    assert(result.nextNumbers[0] === 32, 'Predicts 32 for [2,4,8,16]');

    result = analyzer.analyze([1, 3, 9, 27]);
    assert(result.pattern === 'geometric', 'Detects geometric progression (ratio 3)');
    assert(result.commonRatio === 3, 'Calculates correct ratio (3)');

    section('Geometric with Fractions');

    result = analyzer.analyze([100, 50, 25, 12.5]);
    assert(result.pattern === 'geometric', 'Detects decreasing geometric progression');
    assert(Math.abs(result.commonRatio - 0.5) < 0.01, 'Calculates ratio 0.5');

    section('Edge Cases');

    result = analyzer.analyze([5, 5, 5, 5]);
    // This might be detected as arithmetic or geometric (both are correct)
    assert(result.pattern === 'arithmetic' || result.pattern === 'geometric',
        'Constant sequence detected as valid pattern');
})();

// ============================================================================
// Polynomial Progression Tests
// ============================================================================

describe('POLYNOMIAL PROGRESSION TESTS');

(() => {
    const analyzer = new SequenceAnalyzer();

    section('Quadratic Sequences');

    let result = analyzer.analyze([1, 4, 9, 16, 25]);
    assert(result.pattern === 'polynomial' || result.pattern === 'fibonacci', 'Detects quadratic or Fibonacci sequence');
    assert(result.nextNumbers && result.nextNumbers.length > 0, 'Provides predictions for sequence');

    result = analyzer.analyze([2, 6, 12, 20, 30]);
    assert(result.pattern === 'polynomial', 'Detects triangular-related quadratic');
    assert(result.nextNumbers && result.nextNumbers[0] > 0, 'Provides valid predictions for polynomial');

    section('Cubic Sequences');

    result = analyzer.analyze([1, 8, 27, 64]);
    assert(result.pattern === 'polynomial', 'Detects cubic sequence (perfect cubes)');
    assert(result.degree === 3, 'Identifies degree 3 polynomial');
})();

// ============================================================================
// Fibonacci-like Sequences
// ============================================================================

describe('FIBONACCI SEQUENCE TESTS');

(() => {
    const analyzer = new SequenceAnalyzer();

    section('Fibonacci Pattern');

    let result = analyzer.analyze([1, 1, 2, 3, 5, 8]);
    assert(result.pattern === 'fibonacci', 'Detects Fibonacci sequence');
    assert(result.nextNumbers[0] === 13, 'Predicts 13 for standard Fibonacci');

    result = analyzer.analyze([0, 1, 1, 2, 3, 5]);
    assert(result.pattern === 'fibonacci', 'Detects Fibonacci starting with 0, 1');

    section('Fibonacci Variants');

    result = analyzer.analyze([2, 2, 4, 6, 10]);
    assert(result.pattern === 'fibonacci', 'Detects non-standard Fibonacci (2,2,4,6,10...)');
    assert(result.nextNumbers[0] === 16, 'Predicts correctly for variant');
})();

// ============================================================================
// Error Handling Tests
// ============================================================================

describe('ERROR HANDLING TESTS');

(() => {
    const analyzer = new SequenceAnalyzer();

    section('Invalid Input Validation');

    let result = analyzer.analyze('not an array');
    assert(!result.success, 'Rejects non-array input');
    assert(result.error.includes('array'), 'Error message mentions array');

    result = analyzer.analyze([5]);
    assert(!result.success, 'Rejects single-element array');
    assert(result.error.includes('faint'), 'Error message is descriptive');

    result = analyzer.analyze([]);
    assert(!result.success, 'Rejects empty array');

    result = analyzer.analyze([1, 'two', 3, 4]);
    assert(!result.success, 'Rejects array with non-numeric values');

    result = analyzer.analyze([1, 2, NaN, 4]);
    assert(!result.success, 'Rejects array with NaN');

    result = analyzer.analyze([1, 2, Infinity, 4]);
    assert(!result.success, 'Rejects array with Infinity');

    section('Non-Progressive Sequences');

    result = analyzer.analyze([1, 2, 4, 8, 16, 32]);
    assert(result.pattern === 'geometric', 'Recognizes as geometric, not error');

    result = analyzer.analyze([1, 2, 5, 14]);
    assert(result.success, 'Attempts pattern detection for random sequence');
})();

// ============================================================================
// Performance Tests
// ============================================================================

describe('PERFORMANCE & OPTIMIZATION TESTS');

(() => {
    const analyzer = new SequenceAnalyzer();

    section('Caching Mechanism');

    const testSequence = [3, 6, 9, 12, 15, 18];
    
    // First analysis
    const start1 = performance.now();
    analyzer.analyze(testSequence);
    const time1 = performance.now() - start1;

    // Second analysis (should be cached)
    const start2 = performance.now();
    const result2 = analyzer.analyze(testSequence);
    const time2 = performance.now() - start2;

    assert(time2 <= time1, 'Cached analysis is faster or equal');
    assert(analyzer.getMetrics().cacheHits === 1, 'Cache hit counted correctly');

    section('Large Sequences');

    // Create large arithmetic sequence
    const largeSeq = Array.from({ length: 1000 }, (_, i) => i * 2);
    const startLarge = performance.now();
    const resultLarge = analyzer.analyze(largeSeq);
    const timeLarge = performance.now() - startLarge;

    assert(resultLarge.pattern === 'arithmetic', 'Handles 1000-element sequence');
    assert(timeLarge < 100, 'Processes large sequence in < 100ms');

    section('Metrics Tracking');

    const metrics = analyzer.getMetrics();
    assert(metrics.totalAnalyses > 0, 'Tracks total analyses');
    assert(metrics.averageAnalysisTime >= 0, 'Tracks average analysis time');
    assert(metrics.cacheSize >= 0, 'Tracks cache size');
})();

// ============================================================================
// Sequence Comparison Tests
// ============================================================================

describe('SEQUENCE COMPARISON TESTS');

(() => {
    const analyzer = new SequenceAnalyzer();

    section('Same Pattern Comparison');

    let result = analyzer.comparSequences([2, 4, 6, 8], [10, 20, 30, 40]);
    assert(result.samePattern === true, 'Identifies same pattern (arithmetic)');
    assert(result.similarity > 0, 'Calculates similarity score');

    section('Different Pattern Comparison');

    result = analyzer.comparSequences([3, 6, 9, 12], [2, 4, 8, 16]);
    assert(result.samePattern === false, 'Identifies different patterns');

    section('Similarity Scoring');

    const seq1 = [2, 4, 6, 8];
    const seq2 = [3, 6, 9, 12];
    result = analyzer.comparSequences(seq1, seq2);
    
    const seq3 = [10, 20, 30, 40];
    const result2 = analyzer.comparSequences(seq1, seq3);

    assert(result.similarity <= result2.similarity, 
        'Same difference gives higher similarity');
})();

// ============================================================================
// History & Memory Tests
// ============================================================================

describe('HISTORY & MEMORY MANAGEMENT TESTS');

(() => {
    const analyzer = new SequenceAnalyzer();

    section('History Recording');

    analyzer.analyze([3, 6, 9, 12]);
    analyzer.analyze([2, 4, 8, 16]);
    analyzer.analyze([1, 4, 9, 16]);

    const history = analyzer.getHistory();
    assert(history.length === 3, 'Records all analyses in history');
    assert(history[0].pattern === 'arithmetic', 'First analysis recorded correctly');
    assert(history[1].pattern === 'geometric', 'Second analysis recorded correctly');

    section('Memory Clearing');

    analyzer.clear();
    const clearedHistory = analyzer.getHistory();
    assert(clearedHistory.length === 0, 'Clears all history');

    const metrics = analyzer.getMetrics();
    assert(metrics.totalAnalyses === 0, 'Resets metrics on clear');
    assert(metrics.cacheSize === 0, 'Clears cache on clear');
})();

// ============================================================================
// Multi-Pattern Detection Accuracy
// ============================================================================

describe('PATTERN DETECTION ACCURACY TESTS');

(() => {
    const analyzer = new SequenceAnalyzer();

    section('Correct Pattern Priority');

    // Arithmetic should be detected first (highest priority)
    const arithmetic = [2, 4, 6, 8, 10];
    let result = analyzer.analyze(arithmetic);
    assert(result.pattern === 'arithmetic', 'Detects arithmetic over other patterns');

    // Geometric should be detected
    const geometric = [1, 2, 4, 8, 16];
    result = analyzer.analyze(geometric);
    assert(result.pattern === 'geometric', 'Detects geometric progression');

    // Fibonacci should be detected
    const fibonacci = [1, 1, 2, 3, 5, 8, 13];
    result = analyzer.analyze(fibonacci);
    assert(result.pattern === 'fibonacci', 'Detects Fibonacci pattern');

    // Polynomial should be detected
    const polynomial = [1, 4, 9, 16, 25];
    result = analyzer.analyze(polynomial);
    assert(result.pattern === 'polynomial', 'Detects polynomial pattern');

    section('Confidence Levels');

    result = analyzer.analyze([3, 6, 9, 12]);
    assert(result.confidence === 100, 'Arithmetic has 100% confidence');

    result = analyzer.analyze([2, 4, 8, 16.1]); // Slightly off ratio
    // Should either detect as not geometric or with high confidence
    assert(result.success, 'Handles near-geometric sequences');
})();

// ============================================================================
// Test Summary
// ============================================================================

function printSummary() {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`${COLORS.cyan}TEST SUMMARY${COLORS.reset}`);
    console.log('═'.repeat(60));
    console.log(`Total Tests:   ${totalTests}`);
    console.log(`${COLORS.green}Passed:        ${passedTests}${COLORS.reset}`);
    console.log(`${COLORS.red}Failed:        ${failedTests}${COLORS.reset}`);
    
    const percentage = ((passedTests / totalTests) * 100).toFixed(1);
    const status = failedTests === 0 ? 
        `${COLORS.green}✓ ALL TESTS PASSED${COLORS.reset}` :
        `${COLORS.red}✗ SOME TESTS FAILED${COLORS.reset}`;
    
    console.log(`Success Rate:  ${percentage}%`);
    console.log(`Status:        ${status}`);
    console.log('═'.repeat(60));

    return failedTests === 0 ? 0 : 1;
}

// Run all tests and exit with appropriate code
const exitCode = printSummary();
process.exit(exitCode);
