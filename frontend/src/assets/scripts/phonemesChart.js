import Chart from "chart.js";
import 'chartjs-plugin-dragdata';

import { useStore } from "vuex";

const getChartGenerator = () => {
    const store = useStore()
    return ({ dataset, ms, color, editable }) => {
        const chartName = document.getElementById('phonemesWave');

        return new Chart(chartName, {
            type: 'scatter',
            data: {
                datasets: [{
                    fill: false,
                    backgroundColor: color,
                    borderColor: color,
                    data: dataset.value,
                    borderWidth: 2,
                    showLine: true,
                    cubicInterpolationMode: 'monotone',
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
                  showTooltip: true, // Recommended. This will show the tooltip while the user
                  // drags the datapoint
                },
                onDragEnd: function (event, datasetIndex, index, value) {
                    store.dispatch('updatePoint', value)
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
                            callback: (value, index) => ms.value.includes(value) ? dataset.value.find(obj => obj.x === index).phonem : undefined,
                        }
                    }]
                },
            }
        });
    }
};

export default getChartGenerator;