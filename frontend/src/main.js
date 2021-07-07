/* eslint-disable import/no-extraneous-dependencies */

import { createApp } from 'vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faUpload } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { createPinia } from 'pinia'

import App from './App.vue'
import Tabs from './components/Tabs.vue'
import FromXml from './components/FromXml.vue'
import AudioButton from './components/AudioButton.vue'
import FromText from './components/FromText.vue'
import VoiceSelect from './components/VoiceSelect.vue'
import FromXmlFooter from './components/FromXmlFooter.vue'
import FromTextFooter from './components/FromTextFooter.vue'

import './assets/styles/main.scss'

library.add(faUpload)

const app = createApp(App)

app.use(createPinia())

app.component('MaryTabs', Tabs)
app.component('FromXml', FromXml)
app.component('AudioButton', AudioButton)
app.component('FromText', FromText)
app.component('VoiceSelect', VoiceSelect)
app.component('FromTextFooter', FromTextFooter)
app.component('FromXmlFooter', FromXmlFooter)

app.component('FontAwesomeIcon', FontAwesomeIcon)

app.mount('#app')
