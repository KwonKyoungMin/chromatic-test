<template>
  <div class="progress-bar-wrapper" v-show="loading">
    <div class="progress-bar" :style="style">
      <div class="progress-bar-img">
        <img src="/assets/img/icon-loadingbar-statistic.svg" />
        <div class="bar" :style="{ 'height': barHeight }">
          <div class="bar-inner" :style="{ 'width': init_width, 'transition': innerTransition}"></div>
        </div>
        <div class="progress-bar-message">{{ message }}</div>
      </div>
    </div>
  </div>
</template>
<script>
import { reactive, computed } from 'vue';

export default {
  name: "ProgressBar",
  props: {
    init_abs: {
      type: Boolean,
      default: true
    },
    init_width: {
      type: [Number, String],
      default: "161px"
    },
    init_height: {
      type: [Number, String],
      default: "161px"
    },
    init_loading: {
      type: Boolean,
      default: false
    },
    init_message: {
      type: [Number, String],
      default: "loading"
    },
    init_barHeight: {
      type: [Number, String],
      default: "8px"
    },
    init_transition: {
      type: String,
      default: "all 10s"
    }
  },
  data() {
    return {
      innerWidth: "0%",
    }
  },

  setup(props) {
    props = reactive(props);

    const style = computed(() => ({
        width: props.init_width,
        height: props.init_height,
        position: props.init_abs ? "absolute" : "relative"
    }));


    return {
      style: style,
      abs: props.init_abs,
      width: props.init_width,
      height: props.init_height,
      loading: props.init_loading,
      message: props.init_message,
      barHeight: props.init_barHeight,
      innerTransition: props.init_transition
    }
  }

}
</script>


<style scoped>
.progress-bar-wrapper {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  position: absolute;
  background-color: rgba(255, 255, 255, 0.5);
}
.progress-bar {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
}
.progress-bar-img {
  width: 100%;
  text-align: center;
  margin-bottom: 25px;
}
.bar {
  width: 100%;
  border-radius: 8px;
  background-color: #d5d5e2;
}
.bar-inner {
  height: 100%;
  border-radius: 8px;
  animation-name: fill;
  background-image: linear-gradient(to right, #9b9bf9, #5455ff 100%);
}
.progress-bar-message {
  font-size: 12px !important;
  margin-top: 6px;
  color: #9191a0;
  font-weight: bold;
  text-align: center;
  letter-spacing: -0.03px;
}
</style>
