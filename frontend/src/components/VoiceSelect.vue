<template>
  <div class="voice-select-container my-4">
    <div class="field">
      <div class="control">
        <div class="select is-fullwidth is-primary">
          <select v-model="selectedVoiceType">
            <option :value="null" disabled>Select voice</option>
            <option
              :value="type"
              v-for="{ locale, sex, type } in voiceTypes"
              :key="type"
            >
              {{ locale }} - {{ sex }} - {{ type }}
            </option>
          </select>
        </div>
      </div>
    </div>
    <button
      class="button is-primary is-light has-text-weight-bold"
      :disabled="!stream"
      @click="playStream"
    >
      Play audio
    </button>
  </div>
</template>

<script setup>
import { computed, toRef } from 'vue'
import { useStore } from '../store/createStore'

const store = useStore()

const stream = computed(() => store.stream)
const voiceTypes = computed(() => store.voiceTypes)

const selectedVoiceType = toRef(store, 'selectedVoiceType')

const playStream = () => {
  store.playStream()
}
</script>
