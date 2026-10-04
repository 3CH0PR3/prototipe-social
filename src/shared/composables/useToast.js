import { getSubdomain } from '@shared/helpers/subdomain';

const APP_NAME = getSubdomain() ?? import.meta.env.VITE_APP_NAME;

export function useToast() {
  const closeToast = (toastElement) => {
    toastElement.classList.remove('translate-x-0', 'opacity-100');
    toastElement.classList.add('translate-x-full', 'opacity-0');

    setTimeout(() => {
      toastElement.remove();
      const container = document.getElementById('toast-container');
      if (container && container.children.length === 0) {
        container.remove();
      }
    }, 300);
  };

  const show = (message, type = 'success', duration = 3000, domain = APP_NAME) => {
    const toastId = `toast-${Date.now()}`;

    const borderColors = {
      success: 'border-l-emerald-500',
      error: 'border-l-red-500',
      warning: 'border-l-amber-500',
      info: 'border-l-blue-500',
      primary: 'border-l-brand-500'
    };

    const iconColors = {
      success: 'text-emerald-500',
      error: 'text-red-500',
      warning: 'text-amber-500',
      info: 'text-blue-500',
      primary: 'text-brand-500'
    };

    const toastHTML = `
      <div id="${toastId}" class="toast-item transform transition-all duration-300 ease-out translate-x-full opacity-0">
        <div class="card border-l-4 ${borderColors[type]} shadow-lg w-[100%] md:w-[300px]">
          <div class="flex items-start gap-3 p-4">
            <div class="flex-shrink-0 mt-0.5">
              ${getIcon(type, iconColors[type])}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs sm:text-sm font-semibold uppercase tracking-wide mb-1 text-gray-700 dark:text-gray-300">${domain}</p>
              <p class="text-xs sm:text-sm leading-relaxed text-gray-600 dark:text-gray-400 break-words">${message}</p>
            </div>
            <button 
              type="button" 
              class="flex-shrink-0 ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors outline-none p-1 rounded"
              data-toast-close="${toastId}"
            >
              <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;

    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'fixed top-4 right-0 z-[99999] flex flex-col gap-3 pointer-events-none px-4';
      document.body.appendChild(container);
    }

    container.insertAdjacentHTML('beforeend', toastHTML);

    const toastElement = document.getElementById(toastId);
    toastElement.style.pointerEvents = 'auto';

    const closeButton = toastElement.querySelector(`[data-toast-close="${toastId}"]`);

    let autoCloseTimeout = setTimeout(() => {
      closeToast(toastElement);
    }, duration);

    closeButton.addEventListener('click', (e) => {
      e.preventDefault();
      clearTimeout(autoCloseTimeout);
      closeToast(toastElement);
    });

    requestAnimationFrame(() => {
      toastElement.classList.remove('translate-x-full', 'opacity-0');
      toastElement.classList.add('translate-x-0', 'opacity-100');
    });
  };

  const getIcon = (type, colorClass) => {
    const icons = {
      success: `
        <svg class="w-5 h-5 sm:w-6 sm:h-6 ${colorClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      `,
      error: `
        <svg class="w-5 h-5 sm:w-6 sm:h-6 ${colorClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      `,
      warning: `
        <svg class="w-5 h-5 sm:w-6 sm:h-6 ${colorClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
      `,
      info: `
        <svg class="w-5 h-5 sm:w-6 sm:h-6 ${colorClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      `,
      primary: `
        <svg class="w-5 h-5 sm:w-6 sm:h-6 ${colorClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
        </svg>
      `
    };
    return icons[type] || icons.info;
  };

  return {
    success: (message, duration) => show(message, 'success', duration),
    error: (message, duration) => show(message, 'error', duration),
    warning: (message, duration) => show(message, 'warning', duration),
    info: (message, duration) => show(message, 'info', duration),
    primary: (message, duration) => show(message, 'primary', duration)
  };
}
