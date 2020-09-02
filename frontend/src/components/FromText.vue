<template>
    <div>
        <div class="field">
            <div class="control">
                <input class="input is-primary" type="text"
                    placeholder="Insert your text here" :value="getUserText" @input="setUserText">
            </div>
        </div>

        <voice-select />

        <div class="columns">
            <div class="column is-half">
                <audio-button
                    :isXml="false"
                    :shouldDisable="generateButtonDisabled" />
            </div>
            <div class="column is-half">
                <a :href="xmlUrl">
                    <button
                        class="button has-text-weight-bold is-primary mt-2 mb-4 is-fullwidth"
                        :disabled="generateButtonDisabled">Export XML</button>
                </a>
            </div>
        </div>
    </div>
</template>

<script>
import { computed } from "vue";
import { useStore } from "vuex";

export default {
    setup() {
        const store = useStore();

        const getUserText = computed(() => store.state.userText);
        const setUserText = ((event) => store.dispatch('updateUserText', event.target.value));

        const getSelectedVoice = computed(() => store.state.selectedVoiceId);

        const generateButtonDisabled = computed(() => !getSelectedVoice.value || !getUserText.value);

        const xmlUrl = computed(() => store.getters.maryttsXmlUrl);

        return {
            generateButtonDisabled,
            xmlUrl,
            getUserText,
            setUserText,
            getSelectedVoice,
        }
    }
}
</script>
