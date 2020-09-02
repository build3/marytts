<template>
    <button class="button has-text-weight-bold is-primary mt-2 mb-4 is-fullwidth"
        :class="toggleLoader"
        :disabled="generateButtonDisabled"
        @click="generateAudio">Generate audio</button>
</template>

<script>
import { computed } from "vue";
import { useStore } from "vuex";

import getChartGenerator from "../assets/scripts/phonemesChart.js";

export default {
    props: {
        isXml: Boolean,
        shouldDisable: Boolean,
        actionArgs: Object
    },

    setup(props) {
        const store = useStore();

        const chartColor = "#00d1b2";

        const phonemeNames = computed(() => store.state.phonemeNames);
        const hertzPoints = computed(() => store.state.hertzPoints);

        const toggleLoader = computed(() => store.getters.toggleLoader);

        const generateButtonDisabled = computed(() => props.shouldDisable);

        const generateChart = getChartGenerator();

        const generateAudio = async () => {
            if (props.isXml) {
                const { xml } = props.actionArgs;

                await store.dispatch('audioStreamFromXml', xml);
                await store.dispatch('graphPhonemesFromXml', xml);
            } else {
                await store.dispatch('audioStream', props.actionArgs);
                await store.dispatch('graphPhonemes', props.actionArgs);
            }

            generateChart(phonemeNames, hertzPoints, chartColor);
        };

        return {
            generateButtonDisabled,
            toggleLoader,
            generateAudio,
        }
    },
}
</script>
