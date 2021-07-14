<template>
  <section
    class="
      has-background-primary
      px-4
      py-4
      is-flex is-flex-direction-column is-align-items-center
    "
  >
    <div class="form-container">
      <h1 class="title is-4 has-text-white has-text-centered">
        Mary Text To Speech
      </h1>
      <div class="notification is-danger" v-if="hasAnyError">
        <button class="delete" @click="clearErrors"></button>
        <div v-for="errorMessage in errorMessages" :key="errorMessage">
          {{ errorMessage }}
        </div>
      </div>

      <from-text />

      <audio :src="stream" autoplay="true" controls="" type="audio/wave" />
    </div>
  </section>
  <div class="main-chart-container">
    <div class="chart-size-container">
      <div class="chart-size" id="main-chart-container" />
    </div>
    <div class="phoneme-selector-container">&nbsp;</div>
  </div>
</template>

<script setup>
import { computed, onMounted, provide, ref } from 'vue'
import { textTab } from './store'
import { useStore } from './store/createStore'

const store = useStore()

const currentActiveTab = ref(textTab)
const setCurrentActiveTab = newTab => {
  currentActiveTab.value = newTab
}

provide('currentActiveTab', currentActiveTab)
provide('setCurrentActiveTab', setCurrentActiveTab)

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
