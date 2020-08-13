import Chart from "chart.js";

const getChartGenerator = () => {

    let phonemesChart;

    return (phonemes, hertz, color, test) => {
        const chartName = document.getElementById('phonemesWave');

        phonemesChart?.destroy();

        phonemesChart = new Chart(chartName, {
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
                maintainAspectRatio: false,
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
        })
    }
};

export default getChartGenerator;