<template>
  <div class="button-row py-4">
    <button
      class="button is-primary has-text-weight-bold is-flex-mobile-button"
      :disabled="!stream"
      @click="playStream"
    >
      <span class="icon is-small">
        <play-icon />
      </span>
      <span class="button-label"> Play audio </span>
    </button>

    <button
      class="
        button
        has-text-weight-bold
        is-primary is-fullwidth is-flex-mobile-button
      "
      :disabled="simplifyDisabled"
      @click="openSimplifyModal"
    >
      <span class="icon is-small">
        <edit-icon />
      </span>
      <span class="button-label"> Simplify &amp; edit </span>
    </button>

    <a :href="xmlDownloadUrl" download="MaryTTS.xml" v-if="xmlDownloadUrl">
      <button
        class="
          button
          has-text-weight-bold
          is-primary is-fullwidth is-flex-mobile-button
        "
      >
        <span class="icon is-medium">
          <export-icon />
        </span>
        <span class="button-label">Export to XML</span>
      </button>
    </a>
    <button
      class="
        button
        has-text-weight-bold
        is-primary is-fullwidth is-flex-mobile-button
      "
      v-else
      disabled
    >
      <span class="icon is-medium">
        <export-icon />
      </span>
      <span class="button-label">Export to XML</span>
    </button>
  </div>

  <transition name="fade">
    <div class="modal is-active" v-if="simplifyModalShown">
      <div class="modal-background" />
      <div class="modal-content">
        <div class="box p-5">
          <h1 class="title has-text-centered is-4 mb-5">
            Are you sure you want to simplify &amp; edit the chart? It will
            overwrite the current one.
          </h1>
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

<script setup>
import { computed, ref } from 'vue'

import getChartGenerator from '../assets/scripts/phonemesChart'
import { useStore } from '../store/createStore'

import EditIcon from '../icons/Edit.vue'
import PlayIcon from '../icons/Play.vue'
import ExportIcon from '../icons/Export.vue'

const store = useStore()

const chartColor = computed(() => store.chartColor)
const dataset = computed(() => store.dataset)
const originalDataset = computed(() => store.originalDataset)
const generateChart = getChartGenerator()

const simplifyModalShown = ref(false)

const simplifyDisabled = computed(
  () => !store.stream || store.simplifiedVersionLoaded,
)

function closeSimplifyModal() {
  simplifyModalShown.value = false
}

function openSimplifyModal() {
  simplifyModalShown.value = true
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
    originalDataset: originalDataset.value,
    editable: true,
  })

  closeSimplifyModal()
}

const xmlDownloadUrl = computed(() => store.xmlDownloadUrl)

const stream = computed(() => store.stream)
const playStream = () => {
  store.playStream()
}
</script>
