<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    <div v-for="i in 8" :key="i" class="soc-card p-4 animate-pulse">
      <div class="w-full aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-3"></div>
      <div class="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2"></div>
      <div class="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
    </div>
  </div>
</template>
