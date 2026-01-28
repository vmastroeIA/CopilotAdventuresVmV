/**
 * Echo Chamber Web Client
 * 
 * Handles all frontend interactions and API communication
 */

let sequenceChart = null;

// ============================================================================
// Tab Navigation
// ============================================================================

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        switchTab(tabName);
    });
});

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active from all buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Load data when switching to certain tabs
    if (tabName === 'history') {
        loadHistory();
    } else if (tabName === 'metrics') {
        refreshMetrics();
    }
}

// ============================================================================
// Analyze Sequence
// ============================================================================

document.getElementById('analyze-btn').addEventListener('click', analyzeSequence);
document.getElementById('sequence-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') analyzeSequence();
});

function setSequence(seq) {
    document.getElementById('sequence-input').value = seq.join(', ');
}

async function analyzeSequence() {
    const input = document.getElementById('sequence-input').value.trim();

    if (!input) {
        showError('Please enter a sequence');
        return;
    }

    try {
        // Parse the input
        const sequence = input.split(',').map(x => {
            const num = parseFloat(x.trim());
            if (isNaN(num)) throw new Error('Invalid number format');
            return num;
        });

        // Call API
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sequence })
        });

        const result = await response.json();

        if (!result.success) {
            showError(result.error);
            return;
        }

        // Display results
        displayAnalysisResults(result);
        showToast('✨ Analysis complete!');

    } catch (error) {
        showError('Invalid sequence format. Please use comma-separated numbers.');
    }
}

function displayAnalysisResults(result) {
    const resultsDiv = document.getElementById('analysis-results');

    // Update result items
    document.getElementById('pattern-type').textContent = 
        result.pattern.charAt(0).toUpperCase() + result.pattern.slice(1);
    document.getElementById('confidence').textContent = `${result.confidence}%`;
    document.getElementById('analysis-time').textContent = `${result.analysisTime.toFixed(2)}ms`;
    document.getElementById('seq-length').textContent = result.sequence.length;

    // Update formula
    document.getElementById('formula-text').textContent = result.formula;

    // Update explanation
    document.getElementById('explanation-text').textContent = result.explanation;

    // Display predictions
    const predictionsDiv = document.getElementById('predictions');
    predictionsDiv.innerHTML = result.nextNumbers
        .slice(0, 5)
        .map(num => `<div class="prediction-item">${num}</div>`)
        .join('');

    // Update and draw chart
    drawChart(result.sequence, result.nextNumbers.slice(0, 5));

    // Show results
    resultsDiv.classList.remove('hidden');
    hideError();

    // Scroll to results
    setTimeout(() => {
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// ============================================================================
// Chart Visualization
// ============================================================================

function drawChart(originalSequence, predictions) {
    const ctx = document.getElementById('sequenceChart').getContext('2d');

    // Prepare data
    const labels = [
        ...originalSequence.map((_, i) => `#${i + 1}`),
        ...predictions.map((_, i) => `#${originalSequence.length + i + 1}`)
    ];

    const data = [...originalSequence, ...predictions];

    // Create color arrays
    const originalColors = new Array(originalSequence.length).fill('rgba(109, 40, 217, 1)');
    const predictionColors = new Array(predictions.length).fill('rgba(236, 72, 153, 0.7)');
    const borderColors = new Array(originalSequence.length)
        .fill('rgba(124, 58, 237, 1)')
        .concat(new Array(predictions.length).fill('rgba(244, 63, 94, 1)'));

    // Destroy existing chart if it exists
    if (sequenceChart) {
        sequenceChart.destroy();
    }

    // Create new chart
    sequenceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Sequence Values',
                    data: data,
                    borderColor: 'rgba(109, 40, 217, 1)',
                    backgroundColor: (context) => {
                        const index = context.dataIndex;
                        return index < originalSequence.length
                            ? 'rgba(109, 40, 217, 0.1)'
                            : 'rgba(236, 72, 153, 0.1)';
                    },
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointBackgroundColor: (context) => {
                        const index = context.dataIndex;
                        return index < originalSequence.length
                            ? 'rgba(109, 40, 217, 1)'
                            : 'rgba(236, 72, 153, 1)';
                    },
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 7
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: 'rgba(241, 245, 249, 1)',
                        font: { size: 12, weight: '500' }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(51, 65, 85, 0.2)',
                        drawBorder: false
                    },
                    ticks: {
                        color: 'rgba(148, 163, 184, 1)',
                        font: { size: 11 }
                    }
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        color: 'rgba(148, 163, 184, 1)',
                        font: { size: 11 }
                    }
                }
            }
        }
    });
}

// ============================================================================
// History Management
// ============================================================================

document.getElementById('clear-history-btn').addEventListener('click', clearHistory);

async function loadHistory() {
    try {
        const response = await fetch('/api/history');
        const result = await response.json();

        if (!result.success || result.history.length === 0) {
            document.getElementById('history-list').innerHTML =
                '<p class="text-secondary">No sequences analyzed yet. Start by analyzing a sequence!</p>';
            return;
        }

        const html = result.history
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .map(item => `
                <div class="history-item" onclick="selectHistoryItem(${JSON.stringify(item.sequence).replace(/"/g, '&quot;')})">
                    <div class="history-item-header">
                        <span class="history-item-pattern">${item.pattern}</span>
                        <span class="history-item-time">${new Date(item.timestamp).toLocaleString()}</span>
                    </div>
                    <div class="history-item-sequence">[${item.sequence.join(', ')}]</div>
                    <div>
                        <strong>Confidence:</strong> ${item.confidence}% |
                        <strong>Next:</strong> <span class="history-item-prediction">${item.nextNumbers[0]}</span>
                    </div>
                </div>
            `)
            .join('');

        document.getElementById('history-list').innerHTML = html;

    } catch (error) {
        console.error('Error loading history:', error);
        showError('Failed to load history');
    }
}

function selectHistoryItem(sequence) {
    document.getElementById('sequence-input').value = sequence.join(', ');
    switchTab('analyze');
    analyzeSequence();
}

async function clearHistory() {
    if (!confirm('Are you sure you want to clear all history? This cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch('/api/history', { method: 'DELETE' });
        const result = await response.json();

        if (result.success) {
            document.getElementById('history-list').innerHTML =
                '<p class="text-secondary">History cleared. Start analyzing new sequences!</p>';
            showToast('✨ History cleared!');
        }
    } catch (error) {
        console.error('Error clearing history:', error);
        showError('Failed to clear history');
    }
}

// ============================================================================
// Sequence Comparison
// ============================================================================

document.getElementById('compare-btn').addEventListener('click', compareSequences);

async function compareSequences() {
    const seq1Input = document.getElementById('seq1-input').value.trim();
    const seq2Input = document.getElementById('seq2-input').value.trim();

    if (!seq1Input || !seq2Input) {
        showError('Please enter both sequences');
        return;
    }

    try {
        const sequence1 = seq1Input.split(',').map(x => {
            const num = parseFloat(x.trim());
            if (isNaN(num)) throw new Error('Invalid number');
            return num;
        });

        const sequence2 = seq2Input.split(',').map(x => {
            const num = parseFloat(x.trim());
            if (isNaN(num)) throw new Error('Invalid number');
            return num;
        });

        const response = await fetch('/api/compare', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sequence1, sequence2 })
        });

        const result = await response.json();

        if (!result.success) {
            showError('Failed to compare sequences');
            return;
        }

        displayComparisonResults(result);
        showToast('✨ Comparison complete!');

    } catch (error) {
        showError('Invalid sequence format');
    }
}

function displayComparisonResults(result) {
    const resultsDiv = document.getElementById('compare-results');

    // Update pattern info
    document.getElementById('comp-pattern1').textContent =
        result.sequence1.pattern.charAt(0).toUpperCase() + result.sequence1.pattern.slice(1);
    document.getElementById('comp-confidence1').textContent = `${result.sequence1.confidence}%`;

    document.getElementById('comp-pattern2').textContent =
        result.sequence2.pattern.charAt(0).toUpperCase() + result.sequence2.pattern.slice(1);
    document.getElementById('comp-confidence2').textContent = `${result.sequence2.confidence}%`;

    // Update similarity meter
    const similarity = result.similarity;
    document.getElementById('meter-fill').style.width = `${similarity}%`;
    document.getElementById('similarity-value').textContent = similarity;

    // Update message
    const msgDiv = document.getElementById('same-pattern-msg');
    if (result.samePattern) {
        msgDiv.className = 'message same-pattern';
        msgDiv.textContent = '✅ These sequences follow the same pattern type!';
    } else {
        msgDiv.className = 'message different-pattern';
        msgDiv.textContent = '❌ These sequences follow different patterns, but may still have some similarity.';
    }

    resultsDiv.classList.remove('hidden');
}

// ============================================================================
// Metrics
// ============================================================================

async function refreshMetrics() {
    try {
        const response = await fetch('/api/metrics');
        const result = await response.json();

        if (!result.success) {
            console.error('Failed to load metrics');
            return;
        }

        const metrics = result.metrics;

        document.getElementById('metric-analyses').textContent = metrics.totalAnalyses;
        document.getElementById('metric-cache').textContent = metrics.cacheHits;
        document.getElementById('metric-time').textContent = `${metrics.averageAnalysisTime.toFixed(2)}ms`;
        document.getElementById('metric-size').textContent = metrics.cacheSize;

    } catch (error) {
        console.error('Error loading metrics:', error);
    }
}

// ============================================================================
// Utilities
// ============================================================================

function showError(message) {
    const errorDiv = document.getElementById('error-message') || 
                     document.getElementById('compare-error');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    }
}

function hideError() {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.classList.add('hidden');
    }
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ============================================================================
// Initialize
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Load initial metrics
    refreshMetrics();

    // Show welcome message
    showToast('🔮 Welcome to Echo Chamber!');
});
