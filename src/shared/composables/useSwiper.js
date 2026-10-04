import { onMounted, onBeforeUnmount } from 'vue';
import Swiper from 'swiper/bundle';
import 'swiper/css/bundle';

export function useSwiper(selector, options = {}) {
  let swiperInstance = null;

  onMounted(() => {
    swiperInstance = new Swiper(selector, {
      ...options
    });
  });

  onBeforeUnmount(() => {
    if (swiperInstance) {
      swiperInstance.destroy(true, true);
      swiperInstance = null;
    }
  });

  return {
    get instance() {
      return swiperInstance;
    }
  };
}
