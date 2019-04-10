<template>
  <div style="text-align:center">
    <h2>{{message}}</h2>
    <p>
      Each count brings us one step closer to knowing how many herring migrated up the Mystic River
      this year.
    </p>
    <div class="sqs-block button-block sqs-block-button" data-block-type="53">
      <div class="sqs-block-content">
        <div class="sqs-block-button-container--center">
          <router-link
            to="/video"
            class="sqs-block-button-element--medium sqs-block-button-element">
            <a>Let's watch another!</a>
          </router-link>
        </div>
      </div>
    </div>
    <p>Share your count with friends and family!</p>
    <!-- <social-sharing
      url="https://mysticherring.org/"
      :title="title"
      description="Help document the Mystic River herring migration in Medford and Winchester, MA
 and learn more about this amazing wildlife migration."
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
    </social-sharing> -->
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

const messages = [
  'Great job!',
  'Thank you!',
  'Nice work!',
  'Bravo!',
  'Well done!',
  'Excellent!',
  'Fantastic!',
  'Way to go!'
];

export default {
  computed: {
    ...mapGetters({
      user: 'auth/user',
      session: 'session'
    }),
    title() {
      return `I just counted ${this.session.total} river herring migrating up the Plymouth River!`;
    },
    message() {
      let message;
      if (this.session.lastCount === 0) {
        message = 'No fish in that one? Thanks for letting us know!';
      } else {
        message = messages[Math.floor(Math.random() * messages.length)];
      }
      return message;
    }
  }
};
</script>

<style scoped>
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
