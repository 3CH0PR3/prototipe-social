<script setup>
import InputLabel from './InputLabel.vue';
import InputError from './InputError.vue';

defineProps({
  label: { type: String, default: '' },
  forId: { type: String, default: '' },
  error: { type: String, default: '' },
  required: { type: Boolean, default: false },
  hint: { type: String, default: '' }
});
</script>

<template>
  <div class="space-y-0">
    <InputLabel v-if="label || $slots.label" :value="label" :for-id="forId" :required="required" :hint="hint">
      <slot name="label" />
    </InputLabel>
    <slot />
    <InputError :message="error" />
  </div>
</template>
