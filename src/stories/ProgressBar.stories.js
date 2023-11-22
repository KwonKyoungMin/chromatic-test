import ProgressBar from "../components/ProgressBar.vue";

export default {
    title: "Example/ProgressBar",
    component: ProgressBar,
    tag: ['autodocs'],
    argTypes: {
    }
}

export const Statistic = {
    args: {
        init_abs: true,
        init_message: "통계 로딩중",
    }
}
