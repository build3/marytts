<template>
  <button
    class="button has-text-weight-bold is-primary is-fullwidth"
    :disabled="disabled"
    @click="generateAudio"
  >
    Generate audio
  </button>
</template>

<script>
import { computed } from 'vue'
import { useStore } from '../store/createStore'

import getChartGenerator from '../assets/scripts/phonemesChart'

export default {
  props: {
    isXml: {
      required: false,
      type: Boolean,
      default: false,
    },
    disabled: Boolean,
  },

  setup(props) {
    const store = useStore()

    const chartColor = computed(() => store.chartColor)
    const dataset = computed(() => store.dataset)

    const generateChart = getChartGenerator()

    async function generateAudio() {
      const inputType = props.isXml ? 'ACOUSTPARAMS' : 'TEXT'

      await Promise.all([
        store.getAudioStream({ inputType }),
        store.getAudioPhonemes({ inputType }),
      ])

      generateChart({
        color: chartColor.value,
        dataset: dataset.value,
        editable: false,
      })
    }

    return {
      generateAudio,
    }
  },
}
</script>
