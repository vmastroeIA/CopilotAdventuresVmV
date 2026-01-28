/**
 * SequenceAnalyzer - Advanced Pattern Recognition Engine
 * 
 * Supports multiple sequence types:
 * - Arithmetic Progressions (constant difference)
 * - Geometric Progressions (constant ratio)
 * - Polynomial Sequences (quadratic, cubic, etc.)
 * - Fibonacci-like Sequences
 * 
 * @class SequenceAnalyzer
 */

class SequenceAnalyzer {
  constructor() {
    this.history = [];
    this.performanceMetrics = {
      totalAnalyses: 0,
      averageAnalysisTime: 0,
      cacheHits: 0
    };
    this.analysisCache = new Map();
  }

  /**
   * Analyzes a sequence and identifies its pattern type
   * 
   * @param {number[]} sequence - The sequence to analyze
   * @returns {object} Analysis result with pattern type and predictions
   */
  analyze(sequence) {
    const startTime = performance.now();
    
    // Check cache
    const cacheKey = JSON.stringify(sequence);
    if (this.analysisCache.has(cacheKey)) {
      this.performanceMetrics.cacheHits++;
      return this.analysisCache.get(cacheKey);
    }

    const validation = this.validateSequence(sequence);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error,
        sequence: sequence
      };
    }

    // Try to detect pattern type in order of complexity
    let result = this.detectArithmetic(sequence);
    if (!result.pattern) {
      result = this.detectGeometric(sequence);
    }
    if (!result.pattern) {
      result = this.detectFibonacci(sequence);
    }
    if (!result.pattern) {
      result = this.detectPolynomial(sequence);
    }

    // If still no pattern, try advanced analysis
    if (!result.pattern) {
      result = {
        pattern: 'unknown',
        confidence: 0,
        nextNumbers: [null],
        formula: 'Pattern not recognized'
      };
    }

    const endTime = performance.now();
    const analysisTime = endTime - startTime;

    const analysisResult = {
      success: true,
      sequence: sequence,
      sequenceLength: sequence.length,
      ...result,
      analysisTime: analysisTime,
      timestamp: new Date().toISOString()
    };

    // Update performance metrics
    this.updateMetrics(analysisTime);

    // Cache the result
    this.analysisCache.set(cacheKey, analysisResult);

    // Store in history
    this.history.push(analysisResult);

    return analysisResult;
  }

  /**
   * Detects arithmetic progressions
   * @private
   */
  detectArithmetic(sequence) {
    const differences = this.calculateDifferences(sequence);
    
    // Check if all differences are the same
    if (differences.every(d => d === differences[0])) {
      const nextNumber = sequence[sequence.length - 1] + differences[0];
      return {
        pattern: 'arithmetic',
        confidence: 100,
        commonDifference: differences[0],
        nextNumbers: this.predictArithmetic(sequence, 5),
        formula: `a_n = a_1 + (n-1)d, where d = ${differences[0]}`,
        explanation: 'This is an arithmetic progression with constant difference'
      };
    }

    return { pattern: null };
  }

  /**
   * Detects geometric progressions
   * @private
   */
  detectGeometric(sequence) {
    // Avoid division by zero
    if (sequence.some(n => n === 0)) {
      return { pattern: null };
    }

    const ratios = [];
    for (let i = 1; i < sequence.length; i++) {
      ratios.push(sequence[i] / sequence[i - 1]);
    }

    // Allow small floating-point variations
    const firstRatio = ratios[0];
    const tolerance = 0.0001;
    const isGeometric = ratios.every(r => Math.abs(r - firstRatio) < tolerance);

    if (isGeometric) {
      return {
        pattern: 'geometric',
        confidence: 100,
        commonRatio: firstRatio,
        nextNumbers: this.predictGeometric(sequence, 5),
        formula: `a_n = a_1 * r^(n-1), where r = ${firstRatio.toFixed(4)}`,
        explanation: 'This is a geometric progression with constant ratio'
      };
    }

    return { pattern: null };
  }

  /**
   * Detects polynomial sequences (quadratic, cubic, etc.)
   * @private
   */
  detectPolynomial(sequence) {
    // Calculate successive differences until we find a pattern
    let differences = [...sequence];
    let level = 0;
    const maxLevels = 5;

    while (level < maxLevels) {
      const nextDiffs = this.calculateDifferences(differences);
      
      if (nextDiffs.length === 0) break;

      // Check if differences are constant at this level
      if (nextDiffs.every(d => d === nextDiffs[0])) {
        const degree = level + 1;
        return {
          pattern: 'polynomial',
          degree: degree,
          confidence: 95,
          constantDifference: nextDiffs[0],
          nextNumbers: this.predictPolynomial(sequence, level, nextDiffs[0], 5),
          formula: `Polynomial of degree ${degree}`,
          explanation: `This is a polynomial sequence of degree ${degree}`
        };
      }

      differences = nextDiffs;
      level++;
    }

    return { pattern: null };
  }

  /**
   * Detects Fibonacci-like sequences
   * @private
   */
  detectFibonacci(sequence) {
    if (sequence.length < 3) return { pattern: null };

    // Check if each number is the sum of the previous two
    let isFibonacci = true;
    let matchCount = 0;
    
    for (let i = 2; i < sequence.length; i++) {
      if (Math.abs(sequence[i] - (sequence[i - 1] + sequence[i - 2])) < 0.0001) {
        matchCount++;
      } else {
        isFibonacci = false;
        break;
      }
    }

    // Allow if we have at least 2 matches (for min 3-element sequences)
    if (matchCount >= sequence.length - 2) {
      return {
        pattern: 'fibonacci',
        confidence: 100,
        nextNumbers: this.predictFibonacci(sequence, 5),
        formula: 'a_n = a_(n-1) + a_(n-2)',
        explanation: 'This is a Fibonacci-like sequence where each term is the sum of the previous two'
      };
    }

    return { pattern: null };
  }

  /**
   * Validates sequence input
   * @private
   */
  validateSequence(sequence) {
    if (!Array.isArray(sequence)) {
      return {
        isValid: false,
        error: '❌ The echo is not a valid sequence array.'
      };
    }

    if (sequence.length < 2) {
      return {
        isValid: false,
        error: '❌ The echo is too faint - need at least 2 numbers.'
      };
    }

    if (!sequence.every(num => typeof num === 'number' && !isNaN(num) && isFinite(num))) {
      return {
        isValid: false,
        error: '❌ The echo is distorted - all elements must be valid numbers.'
      };
    }

    return { isValid: true };
  }

  /**
   * Calculates differences between consecutive elements
   * @private
   */
  calculateDifferences(sequence) {
    const differences = [];
    for (let i = 1; i < sequence.length; i++) {
      differences.push(sequence[i] - sequence[i - 1]);
    }
    return differences;
  }

  /**
   * Predicts next numbers for arithmetic progression
   * @private
   */
  predictArithmetic(sequence, count) {
    const differences = this.calculateDifferences(sequence);
    const difference = differences[0];
    const predictions = [];
    let last = sequence[sequence.length - 1];

    for (let i = 0; i < count; i++) {
      last += difference;
      predictions.push(last);
    }

    return predictions;
  }

  /**
   * Predicts next numbers for geometric progression
   * @private
   */
  predictGeometric(sequence, count) {
    const ratio = sequence[sequence.length - 1] / sequence[sequence.length - 2];
    const predictions = [];
    let last = sequence[sequence.length - 1];

    for (let i = 0; i < count; i++) {
      last *= ratio;
      predictions.push(Math.round(last * 10000) / 10000); // Round to avoid floating point errors
    }

    return predictions;
  }

  /**
   * Predicts next numbers for polynomial sequences
   * @private
   */
  predictPolynomial(sequence, level, constantDiff, count) {
    const predictions = [];
    
    // Build the complete difference table
    const diffTable = [sequence.slice()];
    for (let i = 0; i <= level; i++) {
      const diffs = this.calculateDifferences(diffTable[diffTable.length - 1]);
      if (diffs.length === 0) break;
      diffTable.push(diffs);
    }

    // Extend each row and predict next values
    for (let p = 0; p < count; p++) {
      // At the deepest level, add the constant difference
      if (diffTable[level] && diffTable[level].length > 0) {
        diffTable[level].push(diffTable[level][diffTable[level].length - 1]);
      } else {
        diffTable[level].push(constantDiff);
      }

      // Work back up to get the next value
      for (let i = level - 1; i >= 0; i--) {
        const prevLast = diffTable[i][diffTable[i].length - 1];
        const diffLast = diffTable[i + 1][diffTable[i + 1].length - 1];
        diffTable[i].push(prevLast + diffLast);
      }

      // The new value at level 0 is our prediction
      const nextNum = diffTable[0][diffTable[0].length - 1];
      predictions.push(nextNum);
    }

    return predictions;
  }

  /**
   * Predicts next numbers for Fibonacci sequences
   * @private
   */
  predictFibonacci(sequence, count) {
    const predictions = [];
    let a = sequence[sequence.length - 2];
    let b = sequence[sequence.length - 1];

    for (let i = 0; i < count; i++) {
      const next = a + b;
      predictions.push(next);
      a = b;
      b = next;
    }

    return predictions;
  }

  /**
   * Updates performance metrics
   * @private
   */
  updateMetrics(analysisTime) {
    this.performanceMetrics.totalAnalyses++;
    const prevAvg = this.performanceMetrics.averageAnalysisTime;
    this.performanceMetrics.averageAnalysisTime = 
      (prevAvg * (this.performanceMetrics.totalAnalyses - 1) + analysisTime) / 
      this.performanceMetrics.totalAnalyses;
  }

  /**
   * Gets the analysis history
   */
  getHistory() {
    return [...this.history];
  }

  /**
   * Gets performance metrics
   */
  getMetrics() {
    return {
      ...this.performanceMetrics,
      cacheSize: this.analysisCache.size
    };
  }

  /**
   * Clears history and cache
   */
  clear() {
    this.history = [];
    this.analysisCache.clear();
    this.performanceMetrics = {
      totalAnalyses: 0,
      averageAnalysisTime: 0,
      cacheHits: 0
    };
  }

  /**
   * Compares two sequences and finds similarities
   */
  comparSequences(seq1, seq2) {
    const analysis1 = this.analyze(seq1);
    const analysis2 = this.analyze(seq2);

    return {
      sequence1: analysis1,
      sequence2: analysis2,
      samePattern: analysis1.pattern === analysis2.pattern,
      similarity: this.calculateSimilarity(analysis1, analysis2)
    };
  }

  /**
   * Calculates similarity between two analysis results
   * @private
   */
  calculateSimilarity(analysis1, analysis2) {
    if (analysis1.pattern !== analysis2.pattern) {
      return 0;
    }

    let similarity = 50; // Base similarity for same pattern

    // Bonus for similar parameters
    if (analysis1.commonDifference !== undefined && 
        analysis2.commonDifference !== undefined &&
        analysis1.commonDifference === analysis2.commonDifference) {
      similarity += 25;
    }

    if (analysis1.commonRatio !== undefined && 
        analysis2.commonRatio !== undefined &&
        Math.abs(analysis1.commonRatio - analysis2.commonRatio) < 0.01) {
      similarity += 25;
    }

    return Math.min(similarity, 100);
  }
}

module.exports = SequenceAnalyzer;
