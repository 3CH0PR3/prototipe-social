import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

function waitForElement(selector, callback, maxAttempts = 25, intervalMs = 200) {
  let attempts = 0;
  const timer = setInterval(() => {
    attempts++;
    const el = document.querySelector(selector);
    if (el) {
      clearInterval(timer);
      callback(true);
    } else if (attempts >= maxAttempts) {
      clearInterval(timer);
      callback(false);
    }
  }, intervalMs);
}

export function useTenantTour(router) {
  const startTour = () => {
    if (window.innerWidth < 768) {
      console.log('ℹ️ [TOUR] Tour skipped: Screen is too small (mobile view).');
      return;
    }
    const seen = localStorage.getItem('tenant_tour_seen');
    const savedStepRaw = localStorage.getItem('tenant_tour_step');
    console.log(`🚀 [TOUR] startTour() initialized. (tenant_tour_seen: ${seen}, tenant_tour_step: ${savedStepRaw})`);

    if (seen === 'true') {
      console.log('ℹ️ [TOUR] Tour skipped: tenant_tour_seen is true in localStorage. To reset tour in dev console run: localStorage.removeItem("tenant_tour_seen"); localStorage.removeItem("tenant_tour_step"); location.reload();');
      return;
    }

    const tourSteps = [
      {
        element: '#tour-nav-resolutions',
        popover: {
          title: '🗂️ Módulo de Resoluciones',
          description:
            'En esta sección encontrarás todos los registros del sistema. Aquí comienza toda la trazabilidad de tu operación.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: '#tour-card-aps-management',
        popover: {
          title: '⚡ Registros de APS',
          description:
            'El APS (Área de Prestación del Servicio) es el <strong>registro inicial y más importante</strong> de todo el sistema. Debes configurarlo antes que cualquier otro módulo.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#tour-card-ecas-management',
        popover: {
          title: '🏭 Registros de ECAS',
          description:
            'Gestiona las <strong>Estaciones de Clasificación y Aprovechamiento</strong> (ECA) que hacen parte de tu operación.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#tour-card-member-management',
        popover: {
          title: '👤 Registros de Miembros',
          description:
            'Registra y administra los miembros de tu empresa: conductores, operarios y demás roles del sistema.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#tour-card-macro-route-management',
        popover: {
          title: '🗺️ Registros de Macrorrutas',
          description:
            'Define las <strong>rutas principales</strong> de tu operación. Las macrorrutas agrupan microrrutas y determinan la cobertura de tu empresa.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#tour-card-vehicle-management',
        popover: {
          title: '🚛 Registros de Vehículos',
          description:
            'Gestiona la flota de vehículos que participan en las rutas de recolección y transporte.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#tour-card-resource-reception-management',
        popover: {
          title: '📥 Recepción de Recursos',
          description:
            'Registra el pago de las mesas de conciliación con las empresas de servicios de NO Aprovechables.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#tour-card-user-database-management',
        popover: {
          title: '🗄️ Base de datos de usuarios',
          description:
            'Administra el listado general de usuarios vinculados a tu empresa prestadora del servicio.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#tour-card-aforado-subscribers-management',
        popover: {
          title: '⚖️ Suscriptores Aforados',
          description:
            'Gestiona los grandes generadores aforados, configurando sus frecuencias y volumen de recolección.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#tour-card-dinc-subscribers-management',
        popover: {
          title: '🏢 Suscriptores DINC',
          description:
            'Gestión de incentivos para los usuarios que generen menos del 20% de rechazo en las macro-rutas',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#tour-card-mass-balance-management',
        popover: {
          title: '⚖️ Balance de Masas',
          description:
            'Realiza el balance final entre el material ingresado, rechazado y comercializado en tu operación.',
          side: 'bottom',
          align: 'start'
        }
      }
    ];

    let userOmitted = false;

    const driverObj = driver({
      allowClose: false,
      showProgress: true,
      animate: true,
      smoothScroll: true,
      scrollIntoViewOptions: { behavior: 'smooth', block: 'start' },
      overlayColor: 'transparent',
      stagePadding: 4,
      stageRadius: 6,
      popoverClass: 'geca-driver-popover',
      progressText: '{{current}} de {{total}}',
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Entendido ✓',
      onPrevClick: (element, step, { state }) => {
        const currentStep = state.activeIndex;
        console.log(`👈 [TOUR] onPrevClick at step ${currentStep}`);

        if (currentStep === 1) {
          if (router) {
            console.log('🔄 [TOUR] Navigating to company.dashboard from step 1 (prev)');
            router.push({ name: 'company.dashboard' });
          }
          localStorage.setItem('tenant_tour_step', '0');
          waitForElement('#tour-nav-resolutions', (found) => {
            if (found) {
              const el = document.querySelector('#tour-nav-resolutions');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              console.log('✅ [TOUR] Element #tour-nav-resolutions found, moving previous to step 0');
              driverObj.movePrevious();
            } else {
              console.warn('⚠️ [TOUR] #tour-nav-resolutions not found on prev click');
            }
          });
        } else {
          const prevSelector = tourSteps[currentStep - 1]?.element;
          if (prevSelector) {
            const el = document.querySelector(prevSelector);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          driverObj.movePrevious();
        }
      },
      onNextClick: (element, step, { state }) => {
        const currentStep = state.activeIndex;
        console.log(`👉 [TOUR] onNextClick at step ${currentStep}`);

        if (currentStep === 0) {
          if (router) {
            console.log('🔄 [TOUR] Navigating to company.resolutions.2021 from step 0 (next)');
            router.push({ name: 'company.resolutions.2021' });
          }

          waitForElement('#tour-card-aps-management', (found) => {
            if (found) {
              const el = document.querySelector('#tour-card-aps-management');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              console.log('✅ [TOUR] Element #tour-card-aps-management found, moving next to step 1');
              driverObj.moveNext();
            } else {
              console.warn('⚠️ [TOUR] #tour-card-aps-management not found on next click');
            }
          });
        } else {
          const nextSelector = tourSteps[currentStep + 1]?.element;
          if (nextSelector) {
            const el = document.querySelector(nextSelector);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          driverObj.moveNext();
        }
      },
      onPopoverRender: (popoverDOM, { state }) => {
        const stepIndex = state.activeIndex;
        const currentSelector = tourSteps[stepIndex]?.element;
        console.log(`📍 [TOUR] Rendering popover for step ${stepIndex} (selector: "${currentSelector}")`);

        const elementExists = currentSelector ? document.querySelector(currentSelector) : null;
        if (!elementExists) {
          console.warn(`⚠️ [TOUR] Step ${stepIndex} element "${currentSelector}" NOT in DOM during popover render!`);
        } else {
          console.log(`✅ [TOUR] Step ${stepIndex} element "${currentSelector}" present in DOM.`);
          elementExists.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        localStorage.setItem('tenant_tour_step', stepIndex.toString());
        console.log(`💾 [TOUR] Saved tenant_tour_step = ${stepIndex}`);

        const wrapper = popoverDOM.wrapper || popoverDOM;

        // Remover botón de omitir previo si existe
        const existingOmitir = wrapper.querySelector('.custom-omitir-btn');
        if (existingOmitir) existingOmitir.remove();

        const footer = wrapper.querySelector('.driver-popover-footer');
        const navBtns = wrapper.querySelector('.driver-popover-navigation-btns');

        const createOmitirBtn = () => {
          const omitirBtn = document.createElement('button');
          omitirBtn.innerHTML = 'Omitir';
          omitirBtn.className = 'driver-popover-btn custom-omitir-btn';
          omitirBtn.style.marginRight = '10px';
          omitirBtn.style.textDecoration = 'underline';
          omitirBtn.style.opacity = '0.7';
          omitirBtn.style.fontSize = '13px';
          omitirBtn.onclick = (e) => {
            e.preventDefault();
            console.log('🚫 [TOUR] User clicked Omitir button.');
            userOmitted = true;
            driverObj.destroy();
          };
          return omitirBtn;
        };

        if (navBtns) {
          navBtns.insertBefore(createOmitirBtn(), navBtns.firstChild);
        } else if (footer) {
          footer.insertBefore(createOmitirBtn(), footer.firstChild);
        }

        const closeBtn = wrapper.querySelector('.driver-popover-close-btn');
        if (closeBtn) {
          closeBtn.style.display = 'none';
        }
      },
      onDestroyed: () => {
        console.log(`🛑 [TOUR] Tour destroyed (userOmitted: ${userOmitted}). Setting tenant_tour_seen = "true".`);
        localStorage.setItem('tenant_tour_seen', 'true');
        localStorage.removeItem('tenant_tour_step');
      },
      steps: tourSteps
    });

    const savedStep = parseInt(localStorage.getItem('tenant_tour_step') || '0', 10);
    console.log(`🔎 [TOUR] Evaluating start strategy for savedStep ${savedStep}...`);

    if (savedStep > 0 && tourSteps[savedStep]) {
      const currentRouteName = router?.currentRoute?.value?.name;
      console.log(`📱 [TOUR] Current route name: "${currentRouteName}"`);

      if (currentRouteName === 'company.dashboard') {
        console.log('🔄 [TOUR] On company.dashboard, resetting savedStep to 0');
        localStorage.setItem('tenant_tour_step', '0');
        waitForElement('#tour-nav-resolutions', (found) => {
          if (found) {
            const el = document.querySelector('#tour-nav-resolutions');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            console.log('▶️ [TOUR] Driving step 0 on dashboard');
            driverObj.drive(0);
          } else {
            console.warn('⚠️ [TOUR] #tour-nav-resolutions not found on dashboard start');
          }
        });
      } else {
        if (router && currentRouteName !== 'company.resolutions.2021') {
          console.log('🔄 [TOUR] Navigating to company.resolutions.2021 for saved step');
          router.push({ name: 'company.resolutions.2021' });
        }

        const targetSelector = tourSteps[savedStep].element;
        console.log(`⏳ [TOUR] Waiting for element "${targetSelector}" for step ${savedStep}...`);
        waitForElement(targetSelector, (found) => {
          if (found) {
            const el = document.querySelector(targetSelector);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            console.log(`▶️ [TOUR] Driving step ${savedStep}`);
            driverObj.drive(savedStep);
          } else {
            console.warn(`⚠️ [TOUR] Target selector "${targetSelector}" not found. Falling back to step 0.`);
            localStorage.setItem('tenant_tour_step', '0');
            waitForElement('#tour-nav-resolutions', (f) => {
              if (f) {
                const el = document.querySelector('#tour-nav-resolutions');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                driverObj.drive(0);
              }
            });
          }
        });
      }
    } else {
      console.log('⏳ [TOUR] Waiting for element "#tour-nav-resolutions" for initial step 0...');
      waitForElement('#tour-nav-resolutions', (found) => {
        if (found) {
          const el = document.querySelector('#tour-nav-resolutions');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          console.log('▶️ [TOUR] Driving step 0 (initial)');
          driverObj.drive(0);
        } else {
          console.warn('⚠️ [TOUR] #tour-nav-resolutions not found for step 0');
        }
      });
    }
  };

  const resumeTour = () => {
    const seen = localStorage.getItem('tenant_tour_seen');
    console.log(`🔄 [TOUR] resumeTour() called. (tenant_tour_seen: ${seen})`);
    if (seen === 'true') return;
    startTour();
  };

  return { startTour, resumeTour };
}
