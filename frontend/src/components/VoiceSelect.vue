<template>
  <div class="field my-4">
    <div class="control">
      <div class="select is-fullwidth is-primary">
        <select @change="setSeletectedVoice" :value="selectedVoiceType">
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
import { computed } from 'vue'
import useStore from '../store'

export default {
  setup() {
    const store = useStore()

    const voiceTypes = computed(() => store.voiceTypes)
    const selectedVoiceType = computed(() => store.selectedVoiceType)

    const setSeletectedVoice = ({ target: { value: newVoiceType } }) => {
      store.setSeletectedVoiceType(newVoiceType)
    }

    return {
      voiceTypes,
      selectedVoiceType,
      setSeletectedVoice,
    }
  },
}
</script>
