<template>
    <div>
        <div class="file is-centered mt-2 mb-5">
            <label class="file-label">
                <input class="file-input"
                    type="file"
                    @change="swapFile">
                <span class="file-cta">
                    <span class="file-icon">
                        <font-awesome-icon icon="upload" />
                    </span>
                    <span class="file-label">
                        Choose a XML file…
                    </span>
                </span>
            </label>
        </div>

        <button class="button has-text-weight-bold is-primary mt-2 mb-4 is-fullwidth"
            :class="toggleLoader"
            :disabled="generateButtonDisabled"
            @click="generateAudio">Generate audio</button>
    </div>
</template>

<script>
import getChartGenerator from "../assets/scripts/phonemesChart.js";

import { ref, computed } from "vue";
import { useStore } from "vuex";

export default {
    setup() {
        const store = useStore();

        const chartColor = "#00d1b2";

        const phonemeNames = computed(() => store.state.phonemeNames);
        const hertzPoints = computed(() => store.state.hertzPoints);

        const xmlFile = ref(null);

        const swapFile = ((file) => {
            xmlFile.value = file.target.files[0];
        });

        const toggleLoader = computed(() => store.getters.toggleLoader);

        const generateButtonDisabled = computed(() => !xmlFile.value);

        const generateChart = getChartGenerator();

        const generateAudio = async () => {
            await store.dispatch('audioStreamFromXml', xmlFile.value);

            await store.dispatch('graphPhonemesFromXml', xmlFile.value);

            generateChart(phonemeNames, hertzPoints, chartColor);
        };

        return {
            xmlFile,
            swapFile,
            generateButtonDisabled,
            toggleLoader,
            generateAudio,
        }
    }
}
</script>
