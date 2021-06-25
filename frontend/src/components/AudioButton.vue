<template>
    <button class="button has-text-weight-bold is-primary is-fullwidth"
        :class="toggleLoader"
        :disabled="disabled"
        @click="generateAudio">Generate audio</button>
</template>

<script>
import { computed } from "vue";
import { useStore } from "vuex";

import getChartGenerator from "../assets/scripts/phonemesChart.js";

export default {
    props: {
        isXml: {
            required: false,
            type: Boolean,
            default: false,
        },
        disabled: Boolean,
    },

    setup(props) {
        const store = useStore();

        const chartColor = computed(() => store.state.chartColor);

        const phonemeNames = computed(() => store.state.phonemeNames);
        const hertzPoints = computed(() => store.state.hertzPoints);
        const ms = computed(() => store.state.ms)

        const toggleLoader = computed(() => store.getters.toggleLoader);

        const generateChart = getChartGenerator();
        const currentChart = computed(() => store.state.currentChart);

        const chartDataset = computed(() => store.state.chartDataset);

        const generateAudio = async () => {
            if (props.isXml) {
                await Promise.all([
                    store.dispatch('audioStreamFromXml'),
                    store.dispatch('graphPhonemesFromXml'),
                ])
            } else {
                await Promise.all([
                    store.dispatch('audioStream'),
                    store.dispatch('graphPhonemes'),
                ])
            }

            if (phonemeNames.value.length > 0 && hertzPoints.value.length > 0) {
                if (currentChart.value) {
                    store.dispatch('updateChart');
                } else {
                    const chart = generateChart({
                        color: chartColor.value,
                        ms,
                        dataset: chartDataset,
                        editable: false
                    });
                    store.dispatch('setNewChart', chart);
                }
            }
        };

        return {
            toggleLoader,
            generateAudio,
        }
    },
}
</script>
