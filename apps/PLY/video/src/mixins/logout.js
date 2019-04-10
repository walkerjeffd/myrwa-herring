export default {
  methods: {
    logout() {
      console.log('logout mixin');
      this.$auth.logout()
        .then(() => this.$router.replace('logout'));
    }
  }
};
