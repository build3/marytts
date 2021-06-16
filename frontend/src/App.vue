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
    <section class="is-flex is-flex-direction-column is-align-items-stretch px-5">
        <mary-tabs />

        <component :is="currentActiveTabComponent" />

        <audio
            class="pt-4"
            :class="{ 'is-invisible': isStreamEmpty }"
            :src="stream"
            autoplay="true"
            controls=""
            type="audio/wave" />

        <div class="chart-size-container">
            <div class="chart-size">
                <canvas id="phonemesWave"></canvas>
            </div>
        </div>
    </section>
    <component :is="currentActiveTabFooter" :isStreamEmpty="isStreamEmpty" />
</template>

<script>
import { computed } from "vue";
import { useStore } from "vuex";

export default {
    setup () {
        const store = useStore();

        const stream = computed(() => store.state.stream);
        const isStreamEmpty = computed(() => !stream.value)

        const currentActiveTabComponent = computed(() => store.getters.currentActiveTabComponent);
        const currentActiveTabFooter = computed(() => store.getters.currentActiveTabFooter);

        const errors = computed(() => store.state.errors);

        const resetErrors = (() => store.commit('setError', null));

        return {
            stream,
            isStreamEmpty,
            errors,
            resetErrors,
            currentActiveTabComponent,
            currentActiveTabFooter
        }
    },
};
</script>
