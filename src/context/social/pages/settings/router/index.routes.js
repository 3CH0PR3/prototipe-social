export default [
  {
    path: 'settings',
    name: 'social.settings',
    meta: { title: 'Settings' },
    component: () => import('../views/SettingsView.vue')
  },
  {
    path: 'settings/verification',
    name: 'social.settings.verification',
    meta: { title: 'Verificación de Empresa' },
    component: () => import('../views/VerificationView.vue')
  }
];
