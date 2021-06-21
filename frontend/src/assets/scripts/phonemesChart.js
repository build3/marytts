import Chart from "chart.js";
import 'chartjs-plugin-dragdata';

const chartData = [];

const createDataSet = (hertz, phonemes, ms) => {
    let singlePoint = {};
    const hzPoints = hertz.value;
    const phonem = phonemes.value;

    ms.value.forEach((ms, i) => {
        singlePoint = {
            x: ms,
            y: hzPoints[i],
            phonem: phonem[i],
        }

        chartData.push(singlePoint);
    });
};

const getChartGenerator = () => {
    return ({ phonemes, hertz, ms, color, editable }) => {
        const chartName = document.getElementById('phonemesWave');

        createDataSet(hertz, phonemes, ms);

        return new Chart(chartName, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: phonemes.value,
                    fill: false,
                    backgroundColor: color,
                    borderColor: color,
                    data: chartData,
                    borderWidth: 2,
                    showLine: true,
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
                        type: 'linear',
                        position: 'bottom',

                        scaleLabel: {
                            display: true,
                            labelString: 'Phonemes name'
                        },
                        ticks: {
                            beginAtZero: true,
                            autoSkip: false,
                            stepSize: 1,
                            callback: (value, index) => ms.value.includes(value) ? chartData.find(obj => obj.x === index).phonem : undefined,
                        }
                    }]
                },
                tooltips: {

                }
            }
        });
    }
};

export default getChartGenerator;
