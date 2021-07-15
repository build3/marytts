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
      <div class="notification is-danger" v-if="hasAnyError">
        <button class="delete" @click="clearErrors"></button>
        <div v-for="errorMessage in errorMessages" :key="errorMessage">
          {{ errorMessage }}
        </div>
      </div>

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
import { computed, onMounted } from 'vue'

import PhonemeSelector from './components/PhonemeSelector.vue'
import { useStore } from './store/createStore'

const store = useStore()

const stream = computed(() => store.stream)

const errors = computed(() => store.error)
const errorMessages = computed(() => Object.values(errors.value))
const hasAnyError = computed(() => errors.value.length > 0)

const clearErrors = () => {
  store.clearErrors()
}

onMounted(() => {
  store.fetchVoices()
  store.initializeAllophoneDictionaries()
})
</script>
