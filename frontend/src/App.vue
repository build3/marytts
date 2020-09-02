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
                <mary-tabs />

                <div v-if="activeTab === textTab">
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
                            <audio-button
                                :isXml="false"
                                :shouldDisable="generateButtonDisabled"
                                :actionArgs="{ selectedVoice, userText }"
                            />
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
                </div>

                <div v-else-if="activeTab === xmlTab">
                    <from-xml />
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
import { textTab, xmlTab } from './store/index';

import { ref, watch, computed } from "vue";
import { useStore } from "vuex";

export default {
    setup () {
        const store = useStore();

        const voiceTypes = computed(() => store.state.voiceSet);
        const stream = computed(() => store.state.stream);

        const userText = ref('');
        const selectedVoice = ref(null);

        const generateButtonDisabled = computed(() => !selectedVoice.value || !userText.value);

        const xmlUrl = computed(() => store.getters.maryttsXmlUrl);

        const activeTab = computed(() => store.state.currentActiveTab);

        return {
            stream,
            userText,
            selectedVoice,
            voiceTypes,
            generateButtonDisabled,
            xmlUrl,
            activeTab,
            textTab,
            xmlTab,
        }
    },
};
</script>
