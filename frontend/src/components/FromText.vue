<template>
    <div class="field">
        <div class="control">
            <input class="input is-primary" type="text"
                placeholder="Insert your text here"
                :value="getUserText"
                @input="setUserText">
        </div>
    </div>

    <voice-select />

    <div class="button-row">
        <audio-button :disabled="generateButtonDisabled" />

        <button
            class="button has-text-weight-bold is-primary is-fullwidth"
            :disabled="simplifyDisabled"
        >
            Simplify &amp; edit
        </button>
    </div>
</template>

<script>
import { computed } from "vue";
import { useStore } from "vuex";

export default {
    setup() {
        const store = useStore();

        const getUserText = computed(() => store.state.userText);
        const setUserText = (({ target: { value } }) => store.dispatch('updateUserText', value));

        const getSelectedVoice = computed(() => store.state.selectedVoiceId);

        const generateButtonDisabled = computed(() => !getSelectedVoice.value || !getUserText.value);

        const simplifyDisabled = computed(() => !store.state.stream);

        return {
            getUserText,
            setUserText,
            getSelectedVoice,
            generateButtonDisabled,
            simplifyDisabled,
        }
    }
}
</script>
