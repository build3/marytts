import { createStore } from 'vuex';

export const textTab = 'text';
export const xmlTab = 'xml';

const gatherPoints = ((data) => data.reduce((acc, { phoneme_name, hertz }) => {
    const [lastPhoneme] = acc[0].slice(-1);
    const [lastHertz] = acc[1].slice(-1);
    const [nextPhoneme] = acc[0].filter(phoneme => phoneme !== '').slice(-1)

    const isLastHertz = lastHertz === hertz;
    const isLastPhoneme = lastPhoneme === phoneme_name;
    const isNextPhoneme = nextPhoneme === phoneme_name;

    if (!isLastHertz || !isLastPhoneme) {
        if (isNextPhoneme) {
            return [
                [...acc[0], ''],
                [...acc[1], hertz],
            ]
        }

        return [
            [...acc[0], phoneme_name],
            [...acc[1], hertz],
        ]
    }

    return acc;
}, [[], []]));

const readAudioStream = ((commit, blob) => {
    const reader = new FileReader();
    reader.onloadend = (() => commit('setStream', reader.result));
    reader.readAsDataURL(blob);

    commit('bindLoader');
});

const state = {
    stream: null,
    runLoader: false,
    phonemeNames: null,
    hertzPoints: null,
    voiceSet: [
        { id:1, locale: 'te', type: 'cmu-nk-hsmm', sex: 'female'},
        { id:2, locale: 'sv', type: 'stts-sv-hb-hsmm', sex: 'male'},
        { id:3, locale: 'tr', type: 'dfki-ot-hsmm', sex: 'male'},
        { id:3, locale: 'de', type: 'dfki-pavoque-neutral-hsmm', sex: 'male'},
        { id:4, locale: 'de', type: 'bits3-hsmm', sex: 'male'},
        { id:5, locale: 'de', type: 'bits1-hsmm', sex: 'female'},
        { id:6, locale: 'fr', type: 'upmc-pierre-hsmm', sex: 'male'},
        { id:7, locale: 'fr', type: 'upmc-jessica-hsmm', sex: 'female'},
        { id:8, locale: 'fr', type: 'enst-dennys-hsmm', sex: 'male'},
        { id:9, locale: 'fr', type: 'enst-camille-hsmm', sex: 'female'},
        { id:10, locale: 'it', type: 'istc-lucia-hsmm', sex: 'female'},
        { id:11, locale: 'en_US', type: 'cmu-slt-hsmm', sex: 'female'},
        { id:12, locale: 'en_US', type: 'cmu-rms-hsmm', sex: 'male'},
        { id:13, locale: 'en_US', type: 'cmu-bdl-hsmm', sex: 'male'},
        { id:14, locale: 'en_GB', type: 'dfki-spike-hsmm', sex: 'male'},
        { id:15, locale: 'en_GB', type: 'dfki-prudence-hsmm', sex: 'female'},
        { id:16, locale: 'en_GB', type: 'dfki-poppy-hsmm', sex: 'female'},
        { id:17, locale: 'en_GB', type: 'dfki-obadiah-hsmm', sex: 'male'},
        { id:18, locale: 'ru', type: 'ac-irina-hsmm', sex: 'female'},
    ],
    currentActiveTab: textTab,
    currentChart: null,
    xmlFile: null,
    userText: '',
    selectedVoiceId: null,
    errors: null,
}

const mutations = {
    bindLoader (state) {
        state.runLoader = !state.runLoader;
    },

    setStream(state, newStream) {
        state.stream = newStream;
    },

    clearStream(state) {
        state.stream = null;
    },

    setPoints(state, [phoneme_name, hertz]) {
        state.phonemeNames = phoneme_name;
        state.hertzPoints = hertz;
    },

    clearPhonemesData(state) {
        state.phonemeNames = null;
        state.hertzPoints = null;
    },

    setTab(state, tab) {
        state.currentActiveTab = tab;
    },

    setCurrentChart(state, chart) {
        state.currentChart = chart;
    },

    updateChartData({ currentChart, phonemeNames, hertzPoints }) {
        currentChart.data.labels = phonemeNames;

        currentChart.data.datasets[0] = Object.assign(
            currentChart.data.datasets[0],
            { data: hertzPoints },
            {},
        );

        currentChart.update();
    },

    setUserText(state, text) {
        state.userText = text;
    },

    setSelectedVoice(state, voice) {
        state.selectedVoiceId = parseInt(voice);
    },

    setXmlFile(state, xmlFile) {
        state.xmlFile = xmlFile;
    },

    setError(state, errors) {
        state.errors = errors;
    },
}

const actions = {
    audioStream ({ commit, state: { selectedVoiceId, userText, voiceSet } }) {
        commit('clearStream');
        const selectedSpeechVoice = voiceSet.find(({ id }) => id === selectedVoiceId);

        if (selectedSpeechVoice) {
            commit('bindLoader');
            const { type, locale } = selectedSpeechVoice;

            const requestData = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    input_text: userText,
                    locale: locale,
                    voice: type,
                })
            };

            return fetch(`${process.env.VUE_APP_API_URL}/audio-voice`, requestData)
                .then(response => response.blob())
                .then(blob => readAudioStream(commit, blob));
            }

        return Promise.reject();
    },

    graphPhonemes({ commit, state: { selectedVoiceId, userText, voiceSet } }) {
        commit('clearPhonemesData');

        const selectedSpeechVoice = voiceSet.find(({ id }) => id === selectedVoiceId);

        if (selectedSpeechVoice) {
            const { type, locale } = selectedSpeechVoice;

            const requestData = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    input_text: userText,
                    locale: locale,
                    voice: type,
                })
            };

            return fetch(`${process.env.VUE_APP_API_URL}/phonemes`, requestData)
                .then(response => response.json())
                .then(data => commit('setPoints', gatherPoints(data)))
        }

        return Promise.reject();
    },

    audioStreamFromXml({ commit, state: { xmlFile, selectedVoiceId, voiceSet } }) {
        commit('clearStream');
        commit('bindLoader');
        commit('setError', null);

        const formData = new FormData();
        formData.append('xml', xmlFile);

        const selectedSpeechVoice = voiceSet.find(({ id }) => id === selectedVoiceId);

        if (selectedSpeechVoice) {
            const { type, locale } = selectedSpeechVoice;

            formData.append('locale', locale);
            formData.append('voice', type);
        }

        const requestData = { method: "POST", body: formData };

        return fetch(`${process.env.VUE_APP_API_URL}/xml/audio-voice`, requestData)
            .then(response => {
                if (!response.ok) {
                    throw Error;
                }

                return response.blob();
            })
            .then(blob => readAudioStream(commit, blob))
            .catch(() => {
                commit('bindLoader');
                commit('setError', 'Invalid XML file.');
            });
    },

    graphPhonemesFromXml({ commit, state: { xmlFile } }) {
        const formData = new FormData();
        formData.append('xml', xmlFile);

        const requestData = { method: "POST", body: formData };

        return fetch(`${process.env.VUE_APP_API_URL}/xml/phonemes`, requestData)
            .then(response => {
                if (!response.ok) {
                    throw Error;
                }

                return response.json();
            })
            .then(data => commit('setPoints', gatherPoints(data)))
            .catch(() => commit('setError', 'Invalid XML file.'));
    },

    changeTab({ commit }, tab) {
        commit('setError', null);
        commit('setTab', tab);
    },

    setNewChart({ commit }, chart) {
        commit('setCurrentChart', chart);
    },

    updateChart({ commit }) {
        commit('updateChartData');
    },

    updateUserText({ commit }, text) {
        commit('setUserText', text);
    },

    updateSelectedVoice({ commit }, voice) {
        commit('setSelectedVoice', voice);
    },

    updateXmlFile({ commit }, xmlFile) {
        commit('setXmlFile', xmlFile);
    },
}

const getters = {
    toggleLoader(state) {
        return state.runLoader ? 'is-loading': '';
    },

    maryttsXmlUrl({ voiceSet, selectedVoiceId, userText }) {
        if (!selectedVoiceId || !userText) {
            return '';
        }

        const voice = voiceSet.find(({ id }) => id === selectedVoiceId);

        if (!voice) {
            return '';
        }

        const { locale, type } = voice;

        const searchParams = new URLSearchParams({
            input_text: userText,
            locale,
            voice: type,
        });

        return `${process.env.VUE_APP_API_URL}/phonemes/xml?${searchParams}`;
    },

    currentActiveTabComponent({ currentActiveTab }) {
        switch (currentActiveTab) {
            case textTab: return 'from-text'
            case xmlTab: return 'from-xml'
            default: return null
        }
    },
}

export default createStore({
    state,
    mutations,
    actions,
    getters,
})
