import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import jStat from 'jStat';
import auth from './auth';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    auth
  },
  state: {
    session: {
      id: null,
      count: 0,
      total: 0,
      lastCount: null
    },
    video: null,
    run: null
  },
  getters: {
    session: state => state.session,
    video: state => state.video,
    run: state => state.run
  },
  mutations: {
    setSessionId(state, id) {
      state.session.id = id;
    },
    setVideo(state, video) {
      state.video = video;
    },
    setRun(state, run) {
      state.run = run;
    },
    incrementSessionCount(state) {
      state.session.count = state.session.count + 1; // eslint-disable-line operator-assignment
    },
    incrementSessionTotal(state, count) {
      state.session.total = state.session.total + count; // eslint-disable-line operator-assignment
    },
    setSessionLastCount(state, count) {
      state.session.lastCount = count;
    }
  },
  actions: {
    setSessionId({ commit }, id) {
      commit('setSessionId', id);
    },
    updateSession({ commit }, count) {
      commit('incrementSessionCount');
      commit('incrementSessionTotal', count);
      commit('setSessionLastCount', count);
    },
    fetchVideo({ commit }) {
      console.log('store:fetchVideo');
      return axios.get('/video/')
        .then((response) => {
          const videos = response.data.data;

          if (!videos || videos.length === 0) {
            return Promise.reject({
              code: 'video/video-not-found',
              message: 'Did not receive a video'
            });
          }
          const video = videos[0];
          console.log('store:fetchVideo done', video);

          return commit('setVideo', video);
        });
    },
    fetchRun({ commit }) {
      return axios.get('/run-estimate/?start=2018-04-27&end=2018-07-01')
        .then((response) => {
          const data = response.data.data;

          const total = data.reduce((p, v) => {
            p.y += v.y;           // eslint-disable-line
            p.var_y += v.var_y;   // eslint-disable-line
            p.df_num += v.df_num; // eslint-disable-line
            p.df_den += v.df_den; // eslint-disable-line
            return p;
          }, { y: 0, var_y: 0, df_num: 0, df_den: 0 });


          const df = Math.round((total.df_num * total.df_num) / total.df_den);
          const tStar = jStat.studentt.inv(0.975, df);
          const range = tStar * Math.sqrt(total.var_y);
          return commit('setRun', {
            total: {
              y: Math.round(total.y),
              range: Math.round(range)
            }
          });
        });
    }
  }
});
