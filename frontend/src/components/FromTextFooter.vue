<template>
    <footer
        class="button-row px-5 pb-5"
        :class="{ 'is-invisible': isStreamEmpty }"
    >
        <button
            class="button is-primary is-fullwidth has-text-weight-bold"
            @click="playStream"
        >
            Play audio
        </button>

        <button
            class="button has-text-weight-bold is-primary is-fullwidth"
            :disabled="generateButtonDisabled"
            @click="generateXml"
        >
            Export XML
        </button>
    </footer>
</template>

<script>
import { computed, inject } from "vue";
import { useStore } from "vuex";

export default {
    props: {
        isStreamEmpty: Boolean
    },

    setup() {
        const store = useStore();

        const simplifiedVersionLoaded = inject('simplifiedVersionLoaded')
        const selectedVoiceId = computed(() => store.state.selectedVoiceId);
        const userText = computed(() => store.state.userText);
        const generateButtonDisabled = computed(() => !selectedVoiceId.value || !userText.value);

        const playStream = () => {
            store.dispatch('playStream')
        }

        const generateXml = () => {
            if (simplifiedVersionLoaded.value) {
              store.dispatch('generateSimplifiedXmlFileFromText')
            } else {
              store.dispatch('generateXmlFileFromText')
            }
        };

        return {
            generateButtonDisabled,
            playStream,
            generateXml,
        }
    }
}
</script>
