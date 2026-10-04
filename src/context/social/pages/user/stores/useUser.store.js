import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { UserService } from '../services/user.service';

export const useUserStore = defineStore('social.user', () => {
  const user = ref(null);
  const isLoadingUser = ref(false);
  const errorMsg = ref(null);

  const isLoaded = computed(() => !!user.value);
  const role = computed(() => user.value?.role || null);
  const permissions = computed(() => user.value?.permissions || []);

  const isSuperAdmin = computed(
    () => role.value?.name === 'super-admin' || role.value?.name === 'superadmin'
  );

  const shortName = computed(() => user.value?.short_name || user.value?.username || '');
  const roleName = computed(() => role.value?.name || '');
  const roleGuard = computed(() => role.value?.guard_name || '');
  const userAvatar = computed(() => user.value?.avatar_url || null);

  // HELPERS
  const setLoading = (val) => (isLoadingUser.value = val);
  const setError = (err) => (errorMsg.value = err);
  const clearError = () => (errorMsg.value = null);

  // ACTIONS
  const setUser = (userData) => {
    user.value = userData?.id ? userData : null;
  };

  const fetchUser = async () => {
    setLoading(true);
    clearError();

    try {
      const response = await UserService.me();
      user.value = response?.data?.user ?? null;
      return user.value;
    } catch (err) {
      setError(err);
      user.value = null;
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (payload) => {
    setLoading(true);
    clearError();

    try {
      const response = await UserService.updateProfile(payload);
      user.value = { ...user.value, ...response?.data?.user };
      return user.value;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAvatar = async (file) => {
    setLoading(true);
    clearError();

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await UserService.updateAvatar(formData);
      user.value = { ...user.value, avatar: response?.data?.avatar };
      return user.value;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearUser = () => {
    user.value = null;
    clearError();
  };

  const hasRole = (roleName) => {
    return role.value?.name === roleName;
  };

  const hasPermission = (permissionName) => {
    if (isSuperAdmin.value) return true;
    return permissions.value.includes(permissionName);
  };

  const hasAnyRole = (roleNames = []) => {
    return roleNames.some((roleName) => hasRole(roleName));
  };

  const hasAnyPermission = (permissionNames = []) => {
    if (isSuperAdmin.value) return true;
    return permissionNames.some((name) => permissions.value.includes(name));
  };

  return {
    user,
    isLoadingUser,
    errorMsg,
    isLoaded,
    role,
    permissions,
    isSuperAdmin,
    shortName,
    roleName,
    roleGuard,
    userAvatar,
    setUser,
    fetchUser,
    updateProfile,
    updateAvatar,
    clearUser,
    hasRole,
    hasPermission,
    hasAnyRole,
    hasAnyPermission
  };
});
