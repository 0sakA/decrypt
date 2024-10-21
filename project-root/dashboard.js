// Function to create a chart
function createChart(canvasId, chartType, labels, data, label) {
    return new Chart(document.getElementById(canvasId), {
        type: chartType,
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                backgroundColor: chartType === 'line' ? 'rgba(75, 192, 192, 0.2)' : ['#4caf50', '#ff9800', '#f44336'],
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Initial data for student performance
const performanceLabels = ['Student 1', 'Student 2', 'Student 3', 'Student 4'];
const performanceData = [75, 85, 60, 90];
createChart('performanceChart', 'bar', performanceLabels, performanceData, 'Scores');

// Initial data for violation statistics
const violationLabels = ['No Violations', 'Warnings', 'Exam Suspensions'];
const violationData = [90, 7, 3];
createChart('violationChart', 'doughnut', violationLabels, violationData, 'Violations');

// Initial data for engagement levels
const engagementLabels = ['10 min', '20 min', '30 min', '40 min', '50 min'];
const engagementData = [60, 70, 80, 65, 85];
createChart('engagementChart', 'line', engagementLabels, engagementData, 'Engagement Levels');

// Function to predict cheating patterns based on behavior data
function predictCheatingPatterns() {
    const patterns = ['Low Engagement', 'High Tab Switches', 'Sudden Performance Spikes'];
    const result = patterns[Math.floor(Math.random() * patterns.length)];
    document.getElementById('cheating-prediction-output').innerText = `Potential Cheating Detected: ${result}`;
}

// Simulate real-time updates every 5 seconds
setInterval(() => {
    // Simulate random updates to student performance data
    performanceData.forEach((value, index) => performanceData[index] = value + Math.floor(Math.random() * 5) - 2);
    createChart('performanceChart', 'bar', performanceLabels, performanceData, 'Scores');

    // Update cheating pattern predictions
    predictCheatingPatterns();
}, 5000);
