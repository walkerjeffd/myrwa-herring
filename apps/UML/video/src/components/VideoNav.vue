<template>
  <div class="sqs-block code-block sqs-block-code">
    <div class="sqs-block-content">
      <nav class="folder-nav" role="navigation">
        <ul>
          <div class="sqs-block button-block sqs-block-button" style="padding-left:0">
            <div class="sqs-block-content">
              <div class="sqs-block-button-container--left">
                <router-link
                  to="/video"
                  class="sqs-block-button-element--small sqs-block-button-element">
                  <strong>Start Counting!</strong>
                </router-link>
              </div>
            </div>
          </div>
          <router-link
            tag="li"
            to="/"
            exact-active-class="active-link"
            class="page-collection">
            <a>Welcome</a>
          </router-link>
          <router-link
            tag="li"
            to="/instructions"
            exact-active-class="active-link"
            class="page-collection">
            <a>Instructions</a>
          </router-link>
          <router-link
            tag="li"
            to="/data"
            exact-active-class="active-link"
            class="page-collection">
            <a>Current Data</a>
          </router-link>
          <router-link
            tag="li"
            to="/leaderboard"
            exact-active-class="active-link"
            class="page-collection">
            <a>Leaderboard</a>
          </router-link>
          <hr class="nav">
          <div v-if="!user">
            <router-link
              tag="li"
              to="/login"
              key="login"
              exact-active-class="active-link"
              class="page-collection">
              <a>Login</a>
            </router-link>
            <router-link
              tag="li"
              to="/signup"
              key="signup"
              exact-active-class="active-link"
              class="page-collection">
              <a>Sign Up</a>
            </router-link>
          </div>
          <div v-if="user">
            <li class="user-welcome">
              <strong>Hello, {{ user.username }}!</strong>
            </li>
            <li class="user-stats-container">
              <div class="user-stats-header">Your Stats</div>
              <span v-if="user.n_count > 0">Rank: <span class="user-stats-value">{{ user.rank | number }}</span><br></span>
              # Videos: <span class="user-stats-value">{{ user.n_count | number }}</span><br>
              # Fish: <span class="user-stats-value">{{ user.sum_count | number }}</span>
            </li>
            <router-link
              tag="li"
              to="/account"
              key="account"
              exact-active-class="active-link"
              class="page-collection">
              <a>My Account</a>
            </router-link>
            <li class="page-collection">
              <a href="#" v-on:click.stop="logout">Logout</a>
            </li>
          </div>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import logout from '@/mixins/logout';
import { number } from '@/filters';

export default {
  mixins: [logout],
  computed: {
    ...mapGetters({
      session: 'session',
      user: 'auth/user'
    })
  },
  filters: {
    number
  }
};
</script>

<style scoped>
.user-welcome {
  color: #888888;
  font-size: 18px;
  font-family: "proxima-nova","Helvetica Neue",Helvetica,Arial,sans-serif;
  margin-bottom: 5px;
  line-height: 1.2em;
}
.user-stats-container {
  color: #888888;
  font-size: 14px;
  font-family: "proxima-nova","Helvetica Neue",Helvetica,Arial,sans-serif;
  line-height: 1.4em;
  margin-bottom: 5px;
  width: 120px;
  padding-left: 10px;
  border-left: 1px solid #AAA;
}
.user-stats-header {
  font-weight: 600;
  padding-bottom: 5px;
}
.user-stats-value {
  float:right ;
}
hr.nav {
  width: 170px;
  display: block;
  height: 1px;
  border: 0;
  border-top: 1px solid #AAA;
  margin: 0.8em 0;
  padding: 0;
}
li.page-collection a {
  padding-bottom: 5px;
  padding-top: 5px;
}
</style>
