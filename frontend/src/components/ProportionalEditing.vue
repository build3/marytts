<template>
  <div class="proportional-editing py-2" v-if="simplifiedVersionLoaded">
    <div class="controls-section-label">Proportional editing</div>
    <div class="py-2 proportional-editing-controls">
      <input
        type="checkbox"
        name="proportionalEditEnabled"
        v-model="proportionalEditEnabled"
      />
      <div class="range-input-container">
        <div class="range-input-mark start">1 point</div>
        <div class="range-input-mark end">10 points</div>
        <div
          class="range-input-slider-thumb"
          ref="thumbRef"
          :disabled="!proportionalEditEnabled"
        >
          <div
            v-if="proportionalEditEnabled"
            class="range-input-current-range-mark"
          >
            {{ proportionalEditRange }}
          </div>
        </div>
        <progress
          class="progress is-primary"
          :disabled="!proportionalEditEnabled"
          :min="minProportionalEditRange"
          :max="maxProportionalEditRange"
          :value="currentRangePercentage"
        ></progress>
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

const proportionalEditEnabled = toRef(store, 'proportionalEditEnabled')
const proportionalEditRange = toRef(store, 'proportionalEditRange')

const minProportionalEditRange = 1
const maxProportionalEditRange = 10
const currentRangePercentage = computed(
  () =>
    (maxProportionalEditRange * (proportionalEditRange.value - 1)) /
    (maxProportionalEditRange - minProportionalEditRange),
)

function onDragEvent(event) {
  const elementStyle = getComputedStyle(this)
  const parentStyle = getComputedStyle(this.parentElement)

  const elementWidth = parseInt(elementStyle.width, 10)
  const parentWidth = parseInt(parentStyle.width, 10)

  const maxWidth = parentWidth - elementWidth
  const progress = Math.min(maxWidth, Math.max(0, event.x))

  const roundedValue = Math.round(
    minProportionalEditRange +
      (progress * (maxProportionalEditRange - minProportionalEditRange)) /
        maxWidth,
  )

  const roundedValueX =
    (maxWidth * (roundedValue - minProportionalEditRange)) /
    (maxProportionalEditRange - minProportionalEditRange)

  this.style.left = `${roundedValueX}px`
  proportionalEditRange.value = roundedValue
}

watch(
  [simplifiedVersionLoaded, thumbRef, proportionalEditEnabled],
  ([
    simplifiedVersionLoadedValue,
    thumbRefValue,
    proportionalEditEnabledValue,
  ]) => {
    if (!thumbRefValue) {
      return
    }

    if (simplifiedVersionLoadedValue && proportionalEditEnabledValue) {
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
