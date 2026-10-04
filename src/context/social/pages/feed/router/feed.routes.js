export default [
  {
    path: 'feed',
    name: 'social.feed',
    meta: { title: 'Feeds' },
    component: () => import('../views/FeedView.vue')
  }
];
