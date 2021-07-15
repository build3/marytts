<template>
  <div
    v-if="isPhonemeSelectorOpen"
    ref="containerRef"
    class="mx-3 p-2 phoneme-selector-dropdown"
  >
    <div class="mb-1 phoneme-selector-input-row">
      <h2 class="subtitle mb-0 phoneme-selector-dropdown-header">
        Swap phoneme
      </h2>
      <div class="phoneme-selector-input-container">
        <input
          autofocus
          ref="inputRef"
          class="phoneme-selector-input"
          type="text"
          v-model="searchTerm"
          placeholder="Search"
        />
        <div class="phoneme-selector-icon-container">
          <search-icon />
        </div>
      </div>
    </div>
    <div class="mb-1 phoneme-row-container">
      <span class="phoneme-selector-label">Vowels:</span>
      <div class="phoneme-buttons-container">
        <button
          v-for="vowel in foundVowels"
          :key="vowel"
          class="phoneme-button"
          @click="() => selectNewPhoneme(vowel)"
          :class="{ current: isPhonemeCurrentlySelected(vowel) }"
        >
          {{ vowel }}
        </button>
      </div>
    </div>
    <div class="mb-1 phoneme-row-container">
      <span class="phoneme-selector-label">Consonants:</span>
      <div class="phoneme-buttons-container">
        <button
          v-for="consonant in foundConsonants"
          :key="consonant"
          class="phoneme-button"
          @click="() => selectNewPhoneme(consonant)"
          :class="{ current: isPhonemeCurrentlySelected(consonant) }"
        >
          {{ consonant }}
        </button>
      </div>
    </div>
    <div
      class="phoneme-selector-dropdown-fill"
      :style="dropdownFillStyle"
    ></div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useStore } from '../store/createStore'

import SearchIcon from '../icons/Search.vue'

const store = useStore()
const inputRef = ref(null)
const containerRef = ref(null)

const searchTerm = ref('')

const phonemeDictionaryVowels = computed(
  () => store.phonemeDictionary?.vowels ?? [],
)
const phonemeDictionaryConsonants = computed(
  () => store.phonemeDictionary?.consonants ?? [],
)

const phonemeSelectorCurrentPhonemeName = computed(
  () => store.phonemeSelector.currentPhonemeName,
)

const foundVowels = computed(() =>
  phonemeDictionaryVowels.value.filter(vowel =>
    vowel.toLowerCase().includes(searchTerm.value.toLowerCase()),
  ),
)

const foundConsonants = computed(() =>
  phonemeDictionaryConsonants.value.filter(consonant =>
    consonant.toLowerCase().includes(searchTerm.value.toLowerCase()),
  ),
)

function isPhonemeCurrentlySelected(phoneme) {
  return phoneme === phonemeSelectorCurrentPhonemeName.value
}

const isPhonemeSelectorOpen = computed(() => store.phonemeSelector.isOpen)

// values based on 0.75rem margin-left of phoneme-selector-dropdown
// and 0.25rem margin of phoneme-selectors
const dropdownFillStyle = computed(() => ({
  left: `${(store.phonemeSelector.selectorX ?? 0) - 12}px`,
  width: `${(store.phonemeSelector.selectorWidth ?? 0) - 4}px`,
}))

function closePhonemeSelector(event) {
  if (
    event.target !== containerRef.value &&
    !event.composedPath().includes(containerRef.value)
  ) {
    store.closePhonemeSelector()
  }
}

function selectNewPhoneme(newPhoneme) {
  store.selectNewPhoneme({ newPhoneme })
}

watch(isPhonemeSelectorOpen, (isOpen, previousIsOpen) => {
  if (isOpen && !previousIsOpen) {
    window.addEventListener('pointerdown', closePhonemeSelector, {
      passive: true,
    })
    searchTerm.value = ''
    requestAnimationFrame(() => {
      inputRef.value?.focus()
    })
  } else if (!isOpen && previousIsOpen) {
    window.removeEventListener('pointerdown', closePhonemeSelector)
  }
})
</script>
