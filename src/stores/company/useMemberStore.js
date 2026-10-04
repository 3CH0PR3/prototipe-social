import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { MemberService } from '@js/Services/memberService';
import { useToast } from '@js/Composables/useToast';
import { eventBus, EVENTS } from '@js/Utils/eventBus';

export const useMemberStore = defineStore('members', () => {
  // ===========================================
  // ==============> COMPOSABLES <==============
  const toast = useToast();

  // ====================================
  // ==============> REFS <==============
  const members = ref([]);
  const metrics = ref({});
  const metadatas = ref({});
  const statistics = ref({});
  const errorMsg = ref(null);
  const isFetchedMembers = ref(false);
  const isLoadingMembers = ref(false);

  let fetchPromise = null;

  // =======================================
  // ==============> METHODS <==============
  const setLoading = (val) => (isLoadingMembers.value = val);
  const setErrors = (err) => (errorMsg.value = err);
  const clearError = () => (errorMsg.value = null);

  // ========================================
  // ==============> HELPERS <===============
  const executeAsync = async (fn) => {
    setLoading(true);
    clearError();

    try {
      return await fn();
    } catch (err) {
      setErrors(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // ==============> WATCHERS <==============
  watch(errorMsg, (err) => {
    if (!err) return;
    toast.error(err.response?.data?.message || 'Error inesperado');
    errorMsg.value = null;
  });

  // =========================================
  // ==============> ACTIONS <==============
  const fetchMembers = async (force = false) => {
    if (fetchPromise && !force) return fetchPromise;
    if (isFetchedMembers.value && !force) return members.value;

    fetchPromise = executeAsync(async () => {
      const apiResponse = await MemberService.fetchAll();

      members.value = apiResponse.data.members || [];
      metadatas.value = apiResponse.data.metadatas || {};
      isFetchedMembers.value = true;

      return apiResponse;
    }).finally(() => {
      fetchPromise = null;
    });

    return fetchPromise;
  };

  const createMember = async (payload) => {
    return executeAsync(async () => {
      const apiResponse = await MemberService.create(payload);

      if (apiResponse.success !== true || apiResponse.code !== 201) {
        toast.error(apiResponse.message);
        throw new Error(apiResponse.message);
      }

      toast.success(apiResponse.message);
      eventBus.emit(EVENTS.REFRESH_NOTIFICATIONS);

      const newMember = apiResponse.data.member || {};
      members.value = [newMember, ...members.value];
      metadatas.value = apiResponse.data.metadatas || {};

      return apiResponse;
    });
  };

  const updateMember = async (id, payload) => {
    const memberSlug = payload.slug;

    return executeAsync(async () => {
      const apiResponse = await MemberService.update(memberSlug, payload);


      if (apiResponse.success !== true || apiResponse.code !== 200) {
        toast.error(apiResponse.message);
        throw new Error(apiResponse.message);
      }

      toast.success(apiResponse.message);
      eventBus.emit(EVENTS.REFRESH_NOTIFICATIONS);

      const updatedMember = apiResponse.data.member || {};
      const index = members.value.findIndex((m) => m.id === id);

      if (index !== -1) {
        members.value.splice(index, 1, updatedMember);
      }

      return apiResponse;
    });
  };

  const deleteMember = async (id, payload) => {
    const memberSlug = payload.slug;

    return executeAsync(async () => {
      const apiResponse = await MemberService.delete(memberSlug, payload);

      if (apiResponse.success !== true || apiResponse.code !== 200) {
        toast.error(apiResponse.message);
        throw new Error(apiResponse.message);
      }

      toast.success(apiResponse.message);
      eventBus.emit(EVENTS.REFRESH_NOTIFICATIONS);

      return apiResponse;
    });
  };

  const deleteAllMembers = async () => {
    return executeAsync(async () => {
      const apiResponse = await MemberService.deleteAll();
      members.value = apiResponse?.data.members || [];
      return apiResponse;
    });
  };

  const toggleMemberStatus = async (payload, currentStatus) => {
    const memberId = payload.id;
    const memberSlug = payload.slug;
    const newStatus = currentStatus === 1 ? 2 : 1;

    const apiResponse = await MemberService.toggleStatus(memberSlug, memberId, newStatus);

    if (apiResponse.success !== true || apiResponse.code !== 200) {
      toast.error(apiResponse.message);
      throw new Error(apiResponse.message);
    }

    const updatedMember = apiResponse.data.member;
    members.value = members.value.map((m) => (m.id === memberId ? updatedMember : m));

    toast.success(apiResponse.message);
    eventBus.emit(EVENTS.REFRESH_NOTIFICATIONS);

    return apiResponse;
  };

  const showByDepartment = (code) => {
    return executeAsync(async () => {
      const apiResponse = await Http.get(`company/departments/${code}/municipalities`);

      if (apiResponse.success !== true || apiResponse.code !== 200) {
        toast.error(apiResponse.message);
        throw new Error(apiResponse.message);
      }

      return apiResponse;
    });
  };

  // =========================================
  // ==============> RETURN <==============
  return {
    // State
    members,
    metadatas,
    errorMsg,
    isFetchedMembers,
    isLoadingMembers,

    // Actions
    fetchMembers,
    createMember,
    updateMember,
    deleteMember,
    toggleMemberStatus,
    showByDepartment
  };
});
