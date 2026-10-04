import { onMounted } from 'vue';
import { useEcho } from '@shared/composables/useEcho';
import { clearTenantCache, getTenantId } from '@router/guards/domain.guard';
import { Http, API } from '@shared/http/Http';

export function useTenantStatusGuard() {
  const { listenPublic } = useEcho();

  onMounted(async () => {
    let id = getTenantId();

    if (!id) {
      try {
        const res = await Http.get(API.company.ping);
        const data = res?.data?.data ?? res?.data ?? res;
        id = data?.id;
      } catch {
        return;
      }
    }

    if (!id) return;

    listenPublic(`tenant-status.${id}`, 'company-status-changed', ({ status_code }) => {
      if (status_code !== 1) {
        clearTenantCache();
        window.location.replace(
          `/tenant-inactive?reason=${encodeURIComponent('El servicio ha sido suspendido.')}`
        );
      }
    });
  });
}
