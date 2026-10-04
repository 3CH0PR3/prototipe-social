<template>
  <div class="space-y-4">
    <div v-for="i in 3" :key="i" class="soc-card p-4 animate-pulse">
      <!-- Header -->
      <div class="flex items-center gap-3 mb-3">
        <div class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        <div class="flex-1">
          <div class="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div class="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>

      <!-- Content -->
      <div class="space-y-2 mb-3">
        <div class="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div class="h-3 w-4/5 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>

      <!-- Image -->
      <div class="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3"></div>

      <!-- Actions -->
      <div class="flex gap-4">
        <div class="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div class="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div class="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  </div>
</template>
