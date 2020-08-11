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

                <button class="button has-text-weight-bold is-primary mt-2 mb-4 is-fullwidth"
                    :class="toggleLoader"
                    :disabled="generateButtonDisabled"
                    @click="generateAudio">Generate audio</button>

                <audio v-if="stream" :src="stream" autoplay="true" controls="" type="audio/wave"></audio>
            </div>
        </div>
    </section>
</template>
<script>
import { ref, watch, computed } from "vue";
import { useStore } from "vuex";

export default {
    setup () {
        const store = useStore();

        const voiceTypes = computed(() => store.state.voiceSet);
        const stream = computed(() => store.state.stream);
        const toggleLoader = computed(() => store.getters.toggleLoader);

        const userText = ref('');
        const selectedVoice = ref(null);

        const generateAudio = () => {
            store.dispatch('audioStream', {
                selectedVoice,
                userText
            });
        };

        const generateButtonDisabled = computed(() => !selectedVoice.value || !userText.value);

        return {
            stream,
            generateAudio,
            userText,
            selectedVoice,
            voiceTypes,
            toggleLoader,
            generateButtonDisabled,
        }
    },
};
</script>
