<template>
  <div>
    <h2>Instructions</h2>
    <ul>
      <li>Do not count fish that you can see at the start of the video. Only count fish that enter from the right side</li>
      <li>If a fish swims backwards and leaves the right side of the video, subtract it from the total count</li>
      <li>When you are done watching, click Enter Your Count</li>
      <li>Even if you didn't see any fish, submit a count of 0, that's still useful data!</li>
    </ul>
    <p>
      <router-link to="/video" tag="button">Let's go count fish!</router-link>
    </p>
  </div>
</template>

<script>
export default {
};
</script>

<style scoped>
</style>
