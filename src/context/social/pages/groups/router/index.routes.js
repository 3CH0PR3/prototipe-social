export default [
  {
    path: 'groups',
    name: 'social.groups',
    meta: { title: 'Groups' },
    component: () => import('../views/GroupsView.vue')
  }
];
