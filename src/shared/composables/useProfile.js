import { computed, toValue } from 'vue';

export function getProfileFullName(user) {
  if (!user) return 'Usuario';

  const pi = user.personal_information || user.personalinformation || user;
  const firstName = pi.first_name || '';
  const paternalSurname = pi.paternal_surname || '';
  const fullNameFromPI = `${firstName} ${paternalSurname}`.trim();

  if (pi.short_name) return pi.short_name;
  if (fullNameFromPI) return fullNameFromPI;
  if (user.name) return user.name;

  return user.username || 'Usuario';
}

export function getProfileAvatar(user) {
  if (!user) return null;
  const pi = user.personal_information || user.personalinformation || user;
  return pi.avatar_url || pi.avatar || null;
}

export function useProfile(source) {
  const user = computed(() => (typeof source === 'function' ? source() : source));

  const personalInfo = computed(
    () => user.value?.personal_information || user.value?.personalinformation || user.value || {}
  );

  const avatar = computed(
    () => personalInfo.value?.avatar_url || personalInfo.value?.avatar || null
  );

  const firstName = computed(
    () => personalInfo.value?.first_name?.split(' ')?.at(0) ?? ''
  );

  const lastName = computed(
    () => personalInfo.value?.paternal_surname?.split(' ')?.at(0) ?? ''
  );

  const fullName = computed(
    () => personalInfo.value?.short_name || `${firstName.value} ${lastName.value}`.trim() || user.value?.username || 'Usuario'
  );

  const initials = computed(
    () => {
      const f = firstName.value.charAt(0);
      const l = lastName.value.charAt(0);
      if (f || l) return `${f}${l}`.toUpperCase();
      return (user.value?.username || 'US').substring(0, 2).toUpperCase();
    }
  );

  const isVerified = computed(
    () => Boolean(user.value?.email_verified_at)
  );

  const hasAvatar = computed(
    () => Boolean(avatar.value)
  );

  const profileProgress = computed(() => {
    const pi = personalInfo.value;
    if (!pi || Object.keys(pi).length === 0) return 0;

    const fields = [
      pi.first_name,
      pi.paternal_surname,
      pi.phone_number,
      pi.identity_card || pi.dni,
      pi.birth_date,
      pi.country,
      pi.city
    ];

    const filled = fields.filter((f) => f && String(f).trim() !== '').length;
    return Math.round((filled / fields.length) * 100);
  });

  const profileProgressHint = computed(() => {
    if (profileProgress.value === 100) return '¡Perfil completo!';
    const pi = personalInfo.value;
    if (!pi.country) return 'Agrega tu país para avanzar';
    if (!pi.city) return 'Agrega tu ciudad para completar';
    if (!pi.phone_number) return 'Agrega tu teléfono';
    if (!(pi.identity_card || pi.dni)) return 'Agrega tu documento de identidad';
    return 'Completa los campos restantes';
  });


  return {
    user,
    personalInfo,
    avatar,
    hasAvatar,
    firstName,
    lastName,
    fullName,
    initials,
    profileProgress,
    profileProgressHint,
    isVerified
  };
}
