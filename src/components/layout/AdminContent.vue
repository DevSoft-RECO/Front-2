<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  }
});
</script>

<template>
  <div class="py-8">
    <div v-if="title" class="w-full px-4 sm:px-6 lg:px-8 mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ title }}
      </h1>
      <p v-if="subtitle" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ subtitle }}
      </p>
    </div>

    <div class="w-full px-4 sm:px-6 lg:px-8">
      <slot />
    </div>
  </div>
</template>