/**
 * Simple Event Bus implementation without external dependencies
 * Provides event emission and listening for cross-component communication
 */

class EventBus {
  constructor() {
    this.events = {}
  }

  emit(event, data) {
    if (import.meta.env.DEV) {
      console.log(`[EventBus] 📡 Emitting: ${event}`, data)
    }
    if (!this.events[event]) return
    this.events[event].forEach(callback => callback(data))
  }

  on(event, callback) {
    if (import.meta.env.DEV) {
      console.log(`[EventBus] 👂 Listening to: ${event}`)
    }
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
  }

  off(event, callback) {
    if (import.meta.env.DEV) {
      console.log(`[EventBus] 🔇 Stopped listening to: ${event}`)
    }
    if (!this.events[event]) return
    this.events[event] = this.events[event].filter(cb => cb !== callback)
  }

  once(event, callback) {
    const wrappedCallback = (data) => {
      callback(data)
      this.off(event, wrappedCallback)
    }
    this.on(event, wrappedCallback)
  }
}

// Create singleton instance
const eventBus = new EventBus()

// Define all application events
export const EVENTS = {
  // Category events
  CATEGORY_CREATED: 'category:created',
  CATEGORY_UPDATED: 'category:updated',
  CATEGORY_DELETED: 'category:deleted',
  CATEGORY_BATCH_UPDATED: 'category:batch-updated',

  // Material events
  MATERIAL_CREATED: 'material:created',
  MATERIAL_UPDATED: 'material:updated',
  MATERIAL_DELETED: 'material:deleted',

  // Product events
  PRODUCT_CREATED: 'product:created',
  PRODUCT_UPDATED: 'product:updated',
  PRODUCT_DELETED: 'product:deleted',

  // Cost events
  COST_CREATED: 'cost:created',
  COST_UPDATED: 'cost:updated',
  COST_DELETED: 'cost:deleted',

  // User & Profile events
  USER_AVATAR_UPDATED: 'user:avatar-updated',
  USER_PROFILE_UPDATED: 'user:profile-updated',

  // Generic events
  DATA_REFRESH_NEEDED: 'data:refresh-needed',
  CACHE_INVALIDATE: 'cache:invalidate',
}

export function useEventBus() {
  return {
    emit: (event, data) => eventBus.emit(event, data),
    on: (event, callback) => eventBus.on(event, callback),
    off: (event, callback) => eventBus.off(event, callback),
    once: (event, callback) => eventBus.once(event, callback),
    EVENTS,
  }
}
