export default {
  namespaced: true,
  state: {
    initialized: false,
    user: null
  },
  getters: {
    user: state => state.user
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
    },
    clearUser(state) {
      state.user = null;
    },
    setInitialized(state) {
      state.initialized = true;
    }
  },
  actions: {
    setUser: ({ commit }, user) => {
      commit('setUser', user);
    },
    clearUser: ({ commit }) => {
      commit('clearUser');
    },
    initialized: ({ commit }) => {
      commit('setInitialized', true);
    }
  }
};
