<template>
    <footer
        class="px-5 pb-5"
        :class="{ 'is-invisible': isStreamEmpty }"
    >
        <button
            class="button is-primary is-fullwidth has-text-weight-bold"
            @click="playStream"
        >
            Play audio
        </button>
    </footer>
</template>

<script>
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

        return {
            playStream,
        }
    }
}
</script>
