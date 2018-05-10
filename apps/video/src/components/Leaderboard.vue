<template>
  <div class="sqs-layout sqs-grid-12 columns-12">
    <div class="row sqs-row">
      <div class="col sqs-col-12 span-12">
        <div class="sqs-block html-block sqs-block-html">
          <div class="sqs-block-content">
            <h1>Leadboard</h1>
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
        <div class="row sqs-row" style="margin-top:10px">
          <div class="col sqs-col-1 span-1 table-col">
            <h3 class="header text-align-center">Rank</h3>
          </div>
          <div class="col sqs-col-3 span-3 table-col">
            <h3 class="header text-align-left">Username</h3>
          </div>
          <div class="col sqs-col-2 span-2 table-col">
            <h3 class="header text-align-center"># Videos</h3>
          </div>
          <div class="col sqs-col-2 span-2 table-col">
            <h3 class="header text-align-center"># Fish</h3>
          </div>
        </div>
        <div class="row sqs-row" v-for="(user, index) in users" :key="user.uid">
          <div class="col sqs-col-1 span-1 table-col text-align-center">
            <span class="table-cell">{{ index + 1 }}</span>
          </div>
          <div class="col sqs-col-3 span-3 table-col text-align-left">
            <span class="table-cell">{{ user.username }}</span>
          </div>
          <div class="col sqs-col-2 span-2 table-col text-align-center">
            <span class="table-cell">{{ user.n_count }}</span>
          </div>
          <div class="col sqs-col-2 span-2 table-col text-align-center">
            <span class="table-cell">{{ user.sum_count }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

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
  mounted() {
    this.$http.get('/leaderboard/')
      .then((response) => {
        this.users = response.data.data;
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
.table-col {
  margin-left: 5px;
  margin-right: 5px;
}
.table-cell {
  font-family: "proxima-nova","Helvetica Neue",Helvetica,Arial,sans-serif;
  font-weight: 400;
  font-size: 21px;
  letter-spacing: 0px;
  text-transform: none;
  font-style: normal;
}
</style>
