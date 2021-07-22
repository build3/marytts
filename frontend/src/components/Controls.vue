<template>
  <div class="controls">
    <div
      class="controls-section-row pt-2 pb-0"
      v-show="simplifiedVersionLoaded"
    >
      <div class="controls-section-label">Play audio</div>
      <div class="controls-section-label">Export XML</div>
    </div>
    <div
      class="button-row pb-4"
      :class="{
        'is-condensed': simplifiedVersionLoaded,
        'pt-2': simplifiedVersionLoaded,
        'pt-4': !simplifiedVersionLoaded,
      }"
      v-show="areControlsVisible"
    >
      <button
        class="button is-primary has-text-weight-bold is-flex-mobile-button"
        :disabled="!stream"
        @click="playStream"
      >
        <span class="icon is-small">
          <play-icon />
        </span>
        <span class="button-label">{{ playButtonLabel }}</span>
      </button>

      <button
        class="button is-primary has-text-weight-bold is-flex-mobile-button"
        v-if="simplifiedVersionLoaded"
        @click="playOriginalStream"
      >
        <span class="icon is-small">
          <play-icon />
        </span>
        <span class="button-label">Original</span>
      </button>

      <button
        class="
          button
          has-text-weight-bold
          is-primary is-fullwidth is-flex-mobile-button
        "
        :disabled="simplifyDisabled"
        v-if="!simplifiedVersionLoaded"
        @click="openSimplifyModal"
      >
        <span class="icon is-small">
          <edit-icon />
        </span>
        <span class="button-label"> Simplify &amp; edit </span>
      </button>

      <div class="button-row-spacer" v-if="simplifiedVersionLoaded"></div>

      <anchor-button :href="xmlDownloadUrl" file-name="MaryTTS.xml">
        <template #default="{ disabled }">
          <button
            class="
              button
              has-text-weight-bold
              is-primary is-fullwidth is-flex-mobile-button
            "
            :disabled="disabled"
          >
            <span class="icon is-medium">
              <export-icon />
            </span>
            <span class="button-label">{{ exportXmlButtonLabel }}</span>
          </button>
        </template>
      </anchor-button>

      <anchor-button
        :href="xmlOriginalDownloadUrl"
        file-name="MaryTTS.xml"
        v-if="xmlOriginalDownloadUrl"
      >
        <template #default="{ disabled }">
          <button
            class="
              button
              has-text-weight-bold
              is-primary is-fullwidth is-flex-mobile-button
            "
            :disabled="disabled"
          >
            <span class="icon is-medium">
              <export-icon />
            </span>
            <span class="button-label">Original</span>
          </button>
        </template>
      </anchor-button>
    </div>
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
import AnchorButton from './AnchorButton.vue'

const store = useStore()

const chartColor = computed(() => store.chartColor)
const dataset = computed(() => store.dataset)
const originalDataset = computed(() => store.originalDataset)
const generateChart = getChartGenerator()

const simplifyModalShown = ref(false)

const xmlDownloadUrl = computed(() => store.xmlDownloadUrl)
const xmlOriginalDownloadUrl = computed(() => store.xmlOriginalDownloadUrl)
const stream = computed(() => store.stream)
const simplifiedVersionLoaded = computed(() => store.simplifiedVersionLoaded)

const simplifyDisabled = computed(
  () => !store.stream || store.simplifiedVersionLoaded,
)

const areControlsVisible = computed(() => Boolean(store.dataset))

const playButtonLabel = computed(() =>
  store.simplifiedVersionLoaded ? 'Current' : 'Play',
)

const exportXmlButtonLabel = computed(() =>
  store.simplifiedVersionLoaded ? 'Current' : 'Save XML',
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
      copyOriginalStream: true,
    }),
    store.getAudioPhonemes({
      inputType: 'ACOUSTPARAMS',
      simplified: true,
      copyOriginalStream: true,
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

function playStream() {
  store.playStream()
}

function playOriginalStream() {
  store.playOriginalStream()
}
</script>
