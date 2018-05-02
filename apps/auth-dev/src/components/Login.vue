<template>
  <div>
    <h3>Log In</h3>
    <form>
      <input type="text" placeholder="Email" v-model="email"><br>
      <input type="password" placeholder="Password" v-model="password"><br>
      <input type="submit" @click="login" value="Log In">
    </form>
    <p v-if="error">{{ error }}</p>
    <p>You don't have an account? You can <router-link to="/sign-up">create one</router-link>.</p>
    <p>
      Forgot you're password? Request a <router-link to="/password-reset">password
      reset</router-link>.
    </p>
  </div>
</template>

<script>
export default {
  name: 'login',
  data() {
    return {
      email: '',
      password: '',
      error: null
    };
  },
  methods: {
    login() {
      this.$auth.login(this.email, this.password)
        .then(() => {
          const next = this.$route.query.redirect || { name: 'home' };
          console.log('redirecting to', next);
          this.$router.push(next);
        })
        .catch((err) => {
          this.error = err.message || 'Unknown error occurred.';
        });
    }
  }
};
</script>

<style>
</style>
