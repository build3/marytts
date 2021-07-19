<template>
  <a :href="href" :download="fileName" v-if="href">
    <slot :disabled="false" />
  </a>
  <slot :disabled="true" v-else />
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
  href: {
    type: String,
    required: false,
    default: '',
  },
  fileName: {
    type: String,
    required: true,
  },
})
</script>
