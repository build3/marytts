<template>
  <section
    class="
      px-4
      pt-4
      is-flex is-flex-direction-column is-align-items-center
      has-background-primary
    "
  >
    <div class="form-container">
      <h1 class="title is-4 has-text-white has-text-centered mb-4">
        MARY Text To Speech
      </h1>
      <transition name="error">
        <div
          class="error-notification is-danger"
          :key="firstErrorMessage"
          v-if="firstErrorMessage"
        >
          {{ firstErrorMessage }}
        </div>
      </transition>

      <input-row />

      <audio :src="stream" autoplay="true" controls="" type="audio/wave" />
    </div>
  </section>

  <section class="is-flex is-flex-direction-column is-align-items-center px-4">
    <div class="form-container">
      <controls />
    </div>
  </section>

  <div class="main-chart-container">
    <div class="chart-size-container">
      <div class="chart-size" id="main-chart-container" />
    </div>
    <div class="phoneme-selector-container">
      <phoneme-selector />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'

import PhonemeSelector from './components/PhonemeSelector.vue'
import { useStore } from './store/createStore'

const store = useStore()

const stream = computed(() => store.stream)

const errorValues = computed(() => Object.values(store.error).filter(Boolean))
const firstErrorMessage = computed(() => errorValues.value[0])

const errorClearTimeout = ref(null)

watch(
  firstErrorMessage,
  errorMessageValue => {
    if (errorMessageValue) {
      if (errorClearTimeout.value) {
        clearTimeout(errorClearTimeout.value)
      }

      errorClearTimeout.value = setTimeout(() => {
        store.clearErrors()
      }, 3000)
    }
  },
  {
    immediate: true,
  },
)

onMounted(() => {
  store.fetchVoices()
  store.initializeAllophoneDictionaries()
})
</script>
