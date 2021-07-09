<template>
  <nav class="navbar" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <h1 class="navbar-item">Mary Text to Speech</h1>
    </div>
  </nav>
  <section class="is-flex is-flex-direction-column is-align-items-stretch px-5">
    <div class="notification is-danger" v-if="hasAnyError">
      <button class="delete"></button>
      {{ firstError }}
    </div>
    <mary-tabs />

    <component :is="currentActiveTabComponent" />

    <audio
      class="pt-4"
      :class="{ 'is-invisible': isStreamEmpty }"
      :src="stream"
      autoplay="true"
      controls=""
      type="audio/wave"
    />

    <div class="chart-size-container">
      <div class="chart-size" id="main-chart-container" />
    </div>
  </section>
  <component :is="currentActiveTabFooter" :is-stream-empty="isStreamEmpty" />
</template>

<script>
import { computed, onMounted, provide, ref } from 'vue'
import { textTab } from './store'
import { useStore } from './store/createStore'

export default {
  setup() {
    const store = useStore()

    const simplifiedVersionLoaded = ref(false)
    const setSimplifiedVersionLoaded = newSimplifiedVersionLoaded => {
      simplifiedVersionLoaded.value = newSimplifiedVersionLoaded
    }

    provide('simplifiedVersionLoaded', simplifiedVersionLoaded)
    provide('setSimplifiedVersionLoaded', setSimplifiedVersionLoaded)

    const currentActiveTab = ref(textTab)
    const setCurrentActiveTab = newTab => {
      currentActiveTab.value = newTab
    }

    provide('currentActiveTab', currentActiveTab)
    provide('setCurrentActiveTab', setCurrentActiveTab)

    const stream = computed(() => store.stream)
    const isStreamEmpty = computed(() => !stream.value)

    const currentActiveTabComponent = computed(() =>
      currentActiveTab.value === textTab ? 'from-text' : 'from-xml',
    )
    const currentActiveTabFooter = computed(() =>
      currentActiveTab.value === textTab
        ? 'from-text-footer'
        : 'from-xml-footer',
    )

    const errors = computed(() => store.error)
    const firstError = computed(() => Object.values(errors.value)[0])
    const hasAnyError = computed(() => Boolean(firstError.value))

    onMounted(() => {
      store.fetchVoices()
    })

    return {
      stream,
      isStreamEmpty,
      currentActiveTabComponent,
      currentActiveTabFooter,
      firstError,
      hasAnyError,
    }
  },
}
</script>
