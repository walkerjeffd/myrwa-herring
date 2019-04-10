<template>
  <div class="sqs-layout sqs-grid-12 columns-12">
    <div class="row sqs-row">
      <div class="col sqs-col-12 span-12">
        <div class="sqs-block html-block sqs-block-html">
          <div class="sqs-block-content">
            <h1>Leaderboard</h1>
            <p>
              The Leaderboard shows the top 20 users who have watched the most videos. Want to get
              on the leaderboard? <span v-if="!user"><router-link to="/signup">Sign up for an
              account</router-link> or <router-link to="/login">log in</router-link> and then
              <router-link to="/video">start counting</router-link>!</span><span v-else>Go
              <router-link to="/video">count some videos</router-link>!</span>
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="sqs-block html-block sqs-block-html">
      <div class="sqs-block-content">
        <table class="lb-table">
          <thead class="lb-header">
            <tr>
              <th class="text-align-center" style="width:20%"><h3>Rank</h3></th>
              <th class="text-align-left" style="width:40%;text-align:left;"><h3>Username</h3></th>
              <th class="text-align-center" style="width:20%"><h3># Videos</h3></th>
              <th class="text-align-center" style="width:20%"><h3># Fish</h3></th>
            </tr>
          </thead>
          <tbody class="lb-row">
            <tr v-for="user in users.slice(0, 20)" :key="user.uid">
              <td class="text-align-center">{{ user.rank }}</td>
              <td class="text-align-left">{{ user.username }}</td>
              <td class="text-align-center">{{ user.n_count | number }}</td>
              <td class="text-align-center">{{ user.sum_count | number }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import { number } from '@/filters';

export default {
  name: 'leaderboard',
  data() {
    return {
      users: []
    };
  },
  computed: {
    ...mapGetters({ user: 'auth/user' })
  },
  filters: {
    number
  },
  mounted() {
    this.$http.get('/users/')
      .then((response) => {
        this.users = response.data.data.filter(d => (d.n_count > 0)).filter(d => (d.rank <= 20));
      })
      .catch((err) => {
        console.log(err);
      });
  },
  methods: {}
};
</script>

<style scoped>
.header {
  border-bottom: 1px solid #888;
}
.lb-table {
  width: 100%;
  table-layout: fixed;
}
.lb-header {
  font-family: "proxima-nova","Helvetica Neue",Helvetica,Arial,sans-serif;
  font-weight: 400;
  font-size: 21px;
  letter-spacing: 0px;
  text-transform: none;
  font-style: normal;
  line-height: 1.2em;
  border-bottom: 1px solid #888;
}
.lb-row {
  font-family: "proxima-nova","Helvetica Neue",Helvetica,Arial,sans-serif;
  font-weight: 400;
  font-size: 21px;
  letter-spacing: 0px;
  text-transform: none;
  font-style: normal;
}
</style>
