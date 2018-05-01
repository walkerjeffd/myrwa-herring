<template>
  <div>
    <h1>Leaderboard</h1>
    <ul>
      <li v-for="user in users" :key="user.uid">
        {{ user.username }} - {{ user.count }} videos -
        {{ user.duration }} seconds of video - {{ user.total }} fish
      </li>
    </ul>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Leaderboard',
  data() {
    return {
      users: []
    };
  },
  mounted() {
    axios.get('/leaderboard/')
      .then((response) => {
        console.log(response.data);
        this.users = response.data.data;
      })
      .catch((err) => {
        console.log(err);
      });
  },
  methods: {}
};
</script>

<style>
</style>
