#!/usr/bin/env node

/**
 * Echo Chamber Application - A Magical Number Sequence Prediction Puzzle
 * 
 * This application solves the Chamber of Echoes adventure, where you must
 * predict the next number in mystical arithmetic progressions.
 * 
 * The Chamber stores "memories" of previous sequences (echoes) and uses them
 * to predict future numbers through pattern recognition.
 * 
 * Algorithm: Arithmetic Progression
 * - Calculates the common difference between consecutive numbers
 * - Uses the difference to predict the next number
 * - Formula: next = last + commonDifference
 */

// ============================================================================
// Core Echo Chamber Class - Sequence Prediction Engine
// ============================================================================

class EchoChamber {
  /**
   * Initialize the Echo Chamber with memory for storing echoes
   */
  constructor() {
    this.memories = []; // Stores all previous sequence analyses
    this.currentEcho = null; // Tracks the most recent sequence
  }

  /**
   * Validates that a sequence is a valid arithmetic progression
   * 
   * @param {number[]} sequence - Array of numbers to validate
   * @returns {object} Validation result with isValid flag and error message
   */
  validateSequence(sequence) {
    // Check if sequence exists and is an array
    if (!Array.isArray(sequence)) {
      return {
        isValid: false,
        error: "❌ The echo is not a valid sequence array."
      };
    }

    // Check minimum length (need at least 2 numbers to find pattern)
    if (sequence.length < 2) {
      return {
        isValid: false,
        error: "❌ The echo is too faint - need at least 2 numbers to find the pattern."
      };
    }

    // Check that all elements are numbers
    if (!sequence.every(num => typeof num === 'number' && !isNaN(num))) {
      return {
        isValid: false,
        error: "❌ The echo is distorted - all elements must be valid numbers."
      };
    }

    // Calculate differences between consecutive numbers
    const differences = [];
    for (let i = 1; i < sequence.length; i++) {
      differences.push(sequence[i] - sequence[i - 1]);
    }

    // Check if all differences are the same (arithmetic progression requirement)
    const firstDifference = differences[0];
    const isArithmeticProgression = differences.every(diff => diff === firstDifference);

    if (!isArithmeticProgression) {
      return {
        isValid: false,
        error: "❌ The echo doesn't follow the laws of arithmetic harmony."
      };
    }

    return {
      isValid: true,
      error: null,
      commonDifference: firstDifference
    };
  }

  /**
   * Predicts the next number in an arithmetic sequence
   * 
   * @param {number[]} sequence - Array of numbers in arithmetic progression
   * @returns {object} Prediction result with next number and analysis
   */
  predictNext(sequence) {
    // Validate the sequence first
    const validation = this.validateSequence(sequence);

    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error,
        prediction: null
      };
    }

    // Get the last number in the sequence
    const lastNumber = sequence[sequence.length - 1];
    const commonDifference = validation.commonDifference;

    // Calculate the next number
    const nextNumber = lastNumber + commonDifference;

    // Store this echo in memory
    const echoRecord = {
      timestamp: new Date().toISOString(),
      originalSequence: [...sequence],
      commonDifference: commonDifference,
      prediction: nextNumber,
      confidence: 100 // Arithmetic progressions have 100% certainty
    };

    this.memories.push(echoRecord);
    this.currentEcho = echoRecord;

    return {
      success: true,
      prediction: nextNumber,
      commonDifference: commonDifference,
      echoNumber: this.memories.length,
      analysis: {
        sequenceLength: sequence.length,
        firstNumber: sequence[0],
        lastNumber: lastNumber,
        commonDifference: commonDifference,
        formula: `next = ${lastNumber} + ${commonDifference} = ${nextNumber}`
      }
    };
  }

  /**
   * Returns the count of echoes stored in memory
   */
  getEchoCount() {
    return this.memories.length;
  }

  /**
   * Returns all memories stored in the chamber
   */
  getAllMemories() {
    return [...this.memories];
  }

  /**
   * Clears all memories from the chamber
   */
  clearMemories() {
    this.memories = [];
    this.currentEcho = null;
  }
}

// ============================================================================
// Console Interface - User Story and Interactive Experience
// ============================================================================

/**
 * Displays the mystical introduction to the Echo Chamber adventure
 */
function displayWelcome() {
  console.clear();
  console.log("\n");
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║                   🔮 THE ECHO CHAMBER 🔮                   ║");
  console.log("║              A Mystical Sequence Prediction Puzzle          ║");
  console.log("╚════════════════════════════════════════════════════════════╝");
  console.log("\n");
  console.log("Welcome, brave adventurer! You have entered the legendary Echo Chamber,");
  console.log("a mystical realm where numbers echo through infinite corridors.");
  console.log("\n");
  console.log("Your quest: Discover the hidden patterns in magical sequences and predict");
  console.log("the next number before the echoes fade away...");
  console.log("\n");
}

/**
 * Displays the menu and waits for user input
 */
function displayMenu() {
  console.log("\n╭─ ECHO CHAMBER MENU ─────────────────────────────────────╮");
  console.log("│ 1. Test with sample sequence (3, 6, 9, 12)             │");
  console.log("│ 2. Test with custom sequence                           │");
  console.log("│ 3. View all stored echoes (memories)                   │");
  console.log("│ 4. Clear all memories                                  │");
  console.log("│ 5. Run all test cases                                  │");
  console.log("│ 6. Exit the chamber                                    │");
  console.log("╰─────────────────────────────────────────────────────────╯");
}

/**
 * Displays results of a prediction with beautiful formatting
 */
function displayPrediction(result) {
  if (!result.success) {
    console.log("\n" + "═".repeat(60));
    console.log("⚠️  ECHO DISTORTION DETECTED!");
    console.log(result.error);
    console.log("═".repeat(60) + "\n");
    return;
  }

  console.log("\n" + "═".repeat(60));
  console.log("✨ ECHO DECODED SUCCESSFULLY! ✨");
  console.log("═".repeat(60));
  console.log(`\n📊 Sequence Analysis (Echo #${result.echoNumber}):`);
  console.log(`   Original Sequence: [${result.analysis.firstNumber}, ..., ${result.analysis.lastNumber}]`);
  console.log(`   Common Difference: ${result.commonDifference}`);
  console.log(`   Formula Used: ${result.analysis.formula}`);
  console.log(`\n🎯 PREDICTION: The next number is ${result.prediction} ✓`);
  console.log("═".repeat(60) + "\n");
}

/**
 * Displays all memories stored in the chamber
 */
function displayMemories(chamber) {
  const memories = chamber.getAllMemories();

  if (memories.length === 0) {
    console.log("\n⚫ The Echo Chamber is silent - no memories yet.\n");
    return;
  }

  console.log("\n" + "═".repeat(60));
  console.log(`📚 CHAMBER MEMORIES (${memories.length} echoes stored)`);
  console.log("═".repeat(60));

  memories.forEach((memory, index) => {
    console.log(`\nEcho #${index + 1}:`);
    console.log(`  Sequence: [${memory.originalSequence.join(", ")}]`);
    console.log(`  Difference: ${memory.commonDifference}`);
    console.log(`  Predicted Next: ${memory.prediction}`);
    console.log(`  Stored at: ${new Date(memory.timestamp).toLocaleString()}`);
  });

  console.log("\n" + "═".repeat(60) + "\n");
}

/**
 * Test cases for the Echo Chamber
 */
const testCases = [
  {
    name: "Sample Sequence (Official)",
    sequence: [3, 6, 9, 12],
    expectedPrediction: 15
  },
  {
    name: "Fibonacci-like Arithmetic",
    sequence: [2, 4, 6, 8, 10],
    expectedPrediction: 12
  },
  {
    name: "Negative Progression",
    sequence: [20, 15, 10, 5],
    expectedPrediction: 0
  },
  {
    name: "Large Numbers",
    sequence: [100, 200, 300, 400],
    expectedPrediction: 500
  },
  {
    name: "Single Difference",
    sequence: [7, 7, 7, 7],
    expectedPrediction: 7
  },
  {
    name: "Minimal Valid Sequence",
    sequence: [5, 10],
    expectedPrediction: 15
  }
];

/**
 * Runs all test cases and displays results
 */
function runAllTestCases(chamber) {
  console.log("\n" + "═".repeat(60));
  console.log("🧪 RUNNING COMPREHENSIVE TEST SUITE 🧪");
  console.log("═".repeat(60) + "\n");

  let passedTests = 0;
  let failedTests = 0;

  testCases.forEach((testCase, index) => {
    const result = chamber.predictNext(testCase.sequence);

    const statusIcon = result.success && result.prediction === testCase.expectedPrediction ? "✅" : "❌";
    console.log(`${statusIcon} Test ${index + 1}: ${testCase.name}`);
    console.log(`   Input: [${testCase.sequence.join(", ")}]`);
    console.log(`   Expected: ${testCase.expectedPrediction}`);
    console.log(`   Got: ${result.prediction}`);

    if (result.success && result.prediction === testCase.expectedPrediction) {
      passedTests++;
    } else {
      failedTests++;
    }

    console.log();
  });

  console.log("═".repeat(60));
  console.log(`TEST RESULTS: ${passedTests} passed, ${failedTests} failed`);
  console.log("═".repeat(60) + "\n");
}

/**
 * Runs error handling tests with invalid inputs
 */
function runErrorHandlingTests(chamber) {
  console.log("\n" + "═".repeat(60));
  console.log("⚠️  ERROR HANDLING TEST SUITE ⚠️");
  console.log("═".repeat(60) + "\n");

  const invalidCases = [
    {
      name: "Non-array input",
      input: "not an array"
    },
    {
      name: "Single number array",
      input: [5]
    },
    {
      name: "Non-arithmetic sequence",
      input: [1, 2, 4, 8]
    },
    {
      name: "Array with non-numbers",
      input: [1, "two", 3, 4]
    },
    {
      name: "Empty array",
      input: []
    }
  ];

  invalidCases.forEach((testCase, index) => {
    const result = chamber.predictNext(testCase.input);
    console.log(`Test ${index + 1}: ${testCase.name}`);
    console.log(`   Input: ${JSON.stringify(testCase.input)}`);
    console.log(`   Result: ${result.success ? "❌ SHOULD HAVE FAILED" : "✅ Correctly rejected"}`);
    if (!result.success) {
      console.log(`   Error: ${result.error}`);
    }
    console.log();
  });

  console.log("═".repeat(60) + "\n");
}

// ============================================================================
// Main Application Loop
// ============================================================================

async function main() {
  const chamber = new EchoChamber();
  displayWelcome();

  let running = true;

  // Main interaction loop
  while (running) {
    displayMenu();

    // In a real interactive environment, use readline
    // For this demo, we'll show how to use it programmatically
    const choice = process.argv[2];

    switch (choice) {
      case "1":
        // Test with sample sequence
        console.log("\n🔮 Testing with the Official Sample Sequence...");
        const sampleResult = chamber.predictNext([3, 6, 9, 12]);
        displayPrediction(sampleResult);
        process.exit(0);
        break;

      case "test-all":
        // Run all test cases
        runAllTestCases(chamber);
        process.exit(0);
        break;

      case "test-errors":
        // Run error handling tests
        runErrorHandlingTests(chamber);
        process.exit(0);
        break;

      case "memories":
        // Display all memories
        displayMemories(chamber);
        process.exit(0);
        break;

      case "demo":
      default:
        // Default: Run complete demonstration
        console.log("\n▶️  Starting complete demonstration...\n");

        // Run all test cases
        runAllTestCases(chamber);

        // Run error handling tests
        runErrorHandlingTests(chamber);

        // Display all memories
        displayMemories(chamber);

        console.log("✨ Echo Chamber demonstration complete!\n");
        process.exit(0);
        break;
    }
  }
}

// ============================================================================
// Entry Point and Exports
// ============================================================================

// Export classes and functions for testing
module.exports = {
  EchoChamber,
  testCases,
  runAllTestCases,
  runErrorHandlingTests
};

// Run main application
if (require.main === module) {
  main().catch(console.error);
}
