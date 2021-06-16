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
            @click="openSimplifyModal"
            :disabled="simplifyDisabled"
        >
            Simplify &amp; edit
        </button>
    </div>

    <transition name="fade">
        <div class="modal is-active" v-if="simplifyModalShown">
            <div class="modal-background" />
            <div class="modal-content">
                <div class="box p-5">
                    <h1 class="title has-text-centered is-4 mb-0">
                        Are you sure you want to simplify &amp; edit the chart? This will overwrite the
                        current one.
                    </h1>
                    <h2 class="subtitle has-text-centered is-6 my-0 py-5">
                        In order to bring back the original audio file use the "Generate audio" button.
                    </h2>
                    <div class="button-row">
                        <button
                            class="button has-text-weight-bold is-danger is-fullwidth"
                            @click="generateAudio"
                        >
                            Yes
                        </button>
                        <button
                            class="button has-text-weight-bold is-primary is-fullwidth"
                            @click="closeSimplifyModal"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
import { computed, ref } from "vue";
import { useStore } from "vuex";

export default {
    setup() {
        const store = useStore();

        const getUserText = computed(() => store.state.userText);
        const setUserText = (({ target: { value } }) => store.dispatch('updateUserText', value));

        const getSelectedVoice = computed(() => store.state.selectedVoiceId);

        const generateButtonDisabled = computed(() => !getSelectedVoice.value || !getUserText.value);

        const simplifyDisabled = computed(() => !store.state.stream);

        const simplifyModalShown = ref(false)

        function openSimplifyModal() {
            simplifyModalShown.value = true
        }

        function closeSimplifyModal() {
            simplifyModalShown.value = false
        }

        async function generateAudio() {
            store.dispatch('simplifiedAudioStream')
            store.dispatch('simplifiedGraphPhonemes')
            store.dispatch('generateAudioFromEditedPoints')
            closeSimplifyModal()
        };

        return {
            getUserText,
            setUserText,
            getSelectedVoice,
            generateButtonDisabled,
            simplifyDisabled,
            generateAudio,
            simplifyModalShown,
            openSimplifyModal,
            closeSimplifyModal
        }
    }
}
</script>
