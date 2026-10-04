import { ref } from 'vue';

export function useLegalAcceptance(slug) {
  const storageKey = `legal-accepted-${slug}`;
  const accepted = ref(localStorage.getItem(storageKey) || null);

  async function accept(version) {
    // persist locally
    localStorage.setItem(storageKey, version);
    accepted.value = version;

    // Optional: notify backend if we had an endpoint ready and user authenticated
    // await useHttp().post(`/legal/${slug}/accept`, { version });
  }

  return { accepted, accept };
}
