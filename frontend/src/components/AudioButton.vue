<template>
    <button class="button has-text-weight-bold is-primary mt-2 mb-4 is-fullwidth"
        :class="toggleLoader"
        :disabled="props.disabled"
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

        const chartColor = "#00d1b2";

        const phonemeNames = computed(() => store.state.phonemeNames);
        const hertzPoints = computed(() => store.state.hertzPoints);

        const toggleLoader = computed(() => store.getters.toggleLoader);

        const generateChart = getChartGenerator();
        const currentChart = computed(() => store.state.currentChart);

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
                    const chart = generateChart(phonemeNames, hertzPoints, chartColor);
                    store.dispatch('setNewChart', chart);
                }
            }
        };

        return {
            toggleLoader,
            generateAudio,
            props,
        }
    },
}
</script>
