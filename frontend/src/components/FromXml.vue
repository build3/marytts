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
            :shouldDisable="generateButtonDisabled" />
    </div>
</template>

<script>
import { computed } from "vue";
import { useStore } from "vuex";

export default {
    setup() {
        const store = useStore();

        const xmlFile = computed(() => store.state.xmlFile);

        const swapFile = (({ target: { files }}) => store.dispatch('updateXmlFile', files[0]));

        const generateButtonDisabled = computed(() => !xmlFile.value);

        return {
            xmlFile,
            swapFile,
            generateButtonDisabled,
        }
    }
}
</script>
