<template>
  <div>
    <h2>Welcome to the video count application</h2>
    <p>Would you like to view the instructions or start counting?</p>
    <p>
      <router-link to="/instructions" tag="button">Read the Instructions</router-link>
      <router-link to="/video" tag="button">Start Counting!</router-link>
    </p>
  </div>
</template>

<script>
export default {
};
</script>

<style scoped>
</style>
