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

    <audio-button :disabled="generateButtonDisabled" />
  </div>
</template>

<script setup>
import { computed, toRef } from 'vue'
import { useStore } from '../store/createStore'

const store = useStore()

const voiceTypes = computed(() => store.voiceTypes)

const selectedVoiceType = toRef(store, 'selectedVoiceType')

const generateButtonDisabled = computed(
  () =>
    !store.selectedVoiceType ||
    (!store.xmlFile && !store.userText) ||
    !store.processStateDirty,
)
</script>
