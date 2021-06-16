import Chart from "chart.js";
import 'chartjs-plugin-dragdata';

const getChartGenerator = () => {
    return ({ phonemes, hertz, ms, color, editable }) => {
        const chartName = document.getElementById('phonemesWave');

        const points = []
        for (const index in ms.value) {
            const msPoint = ms.value[index]
            const point = hertz.value[index]
            points.push({
                x: msPoint,
                y: point,
            })
        }

        return new Chart(chartName, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Phonemes wave',
                    fill: false,
                    backgroundColor: color,
                    borderColor: color,
                    showLine: true,
                    cubicInterpolationMode: 'monotone',
                    data: points,
                    borderWidth: 2,
                }]
            },
            options: {
                dragData: editable || false,
                dragX: false,
                dragDataRound: 0, // round to full integers (0 decimals)
                dragOptions: {
                  // magnet: { // enable to stop dragging after a certain value
                  //   to: Math.round
                  // },
                  showTooltip: true // Recommended. This will show the tooltip while the user
                  // drags the datapoint
                },
                maintainAspectRatio: false,
                legend: {
                    display: false,
                },
                scales: {
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Hz'
                        },
                    }],

                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'phoneme name'
                        },
                        beginAtZero: true,
                        ticks: {
                            autoSkip: false,
                        }
                    }]
                }
            }
        });
    }
};

export default getChartGenerator;
