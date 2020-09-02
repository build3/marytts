<template>
    <div>
        <div class="file is-centered mt-2 mb-5">
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

        <audio-button
            :isXml="true"
            :shouldDisable="generateButtonDisabled"
            :actionArgs="{ xml: xmlFile }"
        />
    </div>
</template>

<script>
import { ref, computed } from "vue";
import { useStore } from "vuex";

export default {
    setup() {
        const store = useStore();

        const xmlFile = ref(null);

        const swapFile = ((file) => {
            xmlFile.value = file.target.files[0];
        });

        const generateButtonDisabled = computed(() => !xmlFile.value);

        return {
            xmlFile,
            swapFile,
            generateButtonDisabled,
        }
    }
}
</script>
