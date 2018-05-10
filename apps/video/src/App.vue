<template>
  <div>
    <div class="row sqs-row">
      <div class="col sqs-col-3 span-3">
        <div class="sqs-block code-block sqs-block-code">
          <div class="sqs-block-content">
            <nav class="folder-nav" role="navigation">
              <ul>
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
                <hr class="nav">
                <div class="sqs-block button-block sqs-block-button" style="padding-left:0">
                  <div class="sqs-block-content">
                    <div class="sqs-block-button-container--left">
                      <router-link
                        to="/video"
                        class="sqs-block-button-element--small sqs-block-button-element bg-teal">
                        <strong style="color:white">Watch A Video!</strong>
                      </router-link>
                    </div>
                  </div>
                </div>
                <hr class="nav">
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
                <router-link
                  v-if="!user"
                  tag="li"
                  to="/login"
                  exact-active-class="active-link"
                  class="page-collection">
                  <a>Login</a>
                </router-link>
                <router-link
                  v-if="!user"
                  tag="li"
                  to="/signup"
                  exact-active-class="active-link"
                  class="page-collection">
                  <a>Sign Up</a>
                </router-link>
                <li v-if="user" class="user-welcome">
                  <strong>Hello, {{ user.username }}!</strong>
                </li>
                <router-link
                  v-if="user"
                  tag="li"
                  to="/account"
                  exact-active-class="active-link"
                  class="page-collection">
                  <a>My Account</a>
                </router-link>
                <li class="page-collection" v-if="user">
                  <a href="#" v-on:click.stop="logout">Logout</a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
      <div class="col sqs-col-9 span-9">
        <div class="sqs-block code-block sqs-block-code">
          <div class="sqs-block-content">
            <router-view></router-view>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import queryString from 'query-string';
import { mapGetters } from 'vuex';
import logout from '@/mixins/logout';

// https://gist.github.com/jed/982883
const uuid = function b(a) {
  return a ? (a^Math.random()*16>>a/4) // eslint-disable-line
    .toString(16) : // eslint-disable-line
    ([1e7]+-1e3+ -4e3+ -8e3+ -1e11).replace(/[018]/g,b); // eslint-disable-line
};

export default {
  name: 'app',
  mixins: [logout],
  data() {
    return {
      // query: {
      //   data: {}
      // }
    };
  },
  computed: {
    ...mapGetters({
      session: 'session',
      user: 'auth/user'
    })
  },
  created() {
    console.log('app:created');

    this.$store.dispatch('setSessionId', uuid());

    // if (location.search) {
    //   const qry = queryString.parse(location.search);

    //   if (qry) {
    //     this.$set(this.query, 'data', qry);
    //   }
    // }
  },
  mounted() {
    console.log('app:mounted');
  }
};
</script>

<style scoped>
.user-welcome {
  color: #888888;
  font-size: 18px;
  font-family: "proxima-nova","Helvetica Neue",Helvetica,Arial,sans-serif;
  margin-bottom: 5px;
}
hr.nav {
  width: 160px;
  margin-left: 0px;
}
li.page-collection a {
  padding-bottom: 5px;
  padding-top: 5px;
}
</style>
