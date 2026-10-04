<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { Clock, X } from '@lucide/vue';

const props = defineProps({
  startValue: { type: String, default: '' },
  endValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Seleccione horario' },
  disabled: { type: Boolean, default: false },
  error: { type: Boolean, default: false }
});

const emit = defineEmits(['update:startValue', 'update:endValue']);

const isOpen = ref(false);
const wrapRef = ref(null);

// refs para los 4 inputs, para poder enfocar entre ellos
const startHRef = ref(null);
const startMRef = ref(null);
const endHRef = ref(null);
const endMRef = ref(null);

const parseTime = (val24) => {
  if (!val24) return { h: '', m: '', ampm: 'AM' };
  const [hStr, mStr] = val24.split(':');
  let h = parseInt(hStr, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return {
    h: String(h).padStart(2, '0'),
    m: mStr || '00',
    ampm
  };
};

const start = ref(parseTime(props.startValue));
const end = ref(parseTime(props.endValue));

watch(
  () => props.startValue,
  (newVal) => {
    start.value = parseTime(newVal);
  }
);
watch(
  () => props.endValue,
  (newVal) => {
    end.value = parseTime(newVal);
  }
);

// Convert { h: '12', m: '00', ampm: 'PM' } to "HH:mm" (24h)
const to24h = (timeObj) => {
  if (!timeObj.h || timeObj.m === '') return '';
  let h = parseInt(timeObj.h, 10);
  if (isNaN(h)) return '';
  if (timeObj.ampm === 'PM' && h < 12) h += 12;
  if (timeObj.ampm === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${String(timeObj.m).padStart(2, '0')}`;
};

const updateStart = () => {
  const val24 = to24h(start.value);
  if (val24) emit('update:startValue', val24);
};

const updateEnd = () => {
  const val24 = to24h(end.value);
  if (val24) emit('update:endValue', val24);
};

const formatDisplay = (timeObj) => {
  if (!timeObj.h || timeObj.m === '') return '';
  return `${timeObj.h}:${timeObj.m} ${timeObj.ampm}`;
};

const displayValue = computed(() => {
  const s = formatDisplay(start.value);
  const e = formatDisplay(end.value);
  if (s && e) return `${s} — ${e}`;
  if (s) return `${s} — Sin fin`;
  if (e) return `Sin inicio — ${e}`;
  return '';
});

const clear = (e) => {
  e?.stopPropagation();
  emit('update:startValue', '');
  emit('update:endValue', '');
  start.value = { h: '', m: '', ampm: 'AM' };
  end.value = { h: '', m: '', ampm: 'PM' };
};

const formatHour = (val) => {
  if (!val) return '';
  let num = parseInt(val, 10);
  if (isNaN(num)) return '';
  if (num < 1) num = 1;
  if (num > 12) num = 12;
  return String(num).padStart(2, '0');
};

const formatMinute = (val) => {
  if (val === '' || val === null || val === undefined) return '00';
  let num = parseInt(val, 10);
  if (isNaN(num)) return '00';
  if (num < 0) num = 0;
  if (num > 59) num = 59;
  return String(num).padStart(2, '0');
};

// ── Auto-jump logic ───────────────────────────────────────────────────────────
const handleHourInput = (timeObj, nextRef) => {
  let val = timeObj.h;
  if (!val) return;

  // Si digita del 2 al 9, no puede ser un número de 2 dígitos válido para hora (1-12)
  // Así que lo autocompletamos con 0 a la izquierda y forzamos el salto
  if (val.length === 1 && /^[2-9]$/.test(val)) {
    val = '0' + val;
    timeObj.h = val;
  }

  // Si ya tiene 2 chars con valor numérico válido → saltar a minutos
  if (val.length === 2 && /^\d{2}$/.test(val)) {
    let num = parseInt(val, 10);
    if (num < 1) num = 1;
    if (num > 12) num = 12;
    timeObj.h = String(num).padStart(2, '0');

    // Auto-fill minutos con 00 si está vacío
    if (!timeObj.m) timeObj.m = '00';

    nextTick(() => {
      nextRef?.value?.focus();
      nextRef?.value?.select();
    });
  }
};

const onBlurStartH = (e) => {
  start.value.h = formatHour(e.target.value);
  if (!start.value.m) start.value.m = '00';
  updateStart();
};
const onBlurStartM = (e) => {
  start.value.m = formatMinute(e.target.value);
  updateStart();
};
const onBlurEndH = (e) => {
  end.value.h = formatHour(e.target.value);
  if (!end.value.m) end.value.m = '00';
  updateEnd();
};
const onBlurEndM = (e) => {
  end.value.m = formatMinute(e.target.value);
  updateEnd();
};

const onStartHInput = () => handleHourInput(start.value, startMRef);
const onEndHInput = () => handleHourInput(end.value, endMRef);

// Al presionar Tab en el campo hora, rellena minutos y deja que el tab siga su curso natural
const onStartHTab = () => {
  if (!start.value.m) start.value.m = '00';
  updateStart();
};
const onEndHTab = () => {
  if (!end.value.m) end.value.m = '00';
  updateEnd();
};

const toggle = () => {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
  if (isOpen.value) nextTick(() => startHRef.value?.focus());
};

const onOutside = (e) => {
  if (wrapRef.value && !wrapRef.value.contains(e.target)) isOpen.value = false;
};

onMounted(() => document.addEventListener('mousedown', onOutside));
onBeforeUnmount(() => document.removeEventListener('mousedown', onOutside));
</script>

<template>
  <div ref="wrapRef" class="relative w-full">
    <div
      class="input-field flex cursor-pointer items-center justify-between gap-2 !py-0"
      :class="[
        error ? 'input-field--error' : '',
        disabled ? 'cursor-not-allowed opacity-60' : '',
        isOpen ? '!border-brand-500 !ring-2 !ring-brand-500/20' : ''
      ]"
      style="height: 2.5rem"
      role="combobox"
      tabindex="0"
      :aria-expanded="isOpen"
      :aria-disabled="disabled"
      @click="toggle"
      @keydown.enter.prevent="toggle"
      @keydown.space.prevent="toggle"
      @keydown.escape="isOpen = false"
    >
      <span
        class="flex-1 truncate text-sm"
        :class="displayValue ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'"
      >
        {{ displayValue || placeholder }}
      </span>
      <span class="flex shrink-0 items-center gap-1">
        <button
          v-if="displayValue && !disabled"
          type="button"
          class="rounded p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          @click.stop="clear"
        >
          <X class="h-3.5 w-3.5" />
        </button>
        <Clock class="h-4 w-4 text-slate-400 dark:text-slate-500" />
      </span>
    </div>

    <!-- Popover -->
    <Transition
      enter-active-class="transition-all duration-150 ease-out"
      enter-from-class="opacity-0 scale-95 -translate-y-1"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-100 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 -translate-y-1"
    >
      <div
        v-if="isOpen"
        class="absolute left-0 top-full z-50 mt-1.5 w-60 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700/60 dark:bg-slate-900"
      >
        <div class="space-y-3">
          <!-- Hora Entrada -->
          <div>
            <p class="mb-1 text-xs font-semibold text-slate-600 dark:text-slate-400">Hora de entrada</p>
            <div
              class="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700/50 dark:bg-slate-800/50"
            >
              <input
                ref="startHRef"
                v-model="start.h"
                type="text"
                maxlength="2"
                placeholder="HH"
                class="w-10 flex-1 appearance-none rounded border-0 bg-transparent py-1 text-center text-sm font-semibold text-slate-900 outline-none hover:bg-slate-200/50 focus:bg-white focus:ring-1 focus:ring-brand-500/50 dark:text-white dark:hover:bg-slate-700/50 dark:focus:bg-slate-700"
                @focus="$event.target.select()"
                @input="onStartHInput"
                @blur="onBlurStartH"
                @keydown.tab="onStartHTab"
                @keydown.enter.prevent="
                  onBlurStartH;
                  startMRef?.focus();
                "
              />
              <span class="font-bold text-slate-300 dark:text-slate-600">:</span>
              <input
                ref="startMRef"
                v-model="start.m"
                type="text"
                maxlength="2"
                placeholder="MM"
                class="w-10 flex-1 appearance-none rounded border-0 bg-transparent py-1 text-center text-sm font-semibold text-slate-900 outline-none hover:bg-slate-200/50 focus:bg-white focus:ring-1 focus:ring-brand-500/50 dark:text-white dark:hover:bg-slate-700/50 dark:focus:bg-slate-700"
                @focus="$event.target.select()"
                @blur="onBlurStartM"
                @keydown.enter.prevent="
                  onBlurStartM;
                  endHRef?.focus();
                "
              />
              <div class="flex items-center rounded bg-slate-200/50 p-0.5 dark:bg-slate-900/50">
                <button
                  type="button"
                  class="rounded px-1.5 py-0.5 text-[10px] font-bold transition-colors"
                  :class="
                    start.ampm === 'AM'
                      ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  "
                  @click="
                    start.ampm = 'AM';
                    updateStart();
                  "
                >
                  AM
                </button>
                <button
                  type="button"
                  class="rounded px-1.5 py-0.5 text-[10px] font-bold transition-colors"
                  :class="
                    start.ampm === 'PM'
                      ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  "
                  @click="
                    start.ampm = 'PM';
                    updateStart();
                  "
                >
                  PM
                </button>
              </div>
            </div>
          </div>

          <!-- Hora Salida -->
          <div>
            <p class="mb-1 text-xs font-semibold text-slate-600 dark:text-slate-400">Hora de salida</p>
            <div
              class="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700/50 dark:bg-slate-800/50"
            >
              <input
                ref="endHRef"
                v-model="end.h"
                type="text"
                maxlength="2"
                placeholder="HH"
                class="w-10 flex-1 appearance-none rounded border-0 bg-transparent py-1 text-center text-sm font-semibold text-slate-900 outline-none hover:bg-slate-200/50 focus:bg-white focus:ring-1 focus:ring-brand-500/50 dark:text-white dark:hover:bg-slate-700/50 dark:focus:bg-slate-700"
                @focus="$event.target.select()"
                @input="onEndHInput"
                @blur="onBlurEndH"
                @keydown.tab="onEndHTab"
                @keydown.enter.prevent="
                  onBlurEndH;
                  endMRef?.focus();
                "
              />
              <span class="font-bold text-slate-300 dark:text-slate-600">:</span>
              <input
                ref="endMRef"
                v-model="end.m"
                type="text"
                maxlength="2"
                placeholder="MM"
                class="w-10 flex-1 appearance-none rounded border-0 bg-transparent py-1 text-center text-sm font-semibold text-slate-900 outline-none hover:bg-slate-200/50 focus:bg-white focus:ring-1 focus:ring-brand-500/50 dark:text-white dark:hover:bg-slate-700/50 dark:focus:bg-slate-700"
                @focus="$event.target.select()"
                @blur="onBlurEndM"
                @keydown.enter.prevent="
                  onBlurEndM;
                  isOpen = false;
                "
              />
              <div class="flex items-center rounded bg-slate-200/50 p-0.5 dark:bg-slate-900/50">
                <button
                  type="button"
                  class="rounded px-1.5 py-0.5 text-[10px] font-bold transition-colors"
                  :class="
                    end.ampm === 'AM'
                      ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  "
                  @click="
                    end.ampm = 'AM';
                    updateEnd();
                  "
                >
                  AM
                </button>
                <button
                  type="button"
                  class="rounded px-1.5 py-0.5 text-[10px] font-bold transition-colors"
                  :class="
                    end.ampm === 'PM'
                      ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  "
                  @click="
                    end.ampm = 'PM';
                    updateEnd();
                  "
                >
                  PM
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
