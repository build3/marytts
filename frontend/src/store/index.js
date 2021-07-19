import processAllophoneDictionaries from './allophoneDictionaries'

import { createStore } from './createStore'
import getExportXmlContent from './getExportXmlContent'
import getInputTextFromType from './getInputTextFromType'
import simplifyAcoustParamsDocument from './simplifyAcoustParamsDocument'
import transformAcoustParamsXmlToPhrases from './transformAcoustParamsXmlToPhrases'
import transformPhraseNodesToDataset from './transformPhraseNodesToDataset'
import transformProcessBlobToStream from './transformProcessBlobToStream'
import transformRawVoiceTypes from './transformRawVoiceTypes'

export const textTab = 'text'
export const xmlTab = 'xml'

const store = createStore({
  state: () => ({
    userText: '',
    dataset: null,
    originalDataset: null,
    stream: null,
    xmlFile: null,
    voiceTypes: [],
    selectedVoiceType: null,
    beginDocumentTags: '',
    endDocumentTags: '',
    acoustParamsDocument: null,
    acoustParamsSimplifiedDocument: null,
    phraseNodes: [],
    chartColor: '#00d1b2',
    xmlDownloadUrl: null,
    simplifiedVersionLoaded: false,
    allophoneDictionaries: null,
    error: {
      fetchVoices: null,
      getAudioStream: null,
      getAudioPhonemes: null,
    },
    previousFields: {
      userText: '',
      selectedVoiceType: null,
      simplifiedVersionLoaded: false,
      xmlFile: null,
    },
    phonemeSelector: {
      isOpen: false,
      node: null,
      currentPhonemeName: '',
      onPhonemeChange: null,
      datasetIndex: null,
      selectorX: 0,
      selectorWidth: 0,
      originalPhonemeNames: [],
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

    async getAudioStream({ inputType, simplified = false, autoplay = true }) {
      this.error.getAudioStream = null

      this.stream = null

      this.simplifiedVersionLoaded = simplified

      const audioElement = document.querySelector('audio')

      if (audioElement) {
        audioElement.autoplay = autoplay
      }

      try {
        const { type, locale } = this.selectedVoice

        if (!type || !locale) {
          return
        }

        const simplifiedExportXmlContent = simplified
          ? getExportXmlContent({
              acoustParamsDocument: this.acoustParamsSimplifiedDocument,
              beginDocumentTags: this.beginDocumentTags,
              endDocumentTags: this.endDocumentTags,
            })
          : ''

        const requestSearchParams = new URLSearchParams({
          INPUT_TEXT: await getInputTextFromType({
            inputType,
            simplified,
            inputText: this.userText,
            inputXmlFile: this.xmlFile,
            simplifiedExportXmlContent,
          }),
          INPUT_TYPE: inputType,
          LOCALE: locale,
          VOICE: type,
          OUTPUT_TYPE: 'AUDIO',
          AUDIO: 'WAVE',
        })

        const requestData = {
          method: 'POST',
          body: requestSearchParams,
        }

        const processResponse = await fetch(`/mtts/process`, requestData)

        if (!processResponse.ok) {
          throw new Error('Failed to fetch the audio data')
        }

        const processBlob = await processResponse.blob()

        this.stream = await transformProcessBlobToStream(processBlob)
      } catch (error) {
        this.error.getAudioStream = error.message

        this.stream = null
      }
    },

    async getAudioPhonemes({ inputType, simplified = false }) {
      this.error.getAudioPhonemes = null

      this.phraseNodes = []

      this.simplifiedVersionLoaded = simplified

      if (simplified) {
        this.originalDataset = this.dataset
        this.phonemeSelector.originalPhonemeNames = []
      } else {
        this.dataset = null
        this.originalDataset = null
        this.acoustParamsDocument = null
        this.beginDocumentTags = ''
        this.endDocumentTags = ''
        this.acoustParamsSimplifiedDocument = null
      }

      try {
        const { type, locale } = this.selectedVoice

        if (!type || !locale) {
          return
        }

        const simplifiedExportXmlContent = simplified
          ? getExportXmlContent({
              acoustParamsDocument: this.acoustParamsSimplifiedDocument,
              beginDocumentTags: this.beginDocumentTags,
              endDocumentTags: this.endDocumentTags,
            })
          : ''

        const requestSearchParams = new URLSearchParams({
          INPUT_TEXT: await getInputTextFromType({
            inputType,
            simplified,
            inputText: this.userText,
            inputXmlFile: this.xmlFile,
            simplifiedExportXmlContent,
          }),
          INPUT_TYPE: inputType,
          LOCALE: locale,
          VOICE: type,
          OUTPUT_TYPE: 'ACOUSTPARAMS',
        })

        const requestData = {
          method: 'POST',
          body: requestSearchParams,
        }

        const processResponse = await fetch(`/mtts/process`, requestData)

        const processAcoustParamsXml = await processResponse.text()

        const {
          phraseNodes,
          beginDocumentTags,
          endDocumentTags,
          acoustParamsDocument,
        } = transformAcoustParamsXmlToPhrases(processAcoustParamsXml)

        if (simplified) {
          this.acoustParamsSimplifiedDocument = acoustParamsDocument
        } else {
          this.acoustParamsDocument = acoustParamsDocument
        }

        this.beginDocumentTags = beginDocumentTags
        this.endDocumentTags = endDocumentTags
        this.phraseNodes = phraseNodes

        this.dataset = transformPhraseNodesToDataset(phraseNodes)

        if (simplified) {
          this.phonemeSelector.originalPhonemeNames = this.dataset.map(
            ({ phonemeName }) => phonemeName,
          )
        } else {
          this.previousFields.userText = this.userText
          this.previousFields.selectedVoiceType = this.selectedVoiceType
          this.previousFields.simplifiedVersionLoaded = false
          this.previousFields.xmlFile = this.xmlFile
        }

        this.regenerateXmlDownloadUrl()
      } catch (err) {
        this.error.getAudioPhonemes = err.message

        this.beginDocumentTags = ''
        this.endDocumentTags = ''
        this.acoustParamsDocument = null
        this.acoustParamsSimplifiedDocument = null
        this.phraseNodes = []
        this.dataset = null
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
        this.dataset[pointIndex].y = chartY
      }
    },

    regenerateXmlDownloadUrl() {
      if (this.xmlDownloadUrl) {
        URL.revokeObjectURL(this.xmlDownloadUrl)
      }

      const exportXmlContent = getExportXmlContent({
        acoustParamsDocument: this.simplifiedVersionLoaded
          ? this.acoustParamsSimplifiedDocument
          : this.acoustParamsDocument,
        beginDocumentTags: this.beginDocumentTags,
        endDocumentTags: this.endDocumentTags,
      })

      const exportXmlBlob = new Blob([exportXmlContent], { type: 'text/xml' })

      this.xmlDownloadUrl = URL.createObjectURL(exportXmlBlob)
    },

    simplifyAcoustParamsDocument() {
      if (this.acoustParamsDocument) {
        this.acoustParamsSimplifiedDocument = simplifyAcoustParamsDocument(
          this.acoustParamsDocument,
        )
      }
    },

    async initializeAllophoneDictionaries() {
      this.allophoneDictionaries = await processAllophoneDictionaries()
    },

    playStream() {
      const audioElement = document.querySelector('audio')

      if (audioElement) {
        audioElement.currentTime = 0
        audioElement.play()
      }
    },

    openPhonemeSelector({
      phonemeName,
      node,
      onPhonemeChange,
      datasetIndex,
      selectorX,
      selectorWidth,
    }) {
      this.phonemeSelector.isOpen = true
      this.phonemeSelector.node = node
      this.phonemeSelector.currentPhonemeName = phonemeName
      this.phonemeSelector.datasetIndex = datasetIndex
      this.phonemeSelector.onPhonemeChange = onPhonemeChange
      this.phonemeSelector.selectorX = selectorX
      this.phonemeSelector.selectorWidth = selectorWidth
    },

    closePhonemeSelector() {
      this.phonemeSelector.isOpen = false

      document.querySelectorAll('.phoneme-selector').forEach(element => {
        element.classList.remove('selected')
      })
    },

    selectNewPhoneme({ newPhoneme }) {
      this.phonemeSelector.node?.setAttribute('p', newPhoneme)
      this.phonemeSelector.onPhonemeChange?.({ newPhoneme })

      if (this.dataset?.[this.phonemeSelector.datasetIndex]) {
        this.dataset[this.phonemeSelector.datasetIndex].phonemeName = newPhoneme
      }

      this.closePhonemeSelector()
    },
  },

  getters: {
    selectedVoice() {
      return this.voiceTypes.find(({ type }) => type === this.selectedVoiceType)
    },

    phonemeDictionary() {
      return this.allophoneDictionaries?.[this.selectedVoice?.locale] ?? {}
    },

    processStateDirty() {
      function checkIfFieldDirty(fieldName) {
        return this.previousFields[fieldName] !== this[fieldName]
      }

      return [
        'userText',
        'selectedVoiceType',
        'simplifiedVersionLoaded',
        'xmlFile',
      ].some(checkIfFieldDirty.bind(this))
    },

    phonemeSelectorOriginalPhonemeName() {
      return (
        this.phonemeSelector.originalPhonemeNames?.[
          this.phonemeSelector.datasetIndex
        ] ?? null
      )
    },
  },
})

export default store
