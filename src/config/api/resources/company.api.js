import { buildTenant } from '../core/core';

const r = (path) => buildTenant(`company/${path}`);

export const companyApi = {
  ping: r('ping'),

  auth: {
    me: r('auth/me'),
    login: r('auth/login'),
    logout: r('auth/logout'),
    impersonateExchange: r('auth/impersonate/exchange'),

    verifyCode: r('auth/verify-code'),
    findAccount: r('auth/find-account'),
    verifyAccount: r('auth/verify-account'),

    password: {
      forgot: r('auth/forgot-password'),
      reset: r('auth/reset-password')
    },

    forget: r('auth/forge-session')
  },

  chatbot: {
    ask: r('chatbot/ask'),
    conversations: r('chatbot/conversations')
  },

  users: r('users'),
  roles: r('roles'),
  chat: r('chat'),
  chats: r('chats'),

  notifications: {
    base: r('notifications'),
    show: (id) => r(`notifications/${id}`),
    markAsRead: (id) => r(`notifications/${id}/mark-as-read`),
    markAllAsRead: r('notifications/mark-all-as-read'),
    delete: (id) => r(`notifications/${id}`)
  },

  statuses: r('statuses'),
  dashboard: r('system-dashboard'),
  analytics: r('system-analytics'),
  typeIdentifiers: r('type-identifiers'),
  departments: r('departments'),
  municipalities: r('municipalities'),

  settings: {
    profile: {
      base: r('profile'),
      avatar: r('profile/avatar'),
      password: r('profile/password')
    },

    security: {
      base: r('profile'),
      accountStatus: r('profile/account-status'),
      securityLogs: r('profile/security-logs')
    },

    company: {
      index: r('settings/company'),
      update: r('settings/company'),
      uppload: r('settings/company/logo')
    },

    subscription: {
      current: r('subscription/current'),
      history: r('subscription/history'),
      export: r('subscription/export'),
      invoice: (id) => r(`subscription/invoice/${id}`),
      availablePlans: r('subscription/available-plans'),
      requestChange: r('subscription/request-change')
    },
  },

  tickets: {
    base: r('tickets'),
    show: (uuid) => r(`tickets/${uuid}`),
    addMessage: (uuid) => r(`tickets/${uuid}/messages`),
    rate: (uuid) => r(`tickets/${uuid}/rate`),
    fromBot: r('tickets/from-bot')
  },

  resolutions: {
    base: r('resolutions'),
    find: (slug) => r(`resolutions/${slug}`),

    aps: {
      base: r('resolutions/aps-management'),
      create: r('resolutions/aps-management'),
      lookup: r('resolutions/aps-management/lookup'),
      export: r('resolutions/aps-management/export'),
      show: (id) => r(`resolutions/aps-management/${id}`),
      update: (id) => r(`resolutions/aps-management/${id}`),
      delete: (id) => r(`resolutions/aps-management/${id}`),
      restore: (id) => r(`resolutions/aps-management/${id}/restore`),
      updateStatus: (id) => r(`resolutions/aps-management/${id}/status`),
      forceDeleteAll: r('resolutions/aps-management/trash')
    },

    ecas: {
      base: r('resolutions/ecas-management'),
      create: r('resolutions/ecas-management'),
      lookup: r('resolutions/ecas-management/lookup'),
      export: r('resolutions/ecas-management/export'),
      show: (id) => r(`resolutions/ecas-management/${id}`),
      update: (id) => r(`resolutions/ecas-management/${id}`),
      delete: (id) => r(`resolutions/ecas-management/${id}`),
      restore: (id) => r(`resolutions/ecas-management/${id}/restore`),
      updateStatus: (id) => r(`resolutions/ecas-management/${id}/status`),
      forceDeleteAll: r('resolutions/ecas-management/trash')
    },

    members: {
      base: r('resolutions/member-management'),
      create: r('resolutions/member-management'),
      lookup: r('resolutions/member-management/lookup'),
      export: r('resolutions/member-management/export'),
      show: (id) => r(`resolutions/member-management/${id}`),
      update: (slug) => r(`resolutions/member-management/${slug}`),
      delete: (slug) => r(`resolutions/member-management/${slug}`),
      restore: (id) => r(`resolutions/member-management/${id}/restore`),
      updateStatus: (id) => r(`resolutions/member-management/${id}/status`),
      forceDeleteAll: r('resolutions/member-management/trash')
    },

    macroRoutes: {
      base: r('resolutions/macro-routes'),
      create: r('resolutions/macro-routes'),
      export: r('resolutions/macro-routes/export'),

      show: (id) => r(`resolutions/macro-routes/${id}`),
      update: (id) => r(`resolutions/macro-routes/${id}`),
      delete: (id) => r(`resolutions/macro-routes/${id}`)
    },

    microRoutes: {
      base: r('resolutions/micro-routes'),
      create: r('resolutions/micro-routes'),
      lookup: r('resolutions/micro-routes/lookup'),
      export: r('resolutions/micro-routes/export'),

      show: (id) => r(`resolutions/micro-routes/${id}`),
      update: (id) => r(`resolutions/micro-routes/${id}`),
      delete: (id) => r(`resolutions/micro-routes/${id}`)
    },

    vehicles: {
      base: r('resolutions/vehicles'),
      create: r('resolutions/vehicles'),

      show: (id) => r(`resolutions/vehicles/${id}`),
      update: (id) => r(`resolutions/vehicles/${id}`),
      delete: (id) => r(`resolutions/vehicles/${id}`)
    },

    vehicleTypes: {
      base: r('resolutions/vehicle-types'),
      create: r('resolutions/vehicle-types'),

      show: (id) => r(`resolutions/vehicle-types/${id}`),
      update: (id) => r(`resolutions/vehicle-types/${id}`),
      delete: (id) => r(`resolutions/vehicle-types/${id}`)
    },

    userDatabase: {
      base: r('resolutions/user-database'),
      create: r('resolutions/user-database'),

      show: (id) => r(`resolutions/user-database/${id}`),
      update: (id) => r(`resolutions/user-database/${id}`),
      delete: (id) => r(`resolutions/user-database/${id}`)
    },

    userTypes: {
      base: r('resolutions/user-types'),
      create: r('resolutions/user-types'),

      show: (id) => r(`resolutions/user-types/${id}`),
      update: (id) => r(`resolutions/user-types/${id}`),
      delete: (id) => r(`resolutions/user-types/${id}`)
    },

    userUsages: {
      base: r('resolutions/user-usages'),
      create: r('resolutions/user-usages'),

      show: (id) => r(`resolutions/user-usages/${id}`),
      update: (id) => r(`resolutions/user-usages/${id}`),
      delete: (id) => r(`resolutions/user-usages/${id}`)
    },

    userMultis: {
      base: r('resolutions/user-multis'),
      create: r('resolutions/user-multis'),

      show: (id) => r(`resolutions/user-multis/${id}`),
      update: (id) => r(`resolutions/user-multis/${id}`),
      delete: (id) => r(`resolutions/user-multis/${id}`)
    },

    receiptOfResources: {
      base: r('resolutions/receipt-of-resources'),
      create: r('resolutions/receipt-of-resources'),

      show: (id) => r(`resolutions/receipt-of-resources/${id}`),
      update: (id) => r(`resolutions/receipt-of-resources/${id}`),
      delete: (id) => r(`resolutions/receipt-of-resources/${id}`)
    },

    providerCollections: {
      base: r('resolutions/provider-collections'),
      lookup: r('resolutions/provider-collections/lookup'),
      lookupByNuap: (nuap) => r(`resolutions/provider-collections/lookup/${nuap}`),
      create: r('resolutions/provider-collections'),

      show: (id) => r(`resolutions/provider-collections/${id}`),
      update: (id) => r(`resolutions/provider-collections/${id}`),
      delete: (id) => r(`resolutions/provider-collections/${id}`)
    },

    dincBeneficiaries: {
      base: r('resolutions/dinc-beneficiaries'),
      create: r('resolutions/dinc-beneficiaries'),
      export: r('resolutions/dinc-beneficiaries/export'),

      show: (id) => r(`resolutions/dinc-beneficiaries/${id}`),
      update: (id) => r(`resolutions/dinc-beneficiaries/${id}`),
      delete: (id) => r(`resolutions/dinc-beneficiaries/${id}`)
    },

    subscribersAforo: {
      base: r('resolutions/subscribers-aforo'),
      create: r('resolutions/subscribers-aforo'),
      export: r('resolutions/subscribers-aforo/export'),

      show: (id) => r(`resolutions/subscribers-aforo/${id}`),
      update: (id) => r(`resolutions/subscribers-aforo/${id}`),
      delete: (id) => r(`resolutions/subscribers-aforo/${id}`),

      usersByMacroRoute: r('resolutions/subscribers-aforo/users/by-macroroute'),
      rnaNuapsByMacroRoute: r('resolutions/subscribers-aforo/rna-nuaps/by-macroroute')
    },

    subscriberAddressCodes: {
      base: r('resolutions/subscriber-address-codes'),
      create: r('resolutions/subscriber-address-codes'),

      show: (id) => r(`resolutions/subscriber-address-codes/${id}`),
      update: (id) => r(`resolutions/subscriber-address-codes/${id}`),
      delete: (id) => r(`resolutions/subscriber-address-codes/${id}`)
    },

    massBalances: {
      base: r('resolutions/mass-balances'),
      export: r('resolutions/mass-balances/export'),

      show: (id) => r(`resolutions/mass-balances/${id}`)
    },

    basculas: {
      base: r('resolutions/basculas'),
      create: r('resolutions/basculas'),

      show: (id) => r(`resolutions/basculas/${id}`),
      update: (id) => r(`resolutions/basculas/${id}`),
      delete: (id) => r(`resolutions/basculas/${id}`)
    },

    reports: {
      base: r('resolutions/reports'),
      create: r('resolutions/reports'),

      show: (id) => r(`resolutions/reports/${id}`),
      update: (id) => r(`resolutions/reports/${id}`),
      delete: (id) => r(`resolutions/reports/${id}`)
    }
  },

  traceability: {
    base: r('traceability'),
    create: r('traceability'),
    publish: (id) => r(`traceability/${id}/publish`),
    vehiclesByMacroRoute: r('traceability/vehicles-by-macroroute'),
    microRouteByMacroRoute: r('traceability/microRoute-by-macroroute'),

    show: (id) => r(`traceability/${id}`),
    update: (id) => r(`traceability/${id}`),
    delete: (id) => r(`traceability/${id}`),

    collection: { base: r('traceability/collection') },
    classification: { base: r('traceability/classification') },
    beneficiary: { base: r('traceability/beneficiary') },
    compactor: { base: r('traceability/compactor') }
  },

  inventory: {
    nusdes: r('inventory/nusdes'),

    materialCatalog: {
      base: r('inventory/material-catalog'),

      categories: r('inventory/material-catalog/categories'),
      paginateCategories: r('inventory/material-catalog/categories/paginate'),

      materials: r('inventory/material-catalog/materials'),
      paginateMaterials: r('inventory/material-catalog/materials/paginate'),

      products: r('inventory/material-catalog/products'),
      paginateProducts: r('inventory/material-catalog/products/paginate'),

      costs: r('inventory/material-catalog/costs'),
      paginateCosts: r('inventory/material-catalog/costs/paginate')
    }
  }
};
