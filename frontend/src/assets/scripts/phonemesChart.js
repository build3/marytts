import Chart from "chart.js";
import 'chartjs-plugin-dragdata';

const getChartGenerator = () => {

    return (phonemes, hertz, color, test) => {
        const chartName = document.getElementById('phonemesWave');

        return new Chart(chartName, {
            type: 'line',
            data: {
                labels: phonemes.value,
                datasets: [{
                    label: 'Phonemes wave',
                    fill: false,
                    backgroundColor: color,
                    borderColor: color,
                    data: hertz.value,
                    borderWidth: 2,
                }]
            },
            options: {
                dragData: true,
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
