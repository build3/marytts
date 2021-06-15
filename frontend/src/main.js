import { createApp } from "vue";

import { library } from '@fortawesome/fontawesome-svg-core';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import App from './App.vue';
import store from './store';
import Tabs from './components/Tabs.vue';
import FromXml from './components/FromXml.vue';
import AudioButton from './components/AudioButton.vue';
import FromText from './components/FromText.vue';
import VoiceSelect from './components/VoiceSelect.vue';
import FromXmlFooter from './components/FromXmlFooter.vue';
import FromTextFooter from './components/FromTextFooter.vue';

import './assets/styles/main.scss';

library.add(faUpload);

const app = createApp(App);

app.component('mary-tabs', Tabs);
app.component('from-xml', FromXml);
app.component('audio-button', AudioButton);
app.component('from-text', FromText);
app.component('voice-select', VoiceSelect);
app.component('from-text-footer', FromTextFooter);
app.component('from-xml-footer', FromXmlFooter);

app.component('font-awesome-icon', FontAwesomeIcon);

app.use(store);
app.mount("#app");
