<template>
  <div class="sqs-layout sqs-grid-12 columns-12" data-type="page">
    <div class="row sqs-row">
      <div class="col sqs-col-12 span-12">
        <div class="sqs-block html-block sqs-block-html">
          <div class="sqs-block-content">
            <h1>Welcome to the Mystic River Herring Video Counter!</h1>
            <p>
              Help us track changes in <a href="/about/herring">river herring</a> populations over time by counting the number of fish passing through the fish ladder at Upper Mystic Lake dam located between Medford and Winchester, MA.</p><p>The videos are between 10 and 60 seconds long. Some videos show blue outlines when motion is detected, but some do not. Here are our <a href="https://www.mysticherring.org/video/status/">results</a> so far - but we need your help to continue this important conservation mission.</p><p>If you have not been to this site before, please take a moment to view the instructions and learn what to count and what not to count, which is important for us to collect accurate data. If you've already seen the instructions, then let's <a href="/video/watch">start counting</a>!
            </p>
          </div>
        </div>
        <div class="row sqs-row">
          <div class="col sqs-col-4 span-4">
            <div class="sqs-block button-block sqs-block-button">
              <div class="sqs-block-content">
                <div class="sqs-block-button-container--center">
                  <a
                    href="/video/instructions"
                    class="sqs-block-button-element--medium sqs-block-button-element">
                    View Instructions
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div class="col sqs-col-4 span-4">
            <div class="sqs-block button-block sqs-block-button">
              <div class="sqs-block-content">
                <div
                  class="sqs-block-button-container--center"
                  data-alignment="center"
                  data-button-size="medium">
                  <router-link
                    to="/video"
                    class="sqs-block-button-element--medium sqs-block-button-element">
                    I'm Ready To Count!
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>

</style>
