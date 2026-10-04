import { defineStore } from 'pinia';
import { ref } from 'vue';
import { friendsService } from '../services/friends.service';
import { useToast } from '@shared/composables/useToast';
import { useFriendshipStore } from '@social/shared/stores/useFriendship.store.js';

export const useFriendsStore = defineStore('profile-friends', () => {
  const toast = useToast();

  const friends = ref([]);
  const requests = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  const fetchFriends = async (userId) => {
    if (!userId) return;
    isLoading.value = true;
    error.value = null;
    try {
      const response = await friendsService.fetchFriends(userId);
      friends.value = response.data.friends || response.data || [];
    } catch (err) {
      error.value = err.message;
      toast.error('Error al cargar amigos');
    } finally {
      isLoading.value = false;
    }
  };

  const fetchRequests = async (userId) => {
    if (!userId) return;
    try {
      const response = await friendsService.fetchRequests(userId);
      requests.value = response.data.requests || response.data || [];
    } catch (err) {
      console.error('Error fetching friend requests:', err);
    }
  };

  // Acepta la solicitud: llama al friendship store, luego mueve la persona
  // de requests → friends localmente sin necesidad de re-fetch
  const acceptRequest = async (person) => {
    const friendshipStore = useFriendshipStore();
    await friendshipStore.acceptRequest(person.id);

    // Quitar de solicitudes
    requests.value = requests.value.filter((r) => r.id !== person.id);

    // Agregar a amigos con el flag correcto si no estaba ya
    const already = friends.value.some((f) => f.id === person.id);
    if (!already) {
      friends.value = [{ ...person, is_friend: true, has_pending_request_from: false }, ...friends.value];
    }
  };

  // Rechaza/elimina la solicitud sin moverla a amigos
  const rejectRequest = async (person) => {
    const friendshipStore = useFriendshipStore();
    await friendshipStore.cancelRequest(person.id);
    requests.value = requests.value.filter((r) => r.id !== person.id);
  };

  // Elimina un amigo de la lista local
  const removeFriend = async (person) => {
    const friendshipStore = useFriendshipStore();
    await friendshipStore.removeFriend(person.id);
    friends.value = friends.value.filter((f) => f.id !== person.id);
  };

  const $reset = () => {
    friends.value = [];
    requests.value = [];
    isLoading.value = false;
    error.value = null;
  };

  return {
    friends,
    requests,
    isLoading,
    error,
    fetchFriends,
    fetchRequests,
    acceptRequest,
    rejectRequest,
    removeFriend,
    $reset
  };
});
