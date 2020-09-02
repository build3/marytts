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
                    <from-text />
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
import { computed } from "vue";
import { useStore } from "vuex";

import { textTab, xmlTab } from './store/index';

export default {
    setup () {
        const store = useStore();

        const stream = computed(() => store.state.stream);

        const activeTab = computed(() => store.state.currentActiveTab);

        return {
            stream,
            activeTab,
            textTab,
            xmlTab,
        }
    },
};
</script>
