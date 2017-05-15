<template>
  <div style="text-align:center">
    <p>Thanks! You're count has been received.</p>
    <p>What would you like to do next?</p>
    <div class="sqs-block button-block sqs-block-button" data-block-type="53">
      <div class="sqs-block-content">
        <div class="sqs-block-button-container--center">
          <a class="sqs-block-button-element--medium sqs-block-button-element" @click="restart()">Watch Another</a>
          <a href="/video/status" class="sqs-block-button-element--medium sqs-block-button-element">View Count Status</a>
        </div>
      </div>
    </div>
    <p>Share your count with friends and family!</p>
    <social-sharing url="https://mysticherring.org/"
                    :title="title"
                    description="Help document the Mystic River herring migration in Medford and Winchester, MA and learn more about this amazing wildlife migration."
                    hashtags="mysticriver,citizenscience"
                    twitter-user="MysticMyRWA"
                    inline-template>
      <div class="network-icons">
          <network network="facebook">
            <icon name="facebook-square" scale="4"></icon>
          </network>
          <network network="twitter">
            <icon name="twitter-square" scale="4"></icon>
          </network>
          <network network="googleplus">
            <icon name="google-plus-square" scale="4"></icon>
          </network>
      </div>
    </social-sharing>
  </div>
</template>

<script>
export default {
  props: ['session'],
  computed: {
    title: function () {
      return 'I just counted ' + this.session.total + ' river herring migrating up the Mystic River!'
    }
  },
  methods: {
    restart: function () {
      this.$router.push('/');
    }
  }
};
</script>

<style>
p {
  font-size:1.2em
}

.network-icons {
  color: #888;
}

.fa-icon {
  margin-left: 10px !important;
  margin-right: 10px !important;
}
.fa-icon:hover {
  color: #222;
  cursor: pointer;
}
</style>
