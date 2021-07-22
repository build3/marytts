/* eslint-disable import/no-extraneous-dependencies */

import { createApp } from 'vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faUpload } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import App from './App.vue'
import Tabs from './components/Tabs.vue'
import FromXml from './components/FromXml.vue'
import AudioButton from './components/AudioButton.vue'
import InputRow from './components/InputRow.vue'
import VoiceSelect from './components/VoiceSelect.vue'

import './assets/styles/main.scss'
import store from './store'

library.add(faUpload)

const app = createApp(App)

app.use(store)

app.component('MaryTabs', Tabs)
app.component('FromXml', FromXml)
app.component('AudioButton', AudioButton)
app.component('InputRow', InputRow)
app.component('VoiceSelect', VoiceSelect)

app.component('FontAwesomeIcon', FontAwesomeIcon)

app.mount('#app')
