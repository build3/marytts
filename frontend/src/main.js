import { createApp } from "vue";

import { library } from '@fortawesome/fontawesome-svg-core';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import App from './App.vue';
import store from './store';
import Tabs from './components/Tabs.vue';
import FromXml from './components/FromXml.vue';
import GenerateButton from './components/GenerateButton.vue';
import FromText from './components/FromText.vue';

import './assets/styles/main.scss';

library.add(faUpload);

const app = createApp(App);

app.component('mary-tabs', Tabs);
app.component('from-xml', FromXml);
app.component('audio-button', GenerateButton);
app.component('from-text', FromText);

app.component('font-awesome-icon', FontAwesomeIcon);

app.use(store);
app.mount("#app");
