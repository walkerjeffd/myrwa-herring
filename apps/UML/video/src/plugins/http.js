import axios from 'axios';

export default {
  install: (Vue, config) => {
    axios.defaults.baseURL = config.baseURL;
    Vue.prototype.$http = axios; // eslint-disable-line no-param-reassign
  }
};
