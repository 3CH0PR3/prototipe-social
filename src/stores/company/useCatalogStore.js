/**
 * Store compartido para catálogos estáticos: departamentos, municipios por depto,
 * y tipos de identificación.
 *
 * - Fetch único por clave: nunca vuelve a pedir lo mismo mientras la app esté viva.
 * - Seguro para usar en Create y Update sin duplicar peticiones.
 */
import { ref } from 'vue';
import { defineStore } from 'pinia';
import { API, Http } from '@shared/http/Http';

export const useCatalogStore = defineStore('company.catalog', () => {
  // ── state ─────────────────────────────────────────────────────────────────

  const departments = ref([]);
  const typeIdentifiers = ref([]);

  // municipios por departamento: Map<deptCode, Municipality[]>
  const municipalitiesMap = ref(new Map());

  const loadingDepts = ref(false);
  const loadingTypes = ref(false);
  const loadingMunicipios = ref(false);

  // promesas en vuelo para evitar fetch duplicado
  let deptPromise = null;
  let typesPromise = null;
  const munPromises = new Map(); // Map<deptCode, Promise>

  // ── departamentos ─────────────────────────────────────────────────────────

  const fetchDepartments = async () => {
    if (departments.value.length) return departments.value;
    if (deptPromise) return deptPromise;

    loadingDepts.value = true;
    deptPromise = Http.get(API.company.departments)
      .then(({ data }) => {
        departments.value = data.departments ?? [];
        return departments.value;
      })
      .finally(() => {
        loadingDepts.value = false;
        deptPromise = null;
      });

    return deptPromise;
  };

  // ── tipos de identificación ───────────────────────────────────────────────

  const fetchTypeIdentifiers = async () => {
    if (typeIdentifiers.value.length) return typeIdentifiers.value;
    if (typesPromise) return typesPromise;

    loadingTypes.value = true;
    typesPromise = Http.get(API.company.typeIdentifiers)
      .then(({ data }) => {
        typeIdentifiers.value = data.typeIdentifiers ?? [];
        return typeIdentifiers.value;
      })
      .finally(() => {
        loadingTypes.value = false;
        typesPromise = null;
      });

    return typesPromise;
  };

  // ── municipios por departamento ───────────────────────────────────────────

  const fetchMunicipalities = async (departmentId) => {
    const key = String(departmentId);
    if (!key) return [];

    if (municipalitiesMap.value.has(key)) return municipalitiesMap.value.get(key);
    if (munPromises.has(key)) return munPromises.get(key);

    loadingMunicipios.value = true;
    const p = Http.get(`${API.company.departments}/${departmentId}/municipalities`)
      .then(({ data }) => {
        const list = data.municipalities ?? [];
        municipalitiesMap.value.set(key, list);
        return list;
      })
      .finally(() => {
        munPromises.delete(key);
        // apagar spinner solo cuando no hay ninguna petición activa
        if (munPromises.size === 0) loadingMunicipios.value = false;
      });

    munPromises.set(key, p);
    return p;
  };

  const getMunicipalities = (departmentId) => {
    return municipalitiesMap.value.get(String(departmentId)) ?? [];
  };

  // ── helpers para dan_code ─────────────────────────────────────────────────

  const getDaneCode = (departmentId, municipalityId) => {
    const list = getMunicipalities(departmentId);
    return list.find((m) => String(m.code) === String(municipalityId))?.dane_code ?? '';
  };

  return {
    departments,
    typeIdentifiers,
    municipalitiesMap,
    loadingDepts,
    loadingTypes,
    loadingMunicipios,

    fetchDepartments,
    fetchTypeIdentifiers,
    fetchMunicipalities,
    getMunicipalities,
    getDaneCode
  };
});
