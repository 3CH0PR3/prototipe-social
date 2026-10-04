<template>
  <div class="soc-card soc-p-6">
    <div
      class="soc-h-5 soc-w-24 soc-bg-gray-200 dark:soc-bg-gray-700 soc-rounded soc-mb-6 soc-animate-pulse"
    ></div>

    <div class="soc-grid soc-grid-cols-2 sm:soc-grid-cols-3 lg:soc-grid-cols-4 soc-gap-3">
      <div
        v-for="i in 8"
        :key="i"
        class="soc-aspect-square soc-bg-gray-200 dark:soc-bg-gray-700 soc-rounded-lg soc-animate-pulse"
      ></div>
    </div>
  </div>
</template>
