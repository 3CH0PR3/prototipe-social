import { reactive, ref } from 'vue';
import { defineStore } from 'pinia';
import { friendshipService } from '../services/friendship.service.js';
import { useToast } from '@shared/composables/useToast.js';

export const useFriendshipStore = defineStore('social.friendship', () => {
  const toast = useToast();

  // statusMap stores friendship states keyed by userId
  // e.g. { [userId]: { isFriend: boolean, isPending: boolean, isLoading: boolean } }
  const statusMap = reactive({});
  const errorMsg = ref(null);

  const setErrors = (err) => (errorMsg.value = err);
  const clearError = () => (errorMsg.value = null);

  const executeAsync = async (userId, fn, successMessage) => {
    clearError();
    initStatus(userId);
    statusMap[userId].isLoading = true;

    try {
      await fn();
      if (successMessage) toast.success(successMessage);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || error.message || 'Ocurrió un error inesperado';
      setErrors(msg);
      toast.error(msg);
    } finally {
      statusMap[userId].isLoading = false;
    }
  };

  const initStatus = (userId, initialData = {}) => {
    if (!statusMap[userId]) {
      statusMap[userId] = {
        isFriend: initialData.isFriend || false,
        hasPendingRequestFrom: initialData.hasPendingRequestFrom || false,
        hasSentPendingRequest: initialData.hasSentPendingRequest || false,
        isLoading: false
      };
    }
  };

  const getStatus = (userId) => {
    return (
      statusMap[userId] || {
        isFriend: false,
        hasPendingRequestFrom: false,
        hasSentPendingRequest: false,
        isLoading: false
      }
    );
  };

  const sendRequest = async (userId) => {
    return executeAsync(
      userId,
      async () => {
        await friendshipService.sendFriendRequest(userId);
        statusMap[userId].hasSentPendingRequest = true;
      },
      'Solicitud de amistad enviada'
    );
  };

  const cancelRequest = async (userId) => {
    return executeAsync(
      userId,
      async () => {
        await friendshipService.cancelFriendRequest(userId);
        statusMap[userId].hasSentPendingRequest = false;
      },
      'Solicitud cancelada'
    );
  };

  const acceptRequest = async (userId) => {
    return executeAsync(
      userId,
      async () => {
        await friendshipService.acceptFriendRequest(userId);
        statusMap[userId].hasPendingRequestFrom = false;
        statusMap[userId].isFriend = true;
      },
      'Solicitud aceptada'
    );
  };

  const removeFriend = async (userId) => {
    return executeAsync(
      userId,
      async () => {
        await friendshipService.removeFriend(userId);
        statusMap[userId].isFriend = false;
        statusMap[userId].hasSentPendingRequest = false;
        statusMap[userId].hasPendingRequestFrom = false;
      },
      'Amigo eliminado'
    );
  };

  return {
    statusMap,
    errorMsg,
    initStatus,
    getStatus,
    sendRequest,
    cancelRequest,
    acceptRequest,
    removeFriend
  };
});
