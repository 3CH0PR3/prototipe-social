import { computed } from 'vue';

export function useAvatar(source) {
  const user = computed(() => (typeof source === 'function' ? source() : source));

  const personalInformation = computed(
    () => user.value?.personalinformation || user.value?.personal_information || {}
  );

  const avatar = computed(
    () => personalInformation.value?.avatar_url || personalInformation.value?.avatar || null
  );

  const firstName = computed(
    () => personalInformation.value?.first_name?.split(' ')?.at(0) ?? ''
  );

  const lastName = computed(
    () => personalInformation.value?.paternal_surname?.split(' ')?.at(0) ?? ''
  );

  const fullName = computed(
    () => personalInformation.value?.short_name || `${firstName.value} ${lastName.value}`.trim()
  );

  const initials = computed(() => {
    return `${firstName.value.charAt(0)}${lastName.value.charAt(0)}`.toUpperCase();
  });

  const hasAvatar = computed(() => Boolean(avatar.value));

  return {
    avatar,
    initials,
    fullName,
    hasAvatar,
    firstName,
    lastName,
    personalInformation
  };
}
