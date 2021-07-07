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
import useStore from '../store'

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
      if (props.isXml) {
        // TODO
      } else {
        await Promise.all([store.getAudioStream(), store.getAudioPhonemes()])
      }

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
