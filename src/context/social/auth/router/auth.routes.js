export default [
  {
    path: 'login',
    name: 'social.login',
    meta: { title: 'Iniciar sesión' },
    component: () => import('../views/LoginView.vue')
  },
  {
    path: 'verify-otp',
    name: 'social.verify-otp',
    meta: { title: 'Verificación de dos pasos' },
    component: () => import('../views/VerifyOtpView.vue')
  },
  {
    path: 'register',
    name: 'social.register',
    meta: { title: 'Registrarme' },
    component: () => import('../views/registerView.vue')
  },
  {
    path: 'forgot-password',
    name: 'social.forgot',
    meta: { title: 'Olvide mi contraseña' },
    component: () => import('../views/forgotView.vue')
  },
  {
    path: 'verify-code/:uid',
    name: 'social.verify-code',
    meta: { title: 'Verificar código' },
    component: () => import('../views/verifyView.vue')
  },
  {
    path: 'recovery-password/:uid/:token',
    name: 'social.recovery',
    meta: { title: 'Restablecer mi contraseña' },
    component: () => import('../views/resetView.vue')
  },
  {
    path: 'callback',
    name: 'social.callback',
    meta: { title: 'Verificando...' },
    component: () => import('../views/SocialCallbackView.vue')
  }
];
