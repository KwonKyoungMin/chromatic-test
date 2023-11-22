import TextBox from "./TextBox.vue";

export default {
  title: 'Example/TextBox',
  component: TextBox,
  tag: ['autodocs'],
  argTypes: {
    backgroundColor: {
      control: 'color',
    },
    onClick: {},
    size: {
      control: {
        type: 'select',
      },
      options: ['small', 'medium', 'large'],
    },
  },
}

export const Primary = {
  args: {
    primary: true,
    text: 'TextBox-Primary',
  },
};

export const Secondary = {
  args: {
    text: 'TextBox-Secondary',
  },
};

export const Large = {
  args: {
    size: 'large',
    text: 'TextBox-Large',
  },
};

export const Small = {
  args: {
    size: 'small',
    text: 'TextBox-Small',
  },
};