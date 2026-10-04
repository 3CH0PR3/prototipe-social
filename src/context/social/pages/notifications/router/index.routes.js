export default [
  {
    path: 'notifications',
    name: 'social.notifications',
    meta: { title: 'Notifications' },
    component: () => import('../views/NotificationsView.vue')
  }
];
