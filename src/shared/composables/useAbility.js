import { useAuthStore } from '@central/auth/stores/useAuth.store';

export const useAbility = () => {
  const authStore = useAuthStore();

  const hasRole = (roles = []) => {
    return roles.includes(authStore.user?.role?.name);
  };

  const hasPermission = (permissions = []) => {
    const userPermissions = authStore.user?.permissions ?? [];

    return permissions.some((permission) => userPermissions.includes(permission));
  };

  return {
    hasRole,
    hasPermission
  };
};
