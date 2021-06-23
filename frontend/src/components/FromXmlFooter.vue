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
import { computed } from "vue";
import { useStore } from "vuex";

export default {
    props: {
        isStreamEmpty: Boolean
    },

    setup() {
        const store = useStore();

        const playStream = () => {
            store.dispatch('playStream')
        }

        const generateXml = async () => {
            await store.dispatch('generateXmlFileFromXML')
        };

        const selectedVoiceId = computed(() => store.state.selectedVoiceId);
        const generateButtonDisabled = computed(() => !selectedVoiceId.value);

        return {
            playStream,
            generateXml,
            generateButtonDisabled
        }
    }
}
</script>
