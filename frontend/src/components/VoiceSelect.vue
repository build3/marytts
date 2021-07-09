<template>
  <div class="field my-4">
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
</template>

<script>
import { computed, toRef } from 'vue'
import { useStore } from '../store/createStore'

export default {
  setup() {
    const store = useStore()

    const voiceTypes = computed(() => store.voiceTypes)

    const selectedVoiceType = toRef(store, 'selectedVoiceType')

    return {
      voiceTypes,
      store,
      selectedVoiceType,
    }
  },
}
</script>
