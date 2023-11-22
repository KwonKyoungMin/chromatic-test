<template>
  <div class="histogram-component">
    <span class="histogram-unit"></span>
    <svg class="histogram-graph"></svg>
    <ProgressBar
      init_message="로딩중"
      :init_loading="isLoading"
      :init_abs="true"
    />
  </div>
</template>

<script>
import $ from "jquery";
import * as d3 from "d3";
import ProgressBar from "@/components/ProgressBar";

export default {
  name: "Histogram",
  components: {
    ProgressBar
  },
  props: {
    histogramData: {
      type: Object,
      default: {
        max: 100,
        criteria: 2,
        histogram: [],
        p10: -1,
        p50: -1,
        p90: -1
      },
      required: true
    },
    xScaleMax: {
      type: Number,
      default: 100 + 1
    },
    unit: {
      type: String,
      default: "ms"
    }
  },
  data() {
    return {
      margin: { top: 40, right: 30, bottom: 30, left: 40 },
      isLoading: false,
      STROKE_SIZE: 2,
      RECT_COUNT: 49,
      select_pType: "",
      select_start_x: 0,
      select_end_x: 0,
      select_cells: [],
    }
  },
  methods: {
    clear() {
      $(this.$el).find("svg.histogram-graph *").remove();
    },
    drawAxis(svg, xScale, xAxis, yAxis, margin, labelCriteria) {
      const xAxisGroup = svg
          .append("g")
          .attr("class", "x-axis")
          .attr(
              "transform",
              `translate(0, ${yAxis.scale().range()[0] + margin.bottom / 4} )`
          )
          .call(xAxis)
          .selectAll("line")
          .remove();

      const yAxisGroup = svg
          .append("g")
          .attr("transform", `translate(${margin.left}, 0)`)
          .call(yAxis)
          .selectAll("line")
          .remove();

      // 구분선 (점선 stroke-dasharray)
      const guideGroup = svg.append("g");
      // x축-세로 구분선 (간격: 최대값/10)
      guideGroup
          .selectAll("line")
          .data(labelCriteria)
          .enter()
          .append("line")
          .attr("x1", (d) => xScale(d))
          .attr("x2", (d) => xScale(d))
          .attr("y1", yAxis.scale().range()[0])
          .attr("y2", yAxis.scale().range()[1])
          .attr("stroke", "#e4e4e4")
          .attr("stroke-dasharray", "2, 2");
      // y축-가로 구분선 (0)
      guideGroup
          .append("line")
          .attr("x1", xAxis.scale().range()[0])
          .attr("x2", xAxis.scale().range()[1] + margin.right)
          .attr("y1", yAxis.scale().range()[0])
          .attr("y2", yAxis.scale().range()[0])
          .attr("stroke", "#e4e4e4")
          .attr("stroke-dasharray", "2, 2");
      // y축-가로 구분선 (중간)
      guideGroup
          .append("line")
          .attr("x1", xAxis.scale().range()[0])
          .attr("x2", xAxis.scale().range()[1] + margin.right)
          .attr("y1", yAxis.scale().range()[0] / 2)
          .attr("y2", yAxis.scale().range()[0] / 2)
          .attr("stroke", "#e4e4e4")
          .attr("stroke-dasharray", "2, 2");
      // y축-가로 구분선 (y-max)
      guideGroup
          .append("line")
          .attr("x1", xAxis.scale().range()[0])
          .attr("x2", xAxis.scale().range()[1] + margin.right)
          .attr("y1", yAxis.scale().range()[1])
          .attr("y2", yAxis.scale().range()[1])
          .attr("stroke", "#e4e4e4")
          .attr("stroke-dasharray", "2, 2");
    },
    drawHistogram(histogramData) {
      const vm = this;
      const { criteria, histogram, p10, p50, p95 } = histogramData;
      const svg = d3.select(this.$el).select("svg.histogram");
      const width = $(svg[0]).width();
      const height = $(svg[0]).height();
      const margin = this.margin;
      const xScaleMax = this.xScaleMax;
      const RECT_COUNT = this.RECT_COUNT;
      const STROKE_SIZE = this.STROKE_SIZE;
      let label_criteria = [];

      const preXScale = d3.scale
          .linear()
          .domain([0, xScaleMax])
          .range([0, RECT_COUNT]);
      // x축 최대값 기준
      const xScale = d3.scale
          .linear()
          .domain([0, xScaleMax])
          .range([margin.left, width - margin.right]);
      // x축 표현 갯수 기준
      const xScale2 = d3.scale
          .linear()
          .domain([0, RECT_COUNT])
          .range([margin.left, width - margin.right]);
      const xAxis = d3.svg.axis().scale(xScale).tickSize(0);
      const rectWidth = xScale2(1) - xScale(0);

      // sampling
      const sampling_histogram = JSON.parse(JSON.stringify(histogram));
      sampling_histogram.forEach(h => {
        h.value = h.rate;
        h.rate = Math.floor(preXScale(h.rate));
      });
      for (let i = 0; i < sampling_histogram.length - 1; ++i) {
        if (sampling_histogram[i].rate === sampling_histogram[i + 1].rate) {
          sampling_histogram[i].count += sampling_histogram[i + 1].count;
          sampling_histogram.splice(i + 1, 1);
          --i;
        }
      }

      // x축 label (x축의 max를 10분할)
      for (let i = 1; i <= 10; i++) {
        label_criteria.push(((xScaleMax - 1) / 10) * i);
      }

      const yScaleMax =
          sampling_histogram.length === 0
              ? 100
              : Math.max.apply(
                  Math,
                  sampling_histogram.map((d) => d.count)
              );
      const yScale = d3.scale
          .linear()
          .domain([0, yScaleMax])
          .range([height - margin.bottom, margin.top]);
      const yScale2 = d3.scale
          .linear()
          .domain(yScale.domain())
          .range([0, height - margin.top - margin.bottom]);
      const yAxis = d3.svg
          .axis()
          .orient("left")
          .scale(yScale)
          .tickSize(0)
          .tickValues([0, yScale.domain()[1] / 2, yScale.domain()[1]]);

      // Set background color
      svg
          .append("rect")
          .attr("x", xAxis.scale().range()[0])
          .attr("y", yAxis.scale().range()[1])
          .attr(
              "width",
              xAxis.scale().range()[1] +
              margin.right -
              xAxis.scale().range()[0] +
              "px"
          )
          .attr(
              "height",
              yAxis.scale().range()[0] - yAxis.scale().range()[1] + "px"
          )
          .attr("fill", "#ffffff");

      // Draw cell
      this.drawAxis(svg, xScale, xAxis, yAxis, margin);

      const cells = svg
          .selectAll("rect.datas")
          .data(histogram)
          .enter()
          .append("rect")
          .attr("x", (d) => xScale(d.rate))
          .attr("y", (d) => margin.top + yScale2.range()[1] - yScale2(d.count))
          .attr("value", (d) => d.rate)
          .attr("data-index", function (d, index) {
            return index;
          })
          .attr("width", xScale(criteria) - xAxis.scale().range()[0])
          .attr("height", (d) => yScale2(d.count))
          .attr("fill", "#6B96FB");

      // daw axis - p0
      if (p10 > -1) {
        const p0_guide_hover = svg
            .append("rect")
            .attr("class", "hover_guide p0_guide")
            .attr("x", xAxis.scale().range()[0])
            .attr("y", margin.top)
            .attr("width", xScale(p50) - xAxis.scale().range()[0])
            .attr("height", height - margin.bottom - margin.top - STROKE_SIZE + 1)
            .style("fill", "#6B96FB")
            .style("fill-opacity", 0.2)
            .on("paint", () => {
              this.select_start_x = xAxis.scale().range()[0];
              this.select_end_x = xScale(p50);
            })
            .on("click", () => {
              this.select_pType = "p0";
              this.select_cells = [];
              this.select_start_x = xAxis.scale().range()[0];
              this.select_end_x = xScale(p50);
              d3.selectAll(".hover_guide").classed("active", false);
              p0_guide_hover.classed("active", true);
              this.$store.commit("statistics/setSelection", {
                pType: "p0"
              });

              selectCells(this.select_start_x, this.select_end_x);
            });
      }
      // draw axis - p50
      if (p50 !== p95 && p50 > -1) {
        // draw axis - p50 : hover
        const p50_guide_hover = svg
            .append("rect")
            .attr("class", "hover_guide p50_guide")
            .attr("x", xScale(p50))
            .attr("y", margin.top)
            .attr("width", xScale(p95) - xScale(p50))
            .attr("height", height - margin.bottom - margin.top - STROKE_SIZE + 1)
            .style("fill", "#6B96FB")
            .style("fill-opacity", 0.2)
            .on("resize", () => {
              this.select_start_x = xScale(p50);
              this.select_end_x = xScale(p95);
            })
            .on("click", () => {
              // 클릭시 p50
              this.select_pType = "p50";
              this.select_cells = [];
              this.select_start_x = xScale(p50);
              this.select_end_x = xScale(p95);
              d3.selectAll(".hover_guide").classed("active", false);
              p50_guide_hover.classed("active", true);
              vm.$EventBus.$emit("selectHistogram", {
                date_unix: vm.date_unix,
                hasData: vm.data.histogram.length > 0,
                pType: vm.select_pType
              });
              this.$store.commit("statistics/setSelection", {
                pType: "p50"
              });

              selectCells(this.select_start_x, this.select_end_x);
            });

        // draw axis - p50
        const p50_guide_line = svg
            .append("line")
            .attr("class", "default_guide")
            .classed("hover_guide", true)
            .attr("x1", xScale(p50))
            .attr("x2", xScale(p50))
            .attr("y1", margin.top)
            .attr("y2", height - margin.bottom)
            .attr("stroke", "#FFAE50")
            .attr("stroke-width", STROKE_SIZE);
        const p50_guide_txt = svg
            .append("text")
            .attr("class", "default_guide")
            .classed("hover_guide", true)
            .text("50%")
            .attr("stroke", "#FFAE50")
            .attr("text-anchor", "start")
            .attr("x", xScale(p50))
            .attr("y", margin.top - 5);
      }

      if (p95 > -1) {
        // draw axis - p95 : hover
        const p95_guide_hover = svg
            .append("rect")
            .attr("class", "hover_guide p95_guide")
            .attr("x", xScale(p95))
            .attr("y", margin.top)
            .attr("width", width - xScale(p95) - STROKE_SIZE)
            .attr("height", height - margin.bottom - margin.top - STROKE_SIZE + 1)
            .style("fill", "#6B96FB")
            .style("fill-opacity", 0.2)
            .on("click", () => {
              this.select_pType = "p95";
              this.select_cells = [];
              this.select_start_x = xScale(p95);
              this.select_end_x = width;
              d3.selectAll(".hover_guide").classed("active", false);
              p95_guide_hover.classed("active", true);
              vm.$EventBus.$emit("selectHistogram", {
                date_unix: vm.date_unix,
                hasData: vm.data.histogram.length > 0,
                pType: vm.select_pType
              });
              this.$store.commit("statistics/setSelection", {
                pType: "p95"
              });

              selectCells(this.select_start_x, this.select_end_x);
            });

        // draw axis - p95
        const p95_guide_line = svg
            .append("line")
            .attr("class", "default_guide")
            .classed("hover_guide", true)
            .attr("x1", xScale(p95))
            .attr("x2", xScale(p95))
            .attr("y1", margin.top)
            .attr("y2", height - margin.bottom)
            .attr("stroke", "#CE2C2C")
            .attr("stroke-width", STROKE_SIZE);
        const p95_guide_txt = svg
            .append("text")
            .attr("class", "default_guide")
            .classed("hover_guide", true)
            .text("95%")
            .attr("stroke", "#CE2C2C")
            .attr("text-anchor", "start")
            .attr("x", xScale(p95))
            .attr("y", margin.top - 5);
      }

      // resize 일때 가이드 값있으면 계속 active 유지
      if (this.select_pType) {
        d3.selectAll(`.${this.select_pType}_guide`).classed("active", true);
      }

      function selectCells(start_x, end_x) {
        cells[0].forEach((cell) => {
          $(cell).removeClass("selected");
          const cell_x = parseFloat($(cell).attr("x")) + rectWidth / 2;
          if (start_x <= cell_x && end_x >= cell_x) {
            $(cell).addClass("selected");
          }
        });
      }

      this.isLoading = false;
    },
    handleResize() {
      this.clear();
      this.drawHistogram(this.histogramData)
    }
  }
}
</script>
