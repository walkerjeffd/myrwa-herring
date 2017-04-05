<template>
  <div class="donut-chart">
  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  name: 'donut-chart',
  props: ['value', 'radius', 'color'],
  watch: {
    value: function () {
      console.log('donut:watch value', this.value);
      var vm = this,
          r = this.radius,
          value = this.value;

      var arc = d3.arc()
          .padRadius(50);

      var pie = d3.pie()
          .sort(null)
          .padAngle(0.01)
          .value(function(d) { return d; });

      this.svg.selectAll('.arc')
          .data(function(d) { return pie([value, 1-value]); })
        .enter().append('path')
          .attr('class', 'arc')
          .attr('d', arc.outerRadius(r).innerRadius(r * 0.5))
          .style('fill', function (d, i) { return vm.colorScale(i); });
    }
  },
  mounted () {
    console.log('donut:mounted');

    var r = this.radius;

    this.colorScale = d3.scaleOrdinal()
      .range([this.color, "rgb(200, 200, 200)"]);

    this.svg = d3.select(this.$el)
      .append('svg')
        .attr('width', r * 2)
        .attr('height', r * 2)
      .append('g')
        .attr('transform', 'translate(' + r + ',' + r + ')');
  }
}
</script>

<style scoped>
.donut-chart {
  display: inline;
  padding: 20px;
}
</style>
