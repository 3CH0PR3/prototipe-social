export default [
  {
    path: 'groups',
    name: 'social.groups',
    component: () => import('../views/GroupsView.vue'),
    meta: { fullWidth: true }
  },
  {
    path: 'groups/create',
    name: 'social.groups.create',
    component: () => import('../views/CreateGroupView.vue'),
    meta: { fullWidth: true, hideNavigation: true }
  },
  {
    path: 'groups/:id',
    name: 'social.groups.detail',
    component: () => import('../views/GroupDetailView.vue'),
    meta: { fullWidth: true }
  }
];
