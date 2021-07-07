<template>
  <div class="file is-centered is-fullwidth">
    <label class="file-label">
      <input class="file-input" type="file" @change="swapFile" />

      <span class="file-cta">
        <span class="file-icon">
          <font-awesome-icon icon="upload" />
        </span>
        <span class="file-label"> Choose an XML file… </span>
      </span>

      <span class="file-name">
        {{ fileName }}
      </span>
    </label>
  </div>

  <voice-select />

  <div class="button-row">
    <audio-button
      is-xml
      @click="resetSimplifiedVersionLoaded"
      :disabled="generateButtonDisabled"
    />

    <button
      class="button has-text-weight-bold is-primary is-fullwidth"
      :disabled="simplifyDisabled"
      @click="onRightButtonClick"
    >
      {{ rightButtonLabel }}
    </button>
  </div>

  <transition name="fade">
    <div class="modal is-active" v-if="simplifyModalShown">
      <div class="modal-background" />
      <div class="modal-content">
        <div class="box p-5">
          <h1 class="title has-text-centered is-4 mb-0">
            Are you sure you want to simplify &amp; edit the chart? This will
            overwrite the current one.
          </h1>
          <h2 class="subtitle has-text-centered is-6 my-0 py-5">
            In order to bring back the original audio file use the "Generate
            audio" button.
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
import { computed, inject, ref } from 'vue'
import useStore from '../store'

import getChartGenerator from '../assets/scripts/phonemesChart'

export default {
  setup() {
    const store = useStore()

    const chartColor = computed(() => store.chartColor)
    const dataset = computed(() => store.chartDataset)
    const generateChart = getChartGenerator()

    const simplifyModalShown = ref(false)
    const simplifiedVersionLoaded = inject('simplifiedVersionLoaded')
    const setSimplifiedVersionLoaded = inject('setSimplifiedVersionLoaded')
    const xmlFile = computed(() => store.xmlFile)
    const simplifyDisabled = computed(() => !store.stream)

    const swapFile = ({
      target: {
        files: [firstFile],
      },
    }) => {
      store.xmlFile = firstFile
    }

    const generateButtonDisabled = computed(() => !xmlFile.value)

    const fileName = computed(() => {
      if (!xmlFile.value) {
        return ''
      }

      return xmlFile.value.name
    })

    const rightButtonLabel = computed(() =>
      simplifiedVersionLoaded.value
        ? 'Generate audio from edited points'
        : 'Simplify & edit',
    )

    function openSimplifyModal() {
      simplifyModalShown.value = true
    }

    function closeSimplifyModal() {
      simplifyModalShown.value = false
    }

    function resetSimplifiedVersionLoaded() {
      setSimplifiedVersionLoaded(false)
    }

    function generateAudioFromEditedPoints() {
      // store.dispatch('generateAudioFromEditedPointsXml')
    }

    function onRightButtonClick() {
      if (simplifiedVersionLoaded.value) {
        generateAudioFromEditedPoints()
      } else {
        openSimplifyModal()
      }
    }

    async function generateAudio() {
      await Promise.all([
        // store.dispatch('simplifiedAudioStreamFromXml'),
        // store.dispatch('simplifiedGraphPhonemesFromXml'),
      ])

      generateChart({
        color: chartColor.value,
        dataset: dataset.value,
        editable: true,
      })

      setSimplifiedVersionLoaded(true)
      closeSimplifyModal()
    }

    return {
      xmlFile,
      swapFile,
      generateButtonDisabled,
      fileName,
      rightButtonLabel,
      simplifiedVersionLoaded,
      resetSimplifiedVersionLoaded,
      simplifyDisabled,
      onRightButtonClick,
      openSimplifyModal,
      simplifyModalShown,
      closeSimplifyModal,
      generateAudio,
    }
  },
}
</script>
