<template>
  <div class="proportional-editing" v-if="simplifiedVersionLoaded">
    <div class="controls-section-label pt-2">Proportional editing</div>
    <div class="pt-2 pb-4 proportional-editing-controls">
      <div class="range-input-container">
        <div class="range-input-progress-bar">
          <div
            class="range-input-progress-bar-active"
            :style="{ '--current-progress': currentRangePercentage }"
          ></div>
        </div>
        <div class="range-input-slider-thumb" ref="thumbRef" />
        <div
          v-for="index in maxProportionalEditRange"
          :key="index"
          class="range-input-slider-dot-container"
          @mousedown="() => setProportionalEditRange(index)"
        >
          <div class="range-input-slider-dot">
            <div class="range-input-slider-label">{{ index - 1 }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { drag, selectAll } from 'd3'
import { computed, ref, toRef, watch } from 'vue'

import { useStore } from '../store/createStore'

const store = useStore()

const thumbRef = ref(null)

const simplifiedVersionLoaded = computed(() => store.simplifiedVersionLoaded)

const proportionalEditRange = toRef(store, 'proportionalEditRange')

const minProportionalEditRange = 1
const maxProportionalEditRange = 11
const currentRangePercentage = computed(
  () =>
    proportionalEditRange.value /
    (maxProportionalEditRange - minProportionalEditRange),
)

const maxProgressBarWidth = computed(() => {
  if (thumbRef.value && thumbRef.value.parentElement) {
    const elementStyle = getComputedStyle(thumbRef.value)
    const parentStyle = getComputedStyle(thumbRef.value.parentElement)

    const elementWidth = parseInt(elementStyle.width, 10)
    const parentWidth = parseInt(parentStyle.width, 10)

    return parentWidth - elementWidth
  }

  return null
})

function setProportionalEditRange(roundedValue) {
  const maxWidth = maxProgressBarWidth.value

  if (maxWidth === null) {
    return
  }

  const roundedValueX =
    (maxWidth * (roundedValue - minProportionalEditRange)) /
    (maxProportionalEditRange - minProportionalEditRange)

  thumbRef.value.style.left = `${roundedValueX}px`
  proportionalEditRange.value = roundedValue - 1
}

function onDragEvent(event) {
  const maxWidth = maxProgressBarWidth.value

  if (maxWidth === null) {
    return
  }

  const progress = Math.min(maxWidth, Math.max(0, event.x))

  const roundedValue = Math.round(
    minProportionalEditRange +
      (progress * (maxProportionalEditRange - minProportionalEditRange)) /
        maxWidth,
  )

  setProportionalEditRange(roundedValue)
}

watch(
  [simplifiedVersionLoaded, thumbRef],
  ([simplifiedVersionLoadedValue, thumbRefValue]) => {
    if (!thumbRefValue) {
      return
    }

    if (simplifiedVersionLoadedValue) {
      selectAll('.range-input-slider-thumb').call(
        drag()
          .on('start', onDragEvent)
          .on('drag', onDragEvent)
          .on('end', onDragEvent),
      )
    } else {
      selectAll('.range-input-slider-thumb').call(
        drag().on('.start', null).on('.drag', null).on('.end', null),
      )
    }
  },
  {
    immediate: true,
  },
)
</script>
