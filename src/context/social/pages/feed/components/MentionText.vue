<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  text: { type: String, default: '' },
  mentions: { type: Array, default: () => [] }
});

const router = useRouter();

// Convierte "Hola @Juan Pérez cómo estás" en partes renderizables
// Parte normal: { type: 'text', content: 'Hola ' }
// :      { type: 'mention', name: 'Juan Pérez', id: '...' }
const parts = computed(() => {
  if (!props.text) return [];

  // Mapa de nombre → id para linkear al perfil
  const mentionMap = {};
  props.mentions.forEach((m) => {
    if (m?.name) mentionMap[m.name] = m.id;
  });

  // Buscar todos los @nombre en el texto
  // @nombre puede tener espacios si es nombre compuesto (ej: @Juan Pérez)
  // Estrategia: buscar @palabra hasta fin o hasta siguiente @
  const result = [];
  let remaining = props.text;

  // Regex que captura @NombreApellido (una o dos palabras, con caracteres especiales)
  const mentionRegex = /@([\w'\u00C0-\u024F]+(?: [\w'\u00C0-\u024F]+)?)/g;

  let lastIndex = 0;
  let match;

  mentionRegex.lastIndex = 0;
  while ((match = mentionRegex.exec(props.text)) !== null) {
    // Texto antes de la
    if (match.index > lastIndex) {
      result.push({
        type: 'text',
        content: props.text.slice(lastIndex, match.index)
      });
    }

    const name = match[1];
    const id = mentionMap[name] || null;

    result.push({ type: 'mention', name, id });
    lastIndex = match.index + match[0].length;
  }

  // Texto restante después de la última
  if (lastIndex < props.text.length) {
    result.push({ type: 'text', content: props.text.slice(lastIndex) });
  }

  return result.length ? result : [{ type: 'text', content: props.text }];
});

const goToProfile = (id) => {
  if (id) router.push({ name: 'social.profiles', params: { id } });
};
</script>

<template>
  <span class="inline leading-3">
    <template v-for="(part, i) in parts" :key="i">
      <!--  clickeable en verde -->
      <button
        v-if="part.type === 'mention'"
        type="button"
        class="font-semibold border-0 p-0 bg-transparent cursor-pointer text-green-600 hover:text-green-700"
        :class="{ 'cursor-default': !part.id }"
        @click.stop="goToProfile(part.id)"
      >
        @{{ part.name }}
      </button>

      <!-- Texto normal -->
      <span v-else class="soc-text-body">{{ part.content }}</span>
    </template>
  </span>
</template>
