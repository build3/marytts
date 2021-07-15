<template>
  <div class="from-text-container">
    <div v-if="!fileSelected" class="field">
      <div class="control">
        <input
          class="input is-primary"
          type="text"
          placeholder="Insert your text here"
          v-model="store.userText"
        />
      </div>
    </div>

    <div
      class="file is-primary is-centered is-fullwidth"
      :class="{ 'is-spread': fileSelected }"
    >
      <label class="file-label">
        <input
          :key="xmlFileName"
          class="file-input"
          type="file"
          @change="swapFile"
        />

        <span class="file-cta is-fullwidth is-flex-mobile-button">
          <span class="icon" @click="clearFile">
            <component :is="fileSelected ? CloseIcon : XmlIcon" />
          </span>
          <span class="file-label has-text-weight-bold button-label">
            {{ fileLabel }}
          </span>
        </span>
      </label>
    </div>
  </div>

  <voice-select />
</template>

<script setup>
import { computed } from 'vue'

import CloseIcon from '../icons/Close.vue'
import XmlIcon from '../icons/Xml.vue'
import { useStore } from '../store/createStore'

const store = useStore()

function swapFile({
  target: {
    files: [firstFile],
  },
}) {
  if (firstFile) {
    store.xmlFile = firstFile
  }
}

function clearFile(event) {
  if (store.xmlFile) {
    event.preventDefault()
    store.xmlFile = null
  }
}

const fileSelected = computed(() => Boolean(store.xmlFile))
const xmlFileName = computed(() => store.xmlFile?.name)
const fileLabel = computed(() =>
  store.xmlFile ? xmlFileName.value : 'or upload XML file',
)
</script>
