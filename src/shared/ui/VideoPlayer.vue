<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';

const props = defineProps({
  videoSource: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['ready']);

const el = ref(null);
let player = null;

onMounted(() => {
  player = new Plyr(el.value);
  player.on('ready', () => emit('ready'));
});

onBeforeUnmount(() => {
  player?.destroy();
});
</script>

<template>
  <video ref="el" class="clip w-100" style="transform: scale(1.01)">
    <source :src="props.videoSource" type="video/mp4" />
  </video>
</template>

<style lang="scss">
.plyr__control {
  color: #fff !important;
  background-color: rgba(var(--bs-primary-rgb), 0.8) !important;

  &:hover {
    background-color: var(--bs-primary) !important;
  }
}

.plyr--full-ui input[type='range'] {
  color: var(--bs-primary);
}

.plyr--video {
  height: 100%;
}

.plyr--full-ui.plyr--video .plyr__control--overlaid {
  animation: playPulse 1.6s infinite;
}

@keyframes playPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--bs-primary-rgb), 0.35);
  }
  70% {
    box-shadow: 0 0 0 14px rgba(var(--bs-primary-rgb), 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(var(--bs-primary-rgb), 0);
  }
}
</style>
