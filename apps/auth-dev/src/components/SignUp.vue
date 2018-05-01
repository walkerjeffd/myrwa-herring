<template>
  <div>
    <h3>Sign Up</h3>
    <form>
      <input type="text" placeholder="Username" v-model="username"><br>
      <input type="text" placeholder="Email" v-model="email"><br>
      <input type="password" placeholder="Password" v-model="password"><br>
      <input type="submit" @click="signUp" value="Sign Up">
    </form>
    <p>
      Already have an account? You can <router-link to="/login">log in</router-link> instead.
    </p>
    <p v-if="error" style="color:red">{{ error }}</p>
  </div>
</template>

<script>
export default {
  name: 'signUp',
  data() {
    return {
      email: '',
      password: '',
      username: '',
      error: ''
    };
  },
  methods: {
    signUp() {
      this.$auth.signUp(this.email, this.password, this.username)
        .then(() => this.$router.replace('account'))
        .catch((err) => {
          if (err.message) {
            this.error = err.message;
          } else {
            this.error = 'Unknown Error Occurred';
          }
          console.log('Sign up failed');
          console.log(err.code, err.message);
        });
    }
  }
};
</script>

<style>
</style>
