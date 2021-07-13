<template>
  <div class="field">
    <div class="control">
      <input
        class="input is-primary"
        type="text"
        placeholder="Insert your text here"
        v-model="store.userText"
      />
    </div>
  </div>

  <voice-select />

  <div class="button-row">
    <audio-button
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
import { useStore } from '../store/createStore'

import getChartGenerator from '../assets/scripts/phonemesChart'

export default {
  setup() {
    const store = useStore()

    const chartColor = computed(() => store.chartColor)
    const dataset = computed(() => store.dataset)
    const generateChart = getChartGenerator()

    const simplifyModalShown = ref(false)
    const simplifiedVersionLoaded = inject('simplifiedVersionLoaded')
    const setSimplifiedVersionLoaded = inject('setSimplifiedVersionLoaded')

    const selectedVoiceType = computed(() => store.selectedVoiceType)

    const generateButtonDisabled = computed(
      () => !selectedVoiceType.value || !store.userText,
    )

    const simplifyDisabled = computed(() => !store.stream)

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

    async function generateAudio() {
      store.simplifyAcoustParamsDocument()

      await Promise.all([
        store.getAudioStream({
          inputType: 'ACOUSTPARAMS',
          simplified: true,
        }),
        store.getAudioPhonemes({
          inputType: 'ACOUSTPARAMS',
          simplified: true,
        }),
      ])

      generateChart({
        color: chartColor.value,
        dataset: dataset.value,
        editable: true,
      })

      setSimplifiedVersionLoaded(true)
      closeSimplifyModal()
    }

    function generateAudioFromEditedPoints() {
      store.getAudioStream({
        inputType: 'ACOUSTPARAMS',
        simplified: true,
      })
    }

    function resetSimplifiedVersionLoaded() {
      setSimplifiedVersionLoaded(false)
    }

    function onRightButtonClick() {
      if (simplifiedVersionLoaded.value) {
        generateAudioFromEditedPoints()
      } else {
        openSimplifyModal()
      }
    }

    return {
      generateButtonDisabled,
      simplifyDisabled,
      generateAudio,
      simplifyModalShown,
      openSimplifyModal,
      closeSimplifyModal,
      simplifiedVersionLoaded,
      resetSimplifiedVersionLoaded,
      onRightButtonClick,
      rightButtonLabel,
      store,
    }
  },
}
</script>
