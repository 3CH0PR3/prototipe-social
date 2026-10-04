<script setup>
const props = defineProps({
  icon: { type: String, required: true },
  size: { type: Number, default: 16 },
  color: { type: String, default: 'currentColor' },
  active: { type: Boolean, default: false },
  href: { type: String },
  family: {
    type: String,
    default: 'fa-solid',
    validator: (value) => ['fa-solid', 'fa-regular', 'fa-brands', 'fa-light', 'fa-thin'].includes(value)
  },
  boxStyle: String,
  extraClass: { type: String, default: '' }
});
</script>

<template>
  <div :style="props.boxStyle">
    <i
      :class="['icon-base text-headin h-100', family, props.extraClass, `fa-${props.icon}`]"
      :style="{
        fontSize: `${props.size}px`,
        color: `${props.color} !important`
      }"
    ></i>
  </div>
</template>
