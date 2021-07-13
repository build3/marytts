import { createStore } from './createStore'
import {
  getExportXmlContent,
  getInputTextFromType,
  simplifyAcoustParamsDocument,
  transformAcoustParamsXmlToPhrases,
  transformPhraseNodesToDataset,
  transformProcessBlobToStream,
  transformRawVoiceTypes,
} from './helpers'

export const textTab = 'text'
export const xmlTab = 'xml'

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
    acoustParamsSimplifiedDocument: null,
    phraseNodes: [],
    chartColor: '#00d1b2',
    xmlDownloadUrl: null,
    simplifiedVersionLoaded: false,
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
        const processBlob = await processResponse.blob()

        this.stream = await transformProcessBlobToStream(processBlob)
      } catch {
        this.error.getAudioPhonemes = null

        this.stream = null
      }
    },

    async getAudioPhonemes({ inputType, simplified = false }) {
      this.error.getAudioPhonemes = null

      this.phraseNodes = []
      this.dataset = null

      this.simplifiedVersionLoaded = simplified

      if (!simplified) {
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
  },

  getters: {
    selectedVoice() {
      return this.voiceTypes.find(({ type }) => type === this.selectedVoiceType)
    },
  },
})

export default store
