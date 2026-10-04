let scrollLockCount = 0;

export function useBodyScrollLock() {
  const lockScroll = () => {
    if (scrollLockCount === 0) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${window.scrollY}px`;
    }
    scrollLockCount++;
  };

  const unlockScroll = (force = false) => {
    if (force) {
      scrollLockCount = 0;
    } else {
      scrollLockCount = Math.max(0, scrollLockCount - 1);
    }

    if (scrollLockCount === 0) {
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';

      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
  };

  return { lockScroll, unlockScroll };
}
