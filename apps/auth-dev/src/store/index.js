import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex);

// https://gist.github.com/jed/982883
const uuid = function b(a){return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b)}; // eslint-disable-line

const initialState = {
  ready: false,
  user: null,
  username: null,
  session: {
    id: uuid(),
    counts: 0,
    total: 0
  },
  video: undefined
};

const getters = {
  ready: state => state.ready,
  user: state => state.user,
  username: state => state.username,
  sessionId: state => state.sessionId,
  video: state => state.video
};

const mutations = {
  setReady(state, ready) {
    Vue.set(state, 'ready', ready);
  },
  setUser(state, user) {
    Vue.set(state, 'user', user);
  },
  setUsername(state, username) {
    Vue.set(state, 'username', username);
  },
  setVideo(state, video) {
    Vue.set(state, 'video', video);
  },
  incrementSessionCounts(state) {
    state.session.counts += 1;
  },
  incrementSessionTotal(state, count) {
    state.session.total += count;
  }
};

const actions = {
  setReady: ({ commit }, ready) => {
    commit('setReady', ready);
  },
  updateUser: ({ commit }, user) => { // eslint-disable-line consistent-return
    if (user) {
      commit('setUser', user);
      return axios.get(`/users/${user.uid}`)
        .then((response) => {
          if (response.data.status === 'ok' && response.data.data.length > 0) {
            commit('setUsername', response.data.data[0].username);
          }
        });
    }
    commit('setUser', user);
    commit('setUsername', '');
  },
  updateUsername: ({ commit }, username) => {
    commit('setUsername', username);
  },
  getVideo: ({ commit }) => {
    console.log('actions:getVideo');
    axios.get('/video/')
      .then((response) => {
        const videos = response.data.data;

        if (videos && videos.length > 0) {
          commit('setVideo', videos[0]);
        }
      });
  },
  incrementSessionCounts: ({ commit }) => {
    commit('incrementSessionCounts');
  },
  incrementSessionTotal: ({ commit }, count) => {
    commit('incrementSessionTotal', count);
  }
};

export default new Vuex.Store({
  state: initialState,
  mutations,
  actions,
  getters
});
