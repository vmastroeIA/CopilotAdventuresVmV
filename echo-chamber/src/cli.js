/**
 * Echo Chamber CLI - Command Line Interface
 * 
 * Run sequence analysis from the command line
 * Usage: npm run cli
 */

const SequenceAnalyzer = require('./SequenceAnalyzer');
const readline = require('readline');

const analyzer = new SequenceAnalyzer();

// ANSI Colors
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// ============================================================================
// UI Functions
// ============================================================================

function displayHeader() {
    console.clear();
    console.log('\n' + '═'.repeat(70));
    console.log(`${colors.magenta}${colors.bright}🔮 ECHO CHAMBER - COMMAND LINE INTERFACE 🔮${colors.reset}`);
    console.log('═'.repeat(70));
    console.log(`${colors.cyan}Mystical Sequence Pattern Analysis${colors.reset}\n`);
}

function displayMenu() {
    console.log(`${colors.cyan}┌─ MENU ──────────────────────────────────────────────────────┐${colors.reset}`);
    console.log('│ 1. Analyze a sequence                                      │');
    console.log('│ 2. Test with preset examples                              │');
    console.log('│ 3. Compare two sequences                                  │');
    console.log('│ 4. View analysis history                                  │');
    console.log('│ 5. View performance metrics                               │');
    console.log('│ 6. Clear history                                          │');
    console.log('│ 7. Help                                                   │');
    console.log('│ 8. Exit                                                   │');
    console.log(`${colors.cyan}└────────────────────────────────────────────────────────────┘${colors.reset}\n`);
}

function displayPresets() {
    console.log(`\n${colors.cyan}Preset Examples:${colors.reset}`);
    console.log(`  1. Arithmetic:  ${colors.yellow}3, 6, 9, 12${colors.reset}`);
    console.log(`  2. Geometric:   ${colors.yellow}2, 4, 8, 16${colors.reset}`);
    console.log(`  3. Fibonacci:   ${colors.yellow}1, 1, 2, 3, 5, 8${colors.reset}`);
    console.log(`  4. Polynomial:  ${colors.yellow}1, 4, 9, 16, 25${colors.reset}`);
    console.log(`  5. Negative:    ${colors.yellow}20, 15, 10, 5, 0${colors.reset}\n`);
}

// ============================================================================
// Analysis Functions
// ============================================================================

function analyzeSequenceInteractive() {
    rl.question(`${colors.cyan}Enter sequence (comma-separated numbers):${colors.reset} `, (input) => {
        try {
            const sequence = input.split(',').map(x => {
                const num = parseFloat(x.trim());
                if (isNaN(num)) throw new Error('Invalid number');
                return num;
            });

            if (sequence.length < 2) {
                console.log(`${colors.red}❌ Sequence must have at least 2 numbers${colors.reset}`);
                mainMenu();
                return;
            }

            const result = analyzer.analyze(sequence);
            displayAnalysisResult(result);
            mainMenu();

        } catch (error) {
            console.log(`${colors.red}❌ Invalid format: ${error.message}${colors.reset}`);
            mainMenu();
        }
    });
}

function displayAnalysisResult(result) {
    if (!result.success) {
        console.log(`\n${colors.red}${result.error}${colors.reset}\n`);
        return;
    }

    console.log('\n' + '─'.repeat(70));
    console.log(`${colors.green}✨ ANALYSIS COMPLETE ✨${colors.reset}`);
    console.log('─'.repeat(70));

    console.log(`\n${colors.bright}Pattern Type:${colors.reset} ${colors.cyan}${result.pattern.toUpperCase()}${colors.reset}`);
    console.log(`${colors.bright}Confidence:${colors.reset}   ${colors.cyan}${result.confidence}%${colors.reset}`);
    console.log(`${colors.bright}Sequence:${colors.reset}     [${result.sequence.join(', ')}]`);
    console.log(`${colors.bright}Analysis Time:${colors.reset} ${colors.cyan}${result.analysisTime.toFixed(2)}ms${colors.reset}`);

    if (result.commonDifference !== undefined) {
        console.log(`${colors.bright}Common Difference:${colors.reset} ${colors.yellow}${result.commonDifference}${colors.reset}`);
    }

    if (result.commonRatio !== undefined) {
        console.log(`${colors.bright}Common Ratio:${colors.reset}      ${colors.yellow}${result.commonRatio.toFixed(4)}${colors.reset}`);
    }

    console.log(`\n${colors.bright}Formula:${colors.reset} ${colors.magenta}${result.formula}${colors.reset}`);
    console.log(`${colors.bright}Explanation:${colors.reset} ${result.explanation}`);

    console.log(`\n${colors.bright}Next 5 Predictions:${colors.reset}`);
    result.nextNumbers.slice(0, 5).forEach((num, i) => {
        console.log(`  ${i + 1}. ${colors.green}${num}${colors.reset}`);
    });

    console.log('\n' + '─'.repeat(70) + '\n');
}

function testPresets() {
    console.log(`\n${colors.cyan}Testing Preset Examples:${colors.reset}\n`);

    const presets = [
        {
            name: 'Arithmetic: 3, 6, 9, 12',
            sequence: [3, 6, 9, 12]
        },
        {
            name: 'Geometric: 2, 4, 8, 16',
            sequence: [2, 4, 8, 16]
        },
        {
            name: 'Fibonacci: 1, 1, 2, 3, 5, 8',
            sequence: [1, 1, 2, 3, 5, 8]
        },
        {
            name: 'Polynomial: 1, 4, 9, 16, 25',
            sequence: [1, 4, 9, 16, 25]
        },
        {
            name: 'Negative: 20, 15, 10, 5, 0',
            sequence: [20, 15, 10, 5, 0]
        }
    ];

    presets.forEach(preset => {
        console.log(`${colors.bright}${preset.name}${colors.reset}`);
        const result = analyzer.analyze(preset.sequence);

        if (result.success) {
            console.log(`  → Pattern: ${colors.cyan}${result.pattern}${colors.reset}`);
            console.log(`  → Next number: ${colors.green}${result.nextNumbers[0]}${colors.reset}`);
            console.log(`  → Confidence: ${colors.cyan}${result.confidence}%${colors.reset}`);
        } else {
            console.log(`  → ${colors.red}Error${colors.reset}`);
        }
        console.log();
    });

    mainMenu();
}

function compareSequences() {
    rl.question(`${colors.cyan}Enter first sequence (comma-separated):${colors.reset} `, (input1) => {
        rl.question(`${colors.cyan}Enter second sequence (comma-separated):${colors.reset} `, (input2) => {
            try {
                const seq1 = input1.split(',').map(x => parseFloat(x.trim()));
                const seq2 = input2.split(',').map(x => parseFloat(x.trim()));

                const result = analyzer.comparSequences(seq1, seq2);

                console.log('\n' + '─'.repeat(70));
                console.log(`${colors.cyan}Comparison Results:${colors.reset}`);
                console.log('─'.repeat(70));

                console.log(`${colors.bright}Sequence 1:${colors.reset} [${result.sequence1.sequence.join(', ')}]`);
                console.log(`  Pattern: ${colors.cyan}${result.sequence1.pattern}${colors.reset}`);
                console.log(`  Confidence: ${colors.cyan}${result.sequence1.confidence}%${colors.reset}`);

                console.log(`\n${colors.bright}Sequence 2:${colors.reset} [${result.sequence2.sequence.join(', ')}]`);
                console.log(`  Pattern: ${colors.cyan}${result.sequence2.pattern}${colors.reset}`);
                console.log(`  Confidence: ${colors.cyan}${result.sequence2.confidence}%${colors.reset}`);

                console.log(`\n${colors.bright}Comparison:${colors.reset}`);
                console.log(`  Same Pattern: ${result.samePattern ? colors.green + '✓ Yes' : colors.red + '✗ No'}${colors.reset}`);
                console.log(`  Similarity: ${colors.yellow}${result.similarity}%${colors.reset}`);

                console.log('\n' + '─'.repeat(70) + '\n');

                mainMenu();

            } catch (error) {
                console.log(`${colors.red}❌ Invalid format${colors.reset}`);
                mainMenu();
            }
        });
    });
}

function viewHistory() {
    const history = analyzer.getHistory();

    console.log('\n' + '─'.repeat(70));
    console.log(`${colors.cyan}Analysis History (${history.length} items)${colors.reset}`);
    console.log('─'.repeat(70) + '\n');

    if (history.length === 0) {
        console.log(`${colors.yellow}No analyses yet. Start by analyzing a sequence!${colors.reset}\n`);
        mainMenu();
        return;
    }

    history.slice(-10).reverse().forEach((item, i) => {
        console.log(`${colors.bright}#${history.length - i}${colors.reset} ${item.pattern.toUpperCase()}`);
        console.log(`   Sequence: [${item.sequence.join(', ')}]`);
        console.log(`   Next: ${colors.green}${item.nextNumbers[0]}${colors.reset}`);
        console.log(`   Time: ${new Date(item.timestamp).toLocaleString()}`);
        console.log();
    });

    console.log('─'.repeat(70) + '\n');
    mainMenu();
}

function viewMetrics() {
    const metrics = analyzer.getMetrics();

    console.log('\n' + '─'.repeat(70));
    console.log(`${colors.cyan}Performance Metrics${colors.reset}`);
    console.log('─'.repeat(70) + '\n');

    console.log(`${colors.bright}Total Analyses:${colors.reset}      ${colors.yellow}${metrics.totalAnalyses}${colors.reset}`);
    console.log(`${colors.bright}Cache Hits:${colors.reset}          ${colors.yellow}${metrics.cacheHits}${colors.reset}`);
    console.log(`${colors.bright}Cache Size:${colors.reset}          ${colors.yellow}${metrics.cacheSize}${colors.reset}`);
    console.log(`${colors.bright}Avg Analysis Time:${colors.reset}   ${colors.yellow}${metrics.averageAnalysisTime.toFixed(2)}ms${colors.reset}`);

    if (metrics.totalAnalyses > 0) {
        const hitRate = ((metrics.cacheHits / metrics.totalAnalyses) * 100).toFixed(1);
        console.log(`${colors.bright}Cache Hit Rate:${colors.reset}    ${colors.green}${hitRate}%${colors.reset}`);
    }

    console.log('\n' + '─'.repeat(70) + '\n');
    mainMenu();
}

function clearHistory() {
    rl.question(`${colors.yellow}Are you sure? (y/n):${colors.reset} `, (answer) => {
        if (answer.toLowerCase() === 'y') {
            analyzer.clear();
            console.log(`${colors.green}✓ History cleared${colors.reset}\n`);
        } else {
            console.log(`${colors.yellow}Cancelled${colors.reset}\n`);
        }
        mainMenu();
    });
}

function displayHelp() {
    console.log(`\n${colors.cyan}HELP - Echo Chamber CLI${colors.reset}\n`);
    console.log('This tool analyzes mathematical sequences and predicts the next numbers.');
    console.log('\nSupported Patterns:');
    console.log('  • Arithmetic: Constant difference (e.g., 2, 4, 6, 8)');
    console.log('  • Geometric: Constant ratio (e.g., 2, 4, 8, 16)');
    console.log('  • Polynomial: Polynomial functions (e.g., 1, 4, 9, 16)');
    console.log('  • Fibonacci: Sum of previous two (e.g., 1, 1, 2, 3, 5)');
    console.log('\nInput Format:');
    console.log('  Enter numbers separated by commas: 3, 6, 9, 12');
    console.log('\nTips:');
    console.log('  • Minimum 2 numbers required');
    console.log('  • Use presets to test different pattern types');
    console.log('  • Compare sequences to find similarities');
    console.log(`\nFor more info: ${colors.cyan}https://github.com/microsoft/CopilotAdventures${colors.reset}\n`);

    mainMenu();
}

// ============================================================================
// Main Menu Loop
// ============================================================================

function mainMenu() {
    displayMenu();

    rl.question(`${colors.cyan}Select option (1-8):${colors.reset} `, (choice) => {
        switch (choice.trim()) {
            case '1':
                analyzeSequenceInteractive();
                break;
            case '2':
                testPresets();
                break;
            case '3':
                compareSequences();
                break;
            case '4':
                viewHistory();
                break;
            case '5':
                viewMetrics();
                break;
            case '6':
                clearHistory();
                break;
            case '7':
                displayHelp();
                break;
            case '8':
                console.log(`\n${colors.magenta}🔮 Thank you for using Echo Chamber! Goodbye! 🔮${colors.reset}\n`);
                rl.close();
                process.exit(0);
                break;
            default:
                console.log(`${colors.red}Invalid option. Please select 1-8.${colors.reset}\n`);
                mainMenu();
        }
    });
}

// ============================================================================
// Start Application
// ============================================================================

displayHeader();
mainMenu();

// Handle exit
rl.on('close', () => {
    process.exit(0);
});
