import { createApp } from "vue";
import App from './App.vue';
import store from './store';
import Tabs from './components/Tabs.vue';

import './assets/styles/main.scss';

const app = createApp(App);

app.component('mary-tabs', Tabs);

app.use(store);
app.mount("#app");
