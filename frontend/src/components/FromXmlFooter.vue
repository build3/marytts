<template>
  <footer
    class="button-row px-5 pb-5"
    :class="{ 'is-invisible': isStreamEmpty }"
  >
    <button
      class="button is-primary is-fullwidth has-text-weight-bold"
      @click="playStream"
    >
      Play audio
    </button>

    <a :href="xmlDownloadUrl" download="MaryTTS.xml">
      <button
        class="button has-text-weight-bold is-primary is-fullwidth"
        :disabled="generateButtonDisabled"
        @click="generateXml"
      >
        Export XML
      </button>
    </a>
  </footer>
</template>

<script setup>
import { computed, defineProps } from 'vue'
import { useStore } from '../store/createStore'

defineProps({
  isStreamEmpty: Boolean,
})

const store = useStore()

const selectedVoiceType = computed(() => store.selectedVoiceType)
const generateButtonDisabled = computed(() => !selectedVoiceType.value)

const xmlDownloadUrl = computed(() => store.xmlDownloadUrl)

const playStream = () => {
  // store.dispatch('playStream')
}
</script>
