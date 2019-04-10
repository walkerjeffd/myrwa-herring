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
      signUp: (email, password, username) => axios.get(`/username-available/?username=${username}`)
        .then((response) => {
          console.log('response', response);
          if (response.data.status === 'ok' && !response.data.data.available) {
            return Promise.reject({
              code: 'auth/username-already-in-use',
              message: 'Username already in use by another account.'
            });
          }
          return response;
        })
        .then(() => auth.createUserWithEmailAndPassword(email, password))
        .then((firebaseUser) => {
          console.log(firebaseUser.user.uid);
          return axios.post('/users/', { uid: firebaseUser.user.uid, username });
        })
        .then(response => response.data.data[0])
        .then(user => axios.get(`/users/${user.uid}`, { params: { location_id: store.getters.locationId } })
          .then(response => store.dispatch('auth/setUser', response.data.data[0]))
        ),
      updateEmail: email => auth.currentUser.updateEmail(email),
      updatePassword: password => auth.currentUser.updatePassword(password),
      updateUsername: username => axios.get(`/username-available/?username=${username}`)
        .then((response) => {
          console.log('response', response);
          if (response.data.status === 'ok' && !response.data.data.available) {
            return Promise.reject({
              code: 'auth/username-already-in-use',
              message: 'Username already in use by another account.'
            });
          }
          return response;
        })
        .then(() => axios.put(`/users/${auth.currentUser.uid}`, { username }))
        .then(() => axios.get(`/users/${auth.currentUser.uid}`, { params: { location_id: store.getters.locationId } }))
        .then(response => store.dispatch('auth/setUser', response.data.data[0])),
      delete: () => {
        const uid = auth.currentUser.uid;
        return auth.currentUser.delete()
          .then(() => axios.delete(`/users/${uid}`));
      },
      passwordReset: email => auth.sendPasswordResetEmail(email),
      refreshUser: () => {
        const user = auth.currentUser;
        if (user) {
          axios.get(`/users/${user.uid}`, { params: { location_id: store.getters.locationId } })
            .then(response => store.dispatch('auth/setUser', response.data.data[0]));
        }
      }
    };
    auth.onAuthStateChanged((user) => {
      if (!user) {
        store.dispatch('auth/clearUser');
      } else {
        console.log('onAuthStateChanged', user);
        axios.get(`/users/${user.uid}`, { params: { location_id: store.getters.locationId } })
          .then(response => store.dispatch('auth/setUser', response.data.data[0]))
          .then(() => store.dispatch('auth/initialized'));
      }
    });
  }
};
