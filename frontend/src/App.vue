<template>
    <nav class="navbar" role="navigation" aria-label="main navigation">
            <div class="navbar-brand">
                <h1 class="navbar-item">
                    Mary Text to Speech
                </h1>
            </div>
    </nav>
    <section>
        <div class="columns mt-2 is-mobile is-centered">
            <div class="column is-half">
                <div class="field">
                    <div class="control">
                        <input class="input is-primary" type="text"
                            placeholder="Insert your text here" v-model="userText">
                    </div>
                </div>

                <div class="field mt-2">
                    <div class="control">
                        <div class="select is-fullwidth is-primary">
                            <select v-model="selectedVoice">
                                <option :value="null" disabled>Select voice</option>
                                <option :value="id"
                                    v-for="{id, locale, sex, type} in voiceTypes" :key="id">
                                    {{ locale }} - {{ sex }} - {{ type }}</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="columns">
                    <div class="column is-half">
                        <button class="button has-text-weight-bold is-primary mt-2 mb-4 is-fullwidth"
                            :class="toggleLoader"
                            :disabled="generateButtonDisabled"
                            @click="generateAudio">Generate audio</button>
                    </div>
                    <div class="column is-half">
                        <a :href="xmlUrl(userText, selectedVoice)">
                            <button
                                class="button has-text-weight-bold is-primary mt-2 mb-4 is-fullwidth"
                                :disabled="generateButtonDisabled"
                                >Export XML</button>
                        </a>
                    </div>
                </div>

                <audio v-if="stream" :src="stream" autoplay="true" controls="" type="audio/wave"></audio>
            </div>
        </div>
        <div class="chart-size">
            <canvas id="phonemesWave"></canvas>
        </div>
    </section>
</template>
<script>
import getChartGenerator from "./assets/scripts/phonemesChart.js";

import { ref, watch, computed } from "vue";
import { useStore } from "vuex";

export default {
    setup () {
        const store = useStore();

        const chartColor = "#00d1b2";

        const voiceTypes = computed(() => store.state.voiceSet);
        const stream = computed(() => store.state.stream);
        const toggleLoader = computed(() => store.getters.toggleLoader);

        const phonemeNames = computed(() => store.state.phonemeNames);
        const hertzPoints = computed(() => store.state.hertzPoints);

        const userText = ref('');
        const selectedVoice = ref(null);

        const generateChart = getChartGenerator();

        const generateAudio = async () => {
            await store.dispatch('audioStream', {
                selectedVoice,
                userText
            });

            await store.dispatch('graphPhonemes', {
                selectedVoice,
                userText
            });

            generateChart(phonemeNames, hertzPoints, chartColor);
        };

        const generateButtonDisabled = computed(() => !selectedVoice.value || !userText.value);

        const xmlUrl = computed(() => store.getters.maryttsXmlUrl);

        return {
            stream,
            generateAudio,
            userText,
            selectedVoice,
            voiceTypes,
            toggleLoader,
            generateButtonDisabled,
            xmlUrl,
        }
    },
};
</script>
