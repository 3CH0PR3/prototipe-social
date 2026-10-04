import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { NotificationsService } from '../services/notifications.service.js';
import { useToast } from '@shared/composables/useToast';
import { useProfile } from '@shared/composables/useProfile';

export const useNotificationsStore = defineStore('social.notifications', () => {
  const toast = useToast();

  const newItems = ref([]);
  const earlierItems = ref([]);
  const isLoading = ref(false);
  const errorMsg = ref(null);

  const unreadCount = computed(() => {
    return newItems.value.filter((n) => !n.read).length + earlierItems.value.filter((n) => !n.read).length;
  });

  const fetchItems = async () => {
    isLoading.value = true;
    try {
      const response = await NotificationsService.fetchData();

      const mapActor = (item) => {
        if (!item.actor) return item;
        const profile = useProfile(item.actor);
        return {
          ...item,
          actor: {
            ...item.actor,
            name: profile.fullName.value,
            avatar: profile.avatar.value,
            initials: profile.initials.value
          }
        };
      };

      newItems.value = (response.data?.newItems || []).map(mapActor);
      earlierItems.value = (response.data?.earlierItems || []).map(mapActor);
    } catch (err) {
      errorMsg.value = err;
      console.error('Failed to fetch notifications', err);
    } finally {
      isLoading.value = false;
    }
  };

  const markRead = async (id) => {
    try {
      await NotificationsService.markRead(id);
      const newItem = newItems.value.find((n) => n.id === id);
      if (newItem) newItem.read = true;

      const earlierItem = earlierItems.value.find((n) => n.id === id);
      if (earlierItem) earlierItem.read = true;
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const markAllRead = async () => {
    try {
      await NotificationsService.markAllRead();
      newItems.value.forEach((n) => (n.read = true));
      earlierItems.value.forEach((n) => (n.read = true));
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  };

  return {
    newItems,
    earlierItems,
    unreadCount,
    isLoading,
    errorMsg,
    fetchItems,
    markRead,
    markAllRead
  };
});
