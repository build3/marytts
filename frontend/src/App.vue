<template>
    <nav class="navbar" role="navigation" aria-label="main navigation">
        <div class="navbar-brand">
            <h1 class="navbar-item">
                Mary Text to Speech
            </h1>
        </div>
    </nav>
    <div class="notification is-danger mt-5" v-if="errors">
        <button class="delete" @click="resetErrors"></button>
        {{ errors }}
    </div>
    <section>
        <div class="columns mt-2 is-mobile is-centered">
            <div class="column is-half">
                <mary-tabs />

                <component :is="currentActiveTabComponent" />

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

export default {
    setup () {
        const store = useStore();

        const stream = computed(() => store.state.stream);

        const currentActiveTabComponent = computed(() => store.getters.currentActiveTabComponent);

        const errors = computed(() => store.state.errors);

        const resetErrors = (() => store.commit('setError', null));

        return {
            stream,
            errors,
            resetErrors,
            currentActiveTabComponent,
        }
    },
};
</script>
