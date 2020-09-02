<template>
    <div>
        <div class="file is-centered">
            <label class="file-label">
                <input class="file-input"
                    type="file"
                    @change="swapFile">
                <span class="file-cta">
                    <span class="file-icon">
                        <font-awesome-icon icon="upload" />
                    </span>
                    <span class="file-label">
                        Choose a XML file…
                    </span>
                </span>
            </label>
        </div>

        <button class="button has-text-weight-bold is-primary mt-2 mb-4 is-fullwidth"
            :class="toggleLoader"
            :disabled="generateButtonDisabled"
            @click="generateAudio">Generate audio</button>
    </div>
</template>

<script>
import { ref, watch, computed } from "vue";
import { useStore } from "vuex";

export default {
    setup() {
        const store = useStore();

        const xmlFile = ref(null);

        const swapFile = ((file) => {
            xmlFile.value = file.target.files[0];
        });

        const toggleLoader = computed(() => store.getters.toggleLoader);

        const generateButtonDisabled = computed(() => !xmlFile.value);

        return {
            xmlFile,
            swapFile,
            generateButtonDisabled,
            toggleLoader,
        }
    }
}
</script>
