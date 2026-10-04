import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const TOUR_STEPS = [
  {
    target: '#dashboard-main',
    title: 'Tu Dashboard',
    description: 'Vista general de tu sistema.'
  },
  {
    target: '[data-tour="workspace-switcher"]',
    title: 'Workspaces',
    description: 'Cambia entre espacios de trabajo.'
  },
  {
    target: '[data-tour="nav-usage"]',
    title: 'Uso',
    description: 'Mira estadísticas y actividad.'
  },
  {
    target: '[data-tour="user-menu"]',
    title: 'Cuenta',
    description: 'Configura tu perfil.'
  }
];

export const useTour = () => {
  const router = useRouter();

  const step = ref(0);
  const visible = ref(true);
  const mounted = ref(false);

  onMounted(() => {
    mounted.value = true;
  });

  const currentStep = computed(() => TOUR_STEPS[step.value]);

  const currentTargetExists = computed(() => {
    if (!mounted.value) return false;
    return document.querySelector(currentStep.value.target) !== null;
  });

  const next = () => {
    if (step.value < TOUR_STEPS.length - 1) {
      step.value++;
    } else {
      complete();
    }
  };

  const skip = () => {
    complete();
  };

  const complete = () => {
    localStorage.setItem('tour_completed', 'true');
    visible.value = false;
  };

  return {
    step,
    steps: TOUR_STEPS,
    visible,
    currentStep,
    currentTargetExists,
    next,
    skip,
    complete
  };
};
