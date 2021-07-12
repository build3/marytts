/* eslint-disable no-unused-vars */
import { inject, reactive } from 'vue'
import { createStore } from './createStore'
import {
  transformAcoustParamsXmlToPhrases,
  transformPhraseNodesToDataset,
  transformProcessBlobToStream,
  transformRawVoiceTypes,
} from './helpers'

export const textTab = 'text'
export const xmlTab = 'xml'

// const gatherPoints = data =>
//   data.reduce(
//     (acc, { phoneme_name: phonemeName, hertz, ms }) => {
//       const [lastPhoneme] = acc[0].slice(-1)
//       const [lastHertz] = acc[1].slice(-1)
//       const [nextPhoneme] = acc[0].filter(phoneme => phoneme !== '').slice(-1)
//
//       const isLastHertz = lastHertz === hertz
//       const isLastPhoneme = lastPhoneme === phonemeName
//       const isNextPhoneme = nextPhoneme === phonemeName
//
//       if (!isLastHertz || !isLastPhoneme) {
//         if (isNextPhoneme) {
//           return [
//             [...acc[0], ''],
//             [...acc[1], hertz],
//             [...acc[2], ms],
//           ]
//         }
//
//         return [
//           [...acc[0], phonemeName],
//           [...acc[1], hertz],
//           [...acc[2], ms],
//         ]
//       }
//
//       return acc
//     },
//     [[], [], []],
//   )
//
// const createDataSet = (hertz, phonems, ms) => {
//   return ms.map((msValue, i) => ({
//     x: msValue,
//     y: hertz[i],
//     phonem: phonems[i],
//   }))
// }
//
// const readAudioStream = (commit, blob) => {
//   const reader = new FileReader()
//   reader.onloadend = () => {
//     commit('setStream', reader.result)
//   }
//   reader.readAsDataURL(blob)
//
//   commit('bindLoader')
// }
//
// const clearChartData = commit => {
//   commit('clearPhonemesData')
//   commit('clearStream')
//   commit('enableAudioButton')
// }
//
// const downloadXML = blob => {
//   const fileURL = window.URL.createObjectURL(blob)
//   const fileLink = document.createElement('a')
//   fileLink.href = fileURL
//   fileLink.setAttribute('download', 'MaryTTS.xml')
//   document.body.appendChild(fileLink)
//   fileLink.click()
//   fileLink.style.display = 'none'
//
//   window.URL.revokeObjectURL(fileURL)
//   document.body.removeChild(fileLink)
// }
//
// function transformChartDataSet(chartDataset) {
//   return chartDataset.reduce(
//     (accumulatedDataset, { x, y, phonem }, dataIndex) => {
//       const phonemeName =
//         phonem ?? accumulatedDataset[dataIndex - 1]?.phoneme_name
//
//       return [
//         ...accumulatedDataset,
//         {
//           ms: x,
//           hertz: y,
//           phoneme_name: phonemeName,
//         },
//       ]
//     },
//     [],
//   )
// }
//
// const state = {
//   stream: null,
//   runLoader: false,
//   phonemeNames: null,
//   hertzPoints: null,
//   voiceSet: [
//     { id: 1, locale: 'te', type: 'cmu-nk-hsmm', sex: 'female' },
//     { id: 2, locale: 'sv', type: 'stts-sv-hb-hsmm', sex: 'male' },
//     { id: 3, locale: 'tr', type: 'dfki-ot-hsmm', sex: 'male' },
//     { id: 3, locale: 'de', type: 'dfki-pavoque-neutral-hsmm', sex: 'male' },
//     { id: 4, locale: 'de', type: 'bits3-hsmm', sex: 'male' },
//     { id: 5, locale: 'de', type: 'bits1-hsmm', sex: 'female' },
//     { id: 6, locale: 'fr', type: 'upmc-pierre-hsmm', sex: 'male' },
//     { id: 7, locale: 'fr', type: 'upmc-jessica-hsmm', sex: 'female' },
//     { id: 8, locale: 'fr', type: 'enst-dennys-hsmm', sex: 'male' },
//     { id: 9, locale: 'fr', type: 'enst-camille-hsmm', sex: 'female' },
//     { id: 10, locale: 'it', type: 'istc-lucia-hsmm', sex: 'female' },
//     { id: 11, locale: 'en_US', type: 'cmu-slt-hsmm', sex: 'female' },
//     { id: 12, locale: 'en_US', type: 'cmu-rms-hsmm', sex: 'male' },
//     { id: 13, locale: 'en_US', type: 'cmu-bdl-hsmm', sex: 'male' },
//     { id: 14, locale: 'en_GB', type: 'dfki-spike-hsmm', sex: 'male' },
//     { id: 15, locale: 'en_GB', type: 'dfki-prudence-hsmm', sex: 'female' },
//     { id: 16, locale: 'en_GB', type: 'dfki-poppy-hsmm', sex: 'female' },
//     { id: 17, locale: 'en_GB', type: 'dfki-obadiah-hsmm', sex: 'male' },
//     { id: 18, locale: 'ru', type: 'ac-irina-hsmm', sex: 'female' },
//   ],
//   currentActiveTab: textTab,
//   xmlFile: null,
//   userText: '',
//   selectedVoiceId: null,
//   errors: null,
//   ms: null,
//   chartDataset: null,
//   modifiedPoints: [],
//   chartColor: '#00d1b2',
// }
//
// const mutations = {
//   bindLoader(currentState) {
//     currentState.runLoader = !currentState.runLoader
//   },
//
//   setStream(currentState, newStream) {
//     currentState.stream = newStream
//   },
//
//   clearStream(currentState) {
//     currentState.stream = null
//   },
//
//   setPoints(currentState, [phonemeName, hertz, ms]) {
//     currentState.phonemeNames = phonemeName
//     currentState.hertzPoints = hertz
//     currentState.ms = ms
//   },
//
//   clearPhonemesData(currentState) {
//     currentState.phonemeNames = null
//     currentState.hertzPoints = null
//   },
//
//   setTab(currentState, tab) {
//     currentState.currentActiveTab = tab
//   },
//
//   setUserText(currentState, text) {
//     currentState.userText = text
//   },
//
//   setSelectedVoice(currentState, voice) {
//     currentState.selectedVoiceId = parseInt(voice, 10)
//   },
//
//   setXmlFile(currentState, xmlFile) {
//     currentState.xmlFile = xmlFile
//   },
//
//   setError(currentState, errors) {
//     currentState.errors = errors
//   },
//
//   enableAudioButton(currentState) {
//     currentState.runLoader = false
//   },
//
//   setChartDataset(currentState, dataset) {
//     currentState.chartDataset = dataset
//   },
//
//   clearmodifiedPoints(currentState) {
//     currentState.modifiedPoints = []
//   },
//
//   updateDatasetPoint(currentState, { pointIndex, pointValue }) {
//     currentState.chartDataset[pointIndex].y = pointValue
//   },
// }
//
// const actions = {
//   updatePoint({ state: { modifiedPoints } }, point) {
//     const existingPointIndex = modifiedPoints.findIndex(
//       ({ ms }) => ms === point.x,
//     )
//
//     if (existingPointIndex >= 0) {
//       modifiedPoints[existingPointIndex].hertz = point.y
//       modifiedPoints[existingPointIndex].phonem = point.phonem
//     } else {
//       modifiedPoints.push({
//         ms: point.x,
//         hertz: point.y,
//         phonem: point.phonem,
//       })
//     }
//   },
//
//   audioStream({ commit, getters, state: { userText } }) {
//     commit('clearmodifiedPoints')
//     commit('clearStream')
//     const selectedSpeechVoice = getters.selectedVoice
//
//     if (selectedSpeechVoice) {
//       commit('bindLoader')
//       const { type, locale } = selectedSpeechVoice
//
//       const requestSearchParams = new URLSearchParams({
//         INPUT_TEXT: encodeURIComponent(userText),
//         INPUT_TYPE: 'TEXT',
//         LOCALE: locale,
//         VOICE: type,
//         OUTPUT_TYPE: 'AUDIO',
//         AUDIO: 'WAVE',
//       })
//
//       const requestData = {
//         method: 'GET',
//       }
//
//       return fetch(`/mtts/process?${requestSearchParams}`, requestData)
//         .then(response => response.blob())
//         .then(blob => readAudioStream(commit, blob))
//     }
//
//     return Promise.reject()
//   },
//
//   graphPhonemes({ commit, getters, state: { userText } }) {
//     commit('clearPhonemesData')
//
//     const selectedSpeechVoice = getters.selectedVoice
//
//     if (selectedSpeechVoice) {
//       const { type, locale } = selectedSpeechVoice
//
//       const requestData = {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           input_text: userText,
//           locale,
//           voice: type,
//         }),
//       }
//
//       return fetch(`${process.env.VUE_APP_API_URL}/phonemes`, requestData)
//         .then(response => response.json())
//         .then(data => {
//           commit('setPoints', gatherPoints(data))
//           commit(
//             'setChartDataset',
//             createDataSet(state.hertzPoints, state.phonemeNames, state.ms),
//           )
//         })
//     }
//
//     return Promise.reject()
//   },
//
//   audioStreamFromXml({ commit, getters, state: { xmlFile } }) {
//     commit('clearmodifiedPoints')
//     commit('clearStream')
//     commit('bindLoader')
//     commit('setError', null)
//
//     const formData = new FormData()
//     formData.append('xml', xmlFile)
//
//     const selectedSpeechVoice = getters.selectedVoice
//
//     if (selectedSpeechVoice) {
//       const { type, locale } = selectedSpeechVoice
//
//       formData.append('locale', locale)
//       formData.append('voice', type)
//     }
//
//     const requestData = { method: 'POST', body: formData }
//
//     return fetch(`${process.env.VUE_APP_API_URL}/xml/audio-voice`, requestData)
//       .then(response => {
//         if (!response.ok) {
//           commit('setError', 'Error genereting audio from the XML file')
//           clearChartData(commit)
//         }
//
//         return response.blob()
//       })
//       .then(blob => readAudioStream(commit, blob))
//       .catch(() => {
//         commit('bindLoader')
//         commit('setError', 'Invalid XML file.')
//       })
//   },
//
//   graphPhonemesFromXml({ commit, state: { xmlFile } }) {
//     const formData = new FormData()
//     formData.append('xml', xmlFile)
//
//     const requestData = { method: 'POST', body: formData }
//
//     return fetch(`${process.env.VUE_APP_API_URL}/xml/phonemes`, requestData)
//       .then(response => {
//         if (!response.ok) {
//           commit('setError', 'Error genereting phonems from the XML file')
//           clearChartData(commit)
//         }
//
//         return response.json()
//       })
//       .then(data => {
//         commit('setPoints', gatherPoints(data))
//         commit(
//           'setChartDataset',
//           createDataSet(state.hertzPoints, state.phonemeNames, state.ms),
//         )
//       })
//       .catch(() => commit('setError', 'Invalid XML file.'))
//   },
//
//   simplifiedAudioStream({ commit, getters, state: { userText } }) {
//     commit('clearStream')
//     const selectedSpeechVoice = getters.selectedVoice
//
//     if (selectedSpeechVoice) {
//       commit('bindLoader')
//       const { type, locale } = selectedSpeechVoice
//
//       const requestData = {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           input_text: userText,
//           locale,
//           voice: type,
//         }),
//       }
//
//       return fetch(
//         `${process.env.VUE_APP_API_URL}/audio-voice/simplify`,
//         requestData,
//       )
//         .then(response => response.blob())
//         .then(blob => readAudioStream(commit, blob))
//         .catch(() => {
//           commit('setError', 'The sound cannot be simplified')
//           clearChartData(commit)
//         })
//     }
//
//     return Promise.reject()
//   },
//
//   simplifiedGraphPhonemes({ commit, getters, state: { userText } }) {
//     commit('clearPhonemesData')
//
//     const selectedSpeechVoice = getters.selectedVoice
//
//     if (selectedSpeechVoice) {
//       const { type, locale } = selectedSpeechVoice
//
//       const requestData = {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           input_text: userText,
//           locale,
//           voice: type,
//         }),
//       }
//
//       return fetch(
//         `${process.env.VUE_APP_API_URL}/phonemes/simplify`,
//         requestData,
//       )
//         .then(response => response.json())
//         .then(data => {
//           commit('setPoints', gatherPoints(data))
//           commit(
//             'setChartDataset',
//             createDataSet(state.hertzPoints, state.phonemeNames, state.ms),
//           )
//         })
//         .catch(() => {
//           commit('setError', 'The graph cannot be simplified')
//           clearChartData(commit)
//         })
//     }
//
//     return Promise.reject()
//   },
//
//   changeTab({ commit }, tab) {
//     commit('setError', null)
//     commit('setTab', tab)
//   },
//
//   updateUserText({ commit }, text) {
//     commit('setUserText', text)
//   },
//
//   updateSelectedVoice({ commit }, voice) {
//     commit('setSelectedVoice', voice)
//   },
//
//   updateXmlFile({ commit }, xmlFile) {
//     commit('setXmlFile', xmlFile)
//   },
//
//   playStream({ state: { stream } }) {
//     const audioElement = document.querySelector('audio')
//
//     if (stream && audioElement) {
//       audioElement.currentTime = 0
//       audioElement.play()
//     }
//   },
//
//   generateAudioFromEditedPoints({
//     commit,
//     getters,
//     state: { userText, chartDataset },
//   }) {
//     const { selectedVoice } = getters
//
//     if (!selectedVoice) {
//       return Promise.reject(new Error('Voice not found'))
//     }
//
//     commit('bindLoader')
//
//     const { locale, type } = selectedVoice
//
//     const requestChartDataSet = transformChartDataSet(chartDataset)
//
//     const requestData = {
//       method: 'POST',
//       body: JSON.stringify({
//         input_text: userText,
//         locale,
//         voice: type,
//         modifiers: requestChartDataSet,
//       }),
//       headers: {
//         Accept: 'application/json',
//         'Content-Type': 'application/json',
//       },
//     }
//
//     return fetch(
//       `${process.env.VUE_APP_API_URL}/audio-voice/edited`,
//       requestData,
//     )
//       .then(response => response.blob())
//       .then(blob => readAudioStream(commit, blob))
//       .catch(() => {
//         commit('bindLoader')
//         commit(
//           'setError',
//           'Could not process the edited points, try again later',
//         )
//       })
//   },
//
//   generateXmlFileFromText({ commit, getters, state: { userText } }) {
//     const { selectedVoice } = getters
//
//     if (!selectedVoice) {
//       return Promise.reject(new Error('Voice not found'))
//     }
//
//     const { locale, type } = selectedVoice
//
//     const requestData = {
//       method: 'POST',
//       body: JSON.stringify({
//         input_text: userText,
//         locale,
//         voice: type,
//       }),
//       headers: {
//         Accept: 'application/json',
//         'Content-Type': 'application/json',
//       },
//     }
//
//     return fetch(`${process.env.VUE_APP_API_URL}/phonemes/xml`, requestData)
//       .then(response => response.blob())
//       .then(blob => downloadXML(blob))
//       .catch(() => {
//         commit('setError', 'Could not generate xml file')
//       })
//   },
//
//   generateSimplifiedXmlFileFromText({
//     commit,
//     getters,
//     state: { chartDataset, userText },
//   }) {
//     const { selectedVoice } = getters
//
//     if (!selectedVoice) {
//       return Promise.reject(new Error('Voice not found'))
//     }
//
//     const { locale, type } = selectedVoice
//
//     const requestChartDataSet = transformChartDataSet(chartDataset)
//
//     const formData = new FormData()
//     formData.append('input_text', userText)
//     formData.append('locale', locale)
//     formData.append('voice', type)
//     formData.append('modifiers', JSON.stringify(requestChartDataSet))
//
//     const requestData = {
//       method: 'POST',
//       body: formData,
//       headers: {
//         Accept: 'application/json',
//       },
//     }
//
//     return fetch(
//       `${process.env.VUE_APP_API_URL}/phonemes/xml/edited`,
//       requestData,
//     )
//       .then(response => response.blob())
//       .then(blob => downloadXML(blob))
//       .catch(() => {
//         commit('setError', 'Could not generate xml file')
//       })
//   },
//
//   simplifiedAudioStreamFromXml({ commit, getters, state: { xmlFile } }) {
//     commit('clearStream')
//     commit('bindLoader')
//     commit('setError', null)
//
//     const formData = new FormData()
//     formData.append('xml', xmlFile)
//
//     const selectedSpeechVoice = getters.selectedVoice
//
//     if (selectedSpeechVoice) {
//       const { type, locale } = selectedSpeechVoice
//
//       formData.append('locale', locale)
//       formData.append('voice', type)
//     }
//
//     const requestData = { method: 'POST', body: formData }
//
//     return fetch(
//       `${process.env.VUE_APP_API_URL}/xml/audio-voice/simplify`,
//       requestData,
//     )
//       .then(response => {
//         if (!response.ok) {
//           commit('setError', 'Error simplifying the XML file')
//           clearChartData(commit)
//         }
//
//         return response.blob()
//       })
//       .then(blob => readAudioStream(commit, blob))
//       .catch(() => {
//         commit('bindLoader')
//         commit('setError', 'Invalid XML file.')
//         clearChartData(commit)
//       })
//   },
//
//   simplifiedGraphPhonemesFromXml({ commit, state: { xmlFile } }) {
//     const formData = new FormData()
//     formData.append('xml', xmlFile)
//
//     const requestData = { method: 'POST', body: formData }
//
//     return fetch(
//       `${process.env.VUE_APP_API_URL}/xml/phonemes/simplify`,
//       requestData,
//     )
//       .then(response => {
//         if (!response.ok) {
//           commit('setError', 'Error simplifying the XML file')
//           clearChartData(commit)
//         }
//
//         return response.json()
//       })
//       .then(data => {
//         commit('setPoints', gatherPoints(data))
//         commit(
//           'setChartDataset',
//           createDataSet(state.hertzPoints, state.phonemeNames, state.ms),
//         )
//       })
//       .catch(() => {
//         commit('setError', 'Invalid XML file.')
//         clearChartData(commit)
//       })
//   },
//
//   generateAudioFromEditedPointsXml({
//     commit,
//     getters,
//     state: { xmlFile, chartDataset },
//   }) {
//     const { selectedVoice } = getters
//
//     if (!selectedVoice) {
//       return Promise.reject(new Error('Voice not found'))
//     }
//
//     commit('bindLoader')
//
//     const { locale, type } = selectedVoice
//
//     const requestChartDataSet = transformChartDataSet(chartDataset)
//
//     const formData = new FormData()
//     formData.append('xml', xmlFile)
//     formData.append('locale', locale)
//     formData.append('voice', type)
//     formData.append('modifiers', JSON.stringify(requestChartDataSet))
//
//     const requestData = {
//       method: 'POST',
//       body: formData,
//       headers: {
//         Accept: 'application/json',
//       },
//     }
//
//     return fetch(
//       `${process.env.VUE_APP_API_URL}/xml/audio-voice/edited`,
//       requestData,
//     )
//       .then(response => response.blob())
//       .then(blob => readAudioStream(commit, blob))
//       .catch(() => {
//         commit('bindLoader')
//         commit(
//           'setError',
//           'Could not process the edited points, try again later',
//         )
//       })
//   },
//
//   generateXmlFileFromXML({
//     commit,
//     getters,
//     state: { xmlFile, chartDataset },
//   }) {
//     const { selectedVoice } = getters
//
//     if (!selectedVoice) {
//       return Promise.reject(new Error('Voice not found'))
//     }
//
//     const { locale, type } = selectedVoice
//
//     const requestChartDataSet = transformChartDataSet(chartDataset)
//
//     const formData = new FormData()
//     formData.append('xml', xmlFile)
//     formData.append('locale', locale)
//     formData.append('voice', type)
//     formData.append('modifiers', JSON.stringify(requestChartDataSet))
//
//     const requestData = {
//       method: 'POST',
//       body: formData,
//       headers: {
//         Accept: 'application/json',
//       },
//     }
//
//     return fetch(
//       `${process.env.VUE_APP_API_URL}/xml/phonemes/xml/edited`,
//       requestData,
//     )
//       .then(response => response.blob())
//       .then(blob => downloadXML(blob))
//       .catch(() => {
//         commit('setError', 'Could not generate xml file')
//       })
//   },
//
//   updateDatasetPoint({ commit }, { pointIndex, pointValue }) {
//     commit('updateDatasetPoint', { pointIndex, pointValue })
//   },
// }
//
// const getters = {
//   toggleLoader(currentState) {
//     return currentState.runLoader ? 'is-loading' : ''
//   },
//
//   maryttsXmlUrl({ voiceSet, selectedVoiceId, userText }) {
//     if (!selectedVoiceId || !userText) {
//       return ''
//     }
//
//     const voice = voiceSet.find(({ id }) => id === selectedVoiceId)
//
//     if (!voice) {
//       return ''
//     }
//
//     const { locale, type } = voice
//
//     const searchParams = new URLSearchParams({
//       input_text: userText,
//       locale,
//       voice: type,
//     })
//
//     return `${process.env.VUE_APP_API_URL}/phonemes/xml?${searchParams}`
//   },
//
//   currentActiveTabComponent({ currentActiveTab }) {
//     switch (currentActiveTab) {
//       case textTab:
//         return 'from-text'
//       case xmlTab:
//         return 'from-xml'
//       default:
//         return null
//     }
//   },
//
//   currentActiveTabFooter({ currentActiveTab }) {
//     switch (currentActiveTab) {
//       case textTab:
//         return 'from-text-footer'
//       case xmlTab:
//         return 'from-xml-footer'
//       default:
//         return null
//     }
//   },
//
//   selectedVoice({ selectedVoiceId, voiceSet }) {
//     return voiceSet.find(({ id }) => id === selectedVoiceId)
//   },
// }

const store = createStore({
  state: () => ({
    userText: '',
    dataset: null,
    stream: null,
    xmlFile: null,
    voiceTypes: [],
    selectedVoiceType: null,
    beginDocumentTags: '',
    endDocumentTags: '',
    acoustParamsDocument: null,
    phraseNodes: [],
    chartColor: '#00d1b2',
    error: {
      fetchVoices: null,
      getAudioStream: null,
      getAudioPhonemes: null,
    },
  }),

  actions: {
    async fetchVoices() {
      this.error.fetchVoices = null

      try {
        const voiceTypesResponse = await fetch('/mtts/voices')
        const rawVoiceTypes = await voiceTypesResponse.text()

        this.voiceTypes = transformRawVoiceTypes(rawVoiceTypes)
      } catch (error) {
        this.voiceTypes = []
        this.error.fetchVoices = error.message
      }
    },

    async getAudioStream() {
      this.error.getAudioStream = null

      this.stream = null

      try {
        const { type, locale } = this.selectedVoice

        if (!type || !locale) {
          return
        }

        const requestSearchParams = new URLSearchParams({
          INPUT_TEXT: this.userText,
          INPUT_TYPE: 'TEXT',
          LOCALE: locale,
          VOICE: type,
          OUTPUT_TYPE: 'AUDIO',
          AUDIO: 'WAVE',
        })

        const requestData = {
          method: 'GET',
        }

        const processResponse = await fetch(
          `/mtts/process?${requestSearchParams}`,
          requestData,
        )
        const processBlob = await processResponse.blob()

        this.stream = await transformProcessBlobToStream(processBlob)
      } catch {
        this.error.getAudioPhonemes = null

        this.stream = null
      }
    },

    async getAudioPhonemes() {
      this.error.getAudioPhonemes = null

      this.beginDocumentTags = ''
      this.endDocumentTags = ''
      this.acoustParamsDocument = null
      this.phraseNodes = []

      try {
        const { type, locale } = this.selectedVoice

        if (!type || !locale) {
          return
        }

        const requestSearchParams = new URLSearchParams({
          INPUT_TEXT: this.userText,
          INPUT_TYPE: 'TEXT',
          LOCALE: locale,
          VOICE: type,
          OUTPUT_TYPE: 'ACOUSTPARAMS',
        })

        const requestData = {
          method: 'GET',
        }

        const processResponse = await fetch(
          `/mtts/process?${requestSearchParams}`,
          requestData,
        )

        const processAcoustParamsXml = await processResponse.text()

        Object.assign(
          this,
          transformAcoustParamsXmlToPhrases(processAcoustParamsXml),
        )
      } catch (err) {
        this.error.getAudioPhonemes = err.message

        this.beginDocumentTags = ''
        this.endDocumentTags = ''
        this.acoustParamsDocument = null
        this.phraseNodes = []
      }
    },

    clearErrors() {
      const clearObjectKey = errorKey => {
        this.error[errorKey] = null
      }

      Object.keys(this.error).forEach(clearObjectKey.bind(this))
    },

    updateDatasetPoint({ pointIndex, pointValue: chartY }) {
      if (pointIndex in this.dataset) {
        this.dataset[pointIndex] = chartY
      }
    },
  },

  getters: {
    selectedVoice() {
      return this.voiceTypes.find(({ type }) => type === this.selectedVoiceType)
    },

    dataset() {
      return transformPhraseNodesToDataset(this.phraseNodes)
    },
  },
})

export default store
