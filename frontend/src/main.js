import { createApp, toHandlers } from "vue";
import App from './App.vue';

import './styles/main.scss';

const app = createApp(App)

app.mount("#app");