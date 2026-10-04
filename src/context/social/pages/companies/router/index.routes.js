export default [
  {
    path: 'companies',
    name: 'social.companies',
    meta: { title: 'Companies' },
    component: () => import('../views/CompaniesView.vue')
  }
];
