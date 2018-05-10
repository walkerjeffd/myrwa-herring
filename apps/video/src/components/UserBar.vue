<template>
  <div class="row sqs-row" style="border:1px solid black">
    <div class="col sqs-col-12 span-12" v-if="user">
      User: {{ user.username }} | <button @click="logout">Logout</button>
    </div>
    <div class="col sqs-col-12 span-12" v-else>
      <a href="#">Login</a> or <a href="#">Sign Up</a> to track your progress!
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
</style>
