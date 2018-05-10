<template>
  <div class="row sqs-row" style="border:1px solid black">
    <div class="col sqs-col-12 span-12" v-if="user">
      User: {{ user.username }} | # Videos: {{ user.n_count }} | # Fish: {{ user.sum_count }} <button @click="logout" style="float:right">Logout</button>
    </div>
    <div class="col sqs-col-12 span-12" v-else>
      <router-link to="/login?redirect=/video" class="router-link">Login</router-link> or <router-link to="/signup?redirect=/video" class="router-link">Sign Up</router-link> to track your progress!
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import logout from '@/mixins/logout';

export default {
  mixins: [logout],
  computed: {
    ...mapGetters({
      user: 'auth/user'
    })
  }
};
</script>

<style scoped>
a.router-link {
  text-decoration: underline;
}
</style>
