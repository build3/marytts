<template>
    <footer
        class="button-row px-5 pb-5"
        :class="{ 'is-invisible': isStreamEmpty }"
    >
        <button
            class="button is-primary is-fullwidth"
            @click="playStream"
        >
            <b>Play audio</b>
        </button>

        <a :href="xmlUrl">
            <button
                class="button has-text-weight-bold is-primary is-fullwidth"
                :disabled="generateButtonDisabled">Export XML</button>
        </a>
    </footer>
</template>

<script>
import { computed } from "vue";
import { useStore } from "vuex";

export default {
    props: {
        isStreamEmpty: Boolean
    },

    setup() {
        const store = useStore();

        const selectedVoiceId = computed(() => store.state.selectedVoiceId);
        const userText = computed(() => store.state.userText);
        const generateButtonDisabled = computed(() => !selectedVoiceId.value || !userText.value);

        const xmlUrl = computed(() => store.getters.maryttsXmlUrl);

        const playStream = () => {
            store.dispatch('playStream')
        }

        return {
            generateButtonDisabled,
            xmlUrl,
            playStream,
        }
    }
}
</script>
