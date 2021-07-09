import { inject, reactive } from 'vue'

const storeInjectionKey = Symbol('STORE_INJECTION_KEY')

export function createStore({ state, actions, getters }) {
  return {
    install(app) {
      const store = reactive(state())

      Object.entries(actions).forEach(([actionKey, action]) => {
        Object.defineProperty(store, actionKey, {
          value: action.bind(store),
          writable: false,
          enumerable: true,
          configurable: false,
        })
      })

      Object.entries(getters).forEach(([getterKey, getter]) => {
        Object.defineProperty(store, getterKey, {
          get: getter.bind(store),
          enumerable: true,
          configurable: false,
        })
      })

      app.provide(storeInjectionKey, Object.seal(store))
    },
  }
}

export function useStore() {
  return inject(storeInjectionKey)
}
