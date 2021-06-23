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

    <div class="button-row">
        <audio-button isXml @click="resetSimplifiedVersionLoaded" :disabled="generateButtonDisabled" />

        <button
            class="button has-text-weight-bold is-primary is-fullwidth"
            :class="rightButtonLoaderClass"
            :disabled="simplifyDisabled"
            @click="onRightButtonClick"
        >
            {{ rightButtonLabel }}
        </button>
    </div>
</template>

<script>
import { computed, ref } from "vue";
import { useStore } from "vuex";

export default {
    setup() {
        const store = useStore();

        const simplifiedVersionLoaded = ref(false)
        const xmlFile = computed(() => store.state.xmlFile);
        const simplifyDisabled = computed(() => !store.state.stream);

        const swapFile = (({ target: { files }}) => store.dispatch('updateXmlFile', files[0]));

        const generateButtonDisabled = computed(() => !xmlFile.value);

        const fileName = computed(() => {
            if (!xmlFile.value) {
                return '';
            }

            return xmlFile.value.name;
        });

        const rightButtonLoaderClass = computed(() => store.getters.toggleLoader);

        const rightButtonLabel = computed(() => simplifiedVersionLoaded.value
          ? 'Generate audio from edited points'
          : 'Simplify & edit'
        );

        function resetSimplifiedVersionLoaded() {
            simplifiedVersionLoaded.value = false
        }

        function onRightButtonClick() {
            if (simplifiedVersionLoaded.value) {
                generateAudioFromEditedPoints()
            } else {
                openSimplifyModal()
            }
        }

        return {
            xmlFile,
            swapFile,
            generateButtonDisabled,
            fileName,
            rightButtonLoaderClass,
            rightButtonLabel,
            simplifiedVersionLoaded,
            resetSimplifiedVersionLoaded,
            simplifyDisabled,
            onRightButtonClick
        }
    }
}
</script>
