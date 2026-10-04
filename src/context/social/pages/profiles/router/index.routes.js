// Rutas unificadas de perfiles - usa UnifiedProfileLayout para todos los perfiles
import UnifiedProfileLayout from '@layouts/social/UnifiedProfileLayout.vue';

export default [
  // Perfil Exclusivo del Sistema (GEA-WRC)
  {
    path: 'gea-wrc',
    name: 'social.system-profile',
    component: () => import('@social/pages/profiles/views/SystemProfile.vue'),
    meta: { title: 'GEA-WRC Oficial', fullWidth: true }
  },
  // Perfiles unificados (MI perfil y otros usuarios)
  {
    path: 'profiles/:id',
    component: UnifiedProfileLayout,
    meta: { title: 'Perfil', fullWidth: true },
    children: [
      {
        path: '',
        name: 'social.profiles',
        redirect: (to) => ({
          name: 'social.profiles.publications',
          params: to.params
        })
      },
      {
        path: 'publications',
        name: 'social.profiles.publications',
        meta: { title: 'Publicaciones' },
        component: () => import('@social/shared/views/profile/PublicationsView.vue')
      },
      {
        path: 'info',
        name: 'social.profiles.info',
        meta: { title: '' },
        component: () => import('@social/shared/views/profile/InfoView.vue')
      },
      {
        path: 'friends',
        name: 'social.profiles.friends',
        meta: { title: 'Amigos' },
        component: () => import('@social/shared/views/profile/FriendsView.vue')
      },
      {
        path: 'photos',
        name: 'social.profiles.photos',
        meta: { title: 'Fotos' },
        component: () => import('@social/shared/views/profile/PhotosView.vue')
      }
    ]
  }
];
