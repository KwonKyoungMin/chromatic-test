<template>
  <div :class="classes" @click="onClick" :style="style">{{ text }}</div>
</template>

<script>
import './textbox.css';
import { reactive, computed } from 'vue';

export default {
  name: 'textbox',

  props: {
    text: {
      type: String,
      required: true,
    },
    primary: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String,
      validator: function (value) {
        return ['small', 'medium', 'large'].indexOf(value) !== -1;
      },
    },
    backgroundColor: {
      type: String,
    },
  },

  emits: ['click'],

  setup(props, { emit }) {
    props = reactive(props);
    return {
      classes: computed(() => ({
        'textbox': true,
        'textbox--primary': props.primary,
        'textbox--secondary': !props.primary,
        [`textbox--${props.size || 'medium'}`]: true,
      })),
      style: computed(() => ({
        backgroundColor: props.backgroundColor,
      })),
      onClick() {
        emit('click');
      },
    };
  },
};
</script>
