<template>
    <div class="file is-centered is-fullwidth">
        <label class="file-label">
            <input class="file-input"
                type="file"
                @change="swapFile" />

            <span class="file-cta">
                <span class="file-icon">
                    <font-awesome-icon icon="upload" />
                </span>
                <span class="file-label">
                    Choose an XML file…
                </span>
            </span>

            <span class="file-name">
                {{ fileName }}
            </span>
        </label>
    </div>

    <voice-select />

    <audio-button
        isXml
        :disabled="generateButtonDisabled" />
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

        const fileName = computed(() => {
            if (!xmlFile.value) {
                return '';
            }

            return xmlFile.value.name;
        });

        return {
            xmlFile,
            swapFile,
            generateButtonDisabled,
            fileName,
        }
    }
}
</script>
