export default [
  {
    path: 'messages',
    name: 'social.messages',
    meta: { title: 'Messages' },
    component: () => import('../views/MessagesView.vue')
  }
];
