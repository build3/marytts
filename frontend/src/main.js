import { createApp } from "vue";
import App from './App.vue';
import store from './store';
import Tabs from './components/Tabs.vue';
import FromXml from './components/FromXml.vue';

import './assets/styles/main.scss';

const app = createApp(App);

app.component('mary-tabs', Tabs);
app.component('from-xml', FromXml);

app.use(store);
app.mount("#app");
