import Firebase from 'firebase';
import axios from 'axios';
import store from '../store';

const config = {
  apiKey: 'AIzaSyDmkeOobOcEoCVBmfKN1L0I6TwtqJKxubo',
  authDomain: 'myrwa-herring.firebaseapp.com',
  databaseURL: 'https://myrwa-herring.firebaseio.com',
  projectId: 'myrwa-herring',
  storageBucket: '',
  messagingSenderId: '495815166483'
};

export default {
  install: (Vue) => {
    const firebase = Firebase.initializeApp(config);
    const auth = firebase.auth();
    Vue.prototype.$auth = { // eslint-disable-line no-param-reassign
      login: (email, password) => auth.signInWithEmailAndPassword(email, password),
      logout: () => auth.signOut(),
      signUp: (email, password, username) => axios.get(`/users/?username=${username}`)
        .then((response) => {
          if (response.data.status === 'ok' && response.data.data.length > 0) {
            return Promise.reject({
              code: 'auth/username-already-in-use',
              message: 'Username already in use by another account.'
            });
          }
          return response;
        })
        .then(() => auth.createUserWithEmailAndPassword(email, password))
        .then(user => axios.post('/users/', { uid: user.uid, username }))
        .then(response => store.dispatch('updateUsername', response.data.data[0].username)),
      updateEmail: email => auth.currentUser.updateEmail(email),
      updatePassword: password => auth.currentUser.updatePassword(password),
      updateUsername: username => axios.put(`/users/${auth.currentUser.uid}`, { username })
        .then(response => store.dispatch('updateUsername', response.data.data[0].username)),
      delete: () => {
        const uid = auth.currentUser.uid;
        return auth.currentUser.delete()
          .then(() => axios.delete(`/users/${uid}`));
      }
    };
    auth.onAuthStateChanged((user) => {
      store.dispatch('setReady', true);
      store.dispatch('updateUser', user);
    });
  }
};
