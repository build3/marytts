<template>
  <div class="tabs is-boxed is-centered is-fullwidth">
    <ul>
      <li
        :class="{ 'is-active': isTabActive(textTab) }"
        @click="() => setCurrentActiveTab(textTab)"
      >
        <a>
          <span>From text</span>
        </a>
      </li>
      <li
        :class="{ 'is-active': isTabActive(xmlTab) }"
        @click="() => setCurrentActiveTab(xmlTab)"
      >
        <a>
          <span>From XML</span>
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
import { inject } from 'vue'

import { textTab, xmlTab } from '../store/index'

export default {
  setup() {
    const currentActiveTab = inject('currentActiveTab')
    const setCurrentActiveTab = inject('setCurrentActiveTab')

    const isTabActive = tab => currentActiveTab.value === tab

    return {
      textTab,
      xmlTab,
      isTabActive,
      currentActiveTab,
      setCurrentActiveTab,
    }
  },
}
</script>
