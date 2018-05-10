import Firebase from 'firebase';
import axios from 'axios';

export default {
  install: (Vue, { config, store }) => {
    const firebase = Firebase.initializeApp(config);
    const auth = firebase.auth();

    Vue.prototype.$auth = { // eslint-disable-line no-param-reassign
      getUser: () => auth.currentUser,
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
        .then(firebaseUser => axios.post('/users/', { uid: firebaseUser.uid, username }))
        .then(response => response.data.data[0])
        .then(user => store.dispatch('auth/setUser', user)),
      updateEmail: email => auth.currentUser.updateEmail(email),
      updatePassword: password => auth.currentUser.updatePassword(password),
      updateUsername: username => axios.put(`/users/${auth.currentUser.uid}`, { username })
        .then(response => store.dispatch('auth/setUser', response.data.data[0])),
      delete: () => {
        const uid = auth.currentUser.uid;
        return auth.currentUser.delete()
          .then(() => axios.delete(`/users/${uid}`));
      }
    };
    auth.onAuthStateChanged((user) => {
      if (!user) {
        store.dispatch('auth/clearUser');
      } else {
        axios.get(`/users/${user.uid}`)
          .then(response => store.dispatch('auth/setUser', response.data.data[0]))
          .then(() => store.dispatch('auth/initialized'));
      }
    });
  }
};
