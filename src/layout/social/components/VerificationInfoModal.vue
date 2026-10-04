<script setup>
import { BadgeCheck, Info } from '@lucide/vue';
import SocialModal from '@layouts/social/components/SocialModal.vue';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  type: { type: String, default: 'company' } // 'gea_wrc', 'company', 'member'
});

const emit = defineEmits(['close']);
</script>

<template>
  <SocialModal
    :title="type === 'gea_wrc' ? 'Verificación Oficial' : 'Cuenta Verificada'"
    :isOpen="isOpen"
    size="modal-sm"
    centered
    @close="emit('close')"
  >
    <div class="flex flex-col items-center text-center p-4">
      <div 
        class="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        :class="type === 'gea_wrc' ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-blue-500'"
      >
        <BadgeCheck :size="32" />
      </div>
      
      <h3 class="text-lg font-bold text-gray-900 mb-2">
        {{ type === 'gea_wrc' ? 'Sistema Oficial GEA-WRC' : 'Empresa Verificada' }}
      </h3>
      
      <p class="text-sm text-gray-500 leading-relaxed mb-6">
        <template v-if="type === 'gea_wrc'">
          Esta insignia confirma que esta cuenta pertenece oficialmente al sistema central de <strong>GEA-WRC</strong>. Es única y garantiza la autenticidad de los comunicados de la plataforma.
        </template>
        <template v-else-if="type === 'company'">
          Esta insignia confirma que <strong>GEA-WRC</strong> ha verificado que esta cuenta representa a una empresa real y legítima registrada en la plataforma.
        </template>
        <template v-else-if="type === 'member'">
          Esta insignia indica que este usuario es un miembro verificado que pertenece a una empresa legítima registrada en <strong>GEA-WRC</strong>.
        </template>
      </p>

      <div class="w-full bg-gray-50 rounded-lg p-3 flex items-start gap-3 text-left">
        <Info :size="16" class="text-gray-400 shrink-0 mt-0.5" />
        <span class="text-xs text-gray-500">
          Las verificaciones son emitidas exclusivamente por la administración central para garantizar un entorno seguro y confiable.
        </span>
      </div>
    </div>
  </SocialModal>
</template>
