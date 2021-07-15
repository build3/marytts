<template>
  <button
    class="
      button
      has-text-weight-bold
      is-primary is-fullwidth is-flex-mobile-button
    "
    :disabled="disabled"
    @click="onConvertClick"
  >
    <span class="icon is-small">
      <chart-icon />
    </span>
    <span class="button-label"
      >Convert the {{ store.xmlFile ? 'XML' : 'text' }}
    </span>
  </button>

  <transition name="fade">
    <div class="modal is-active" v-if="convertModalShown">
      <div class="modal-background" />
      <div class="modal-content">
        <div class="box p-5">
          <h1 class="title has-text-centered is-4 mb-5">
            Are you sure you want to make another conversion? It will overwrite
            all the changes you've made.
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
              @click="closeConvertModal"
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
import { computed, defineProps, ref } from 'vue'
import { useStore } from '../store/createStore'

import getChartGenerator from '../assets/scripts/phonemesChart'
import ChartIcon from '../icons/Chart.vue'

defineProps({
  disabled: Boolean,
})

const store = useStore()

const chartColor = computed(() => store.chartColor)
const dataset = computed(() => store.dataset)

const generateChart = getChartGenerator()

const convertModalShown = ref(false)

function openConvertModal() {
  convertModalShown.value = true
}

function closeConvertModal() {
  convertModalShown.value = false
}

async function generateAudio() {
  const inputType = store.xmlFile ? 'ACOUSTPARAMS' : 'TEXT'

  await Promise.all([
    store.getAudioStream({ inputType }),
    store.getAudioPhonemes({ inputType }),
  ])

  generateChart({
    color: chartColor.value,
    dataset: dataset.value,
    editable: false,
  })

  closeConvertModal()
}

function onConvertClick() {
  if (dataset.value) {
    openConvertModal()
  } else {
    generateAudio()
  }
}
</script>
