import { createStore } from 'vuex';

export const textTab = 'text';
export const xmlTab = 'xml';

const gatherPoints = ((data) => data.reduce((acc, { phoneme_name, hertz, ms }) => {
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
                [...acc[2], ms],
            ]
        }

        return [
            [...acc[0], phoneme_name],
            [...acc[1], hertz],
            [...acc[2], ms],
        ]
    }

    return acc;
}, [[], [], []]));

const readAudioStream = ((commit, blob) => {
    const reader = new FileReader();
    reader.onloadend = (() => commit('setStream', reader.result));
    reader.readAsDataURL(blob);

    commit('bindLoader');
});

const clearChartData = ((commit) => {
    commit('clearPhonemesData');
    commit('clearStream');
    commit('updateChartData');
    commit('enableAudioButton');
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
    ms: null
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

    setPoints(state, [phoneme_name, hertz, ms]) {
        state.phonemeNames = phoneme_name;
        state.hertzPoints = hertz;
        state.ms = ms
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

    enableAudioButton(state) {
        state.runLoader = false;
    },
}

const actions = {
    audioStream ({ commit, getters, state: { userText } }) {
        commit('clearStream');
        const selectedSpeechVoice = getters.selectedVoice;

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

    graphPhonemes({ commit, getters, state: { userText } }) {
        commit('clearPhonemesData');

        const selectedSpeechVoice = getters.selectedVoice;

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
                .then(data => {
                    commit('setPoints', gatherPoints(data))
                })
        }

        return Promise.reject();
    },

    audioStreamFromXml({ commit, getters, state: { xmlFile } }) {
        commit('clearStream');
        commit('bindLoader');
        commit('setError', null);

        const formData = new FormData();
        formData.append('xml', xmlFile);

        const selectedSpeechVoice = getters.selectedVoice;

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

    simplifiedAudioStream({ commit, getters, state: { userText } }) {
        commit('clearStream');
        const selectedSpeechVoice = getters.selectedVoice;

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

            return fetch(`${process.env.VUE_APP_API_URL}/audio-voice/simplify`, requestData)
                .then(response => response.blob())
                .then(blob => readAudioStream(commit, blob))
                .catch(() => {
                    commit('setError', 'The sound cannot be simplified');
                    clearChartData(commit);
                });
        }

        return Promise.reject();
    },
    

    simplifiedGraphPhonemes({ commit, getters, state: { userText } }) {
        commit('clearPhonemesData');

        const selectedSpeechVoice = getters.selectedVoice;

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

            return fetch(`${process.env.VUE_APP_API_URL}/phonemes/simplify`, requestData)
                .then(response => response.json())
                .then(data => commit('setPoints', gatherPoints(data)))
                .catch(() =>  {
                    commit('setError', 'The graph cannot be simplified');
                    clearChartData(commit);
                });
        }

        return Promise.reject();
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

    playStream({ state }) {
        const { stream } = state
        const audioElement = document.querySelector('audio')

        if (stream && audioElement) {
            audioElement.currentTime = 0
            audioElement.play()
        }
    },

    generateAudioFromEditedPoints({ commit, getters, state }) {
        const selectedVoice = getters.selectedVoice;
        const { userText, currentChart, phonemeNames, ms } = state;

        if (!selectedVoice) {
            return Promise.reject('Voice not found');
        }

        if (!currentChart) {
            return Promise.reject('Chart not initialized')
        }

        commit('bindLoader');

        const { locale, type } = selectedVoice;

        const modifiers = []

        for (const index in currentChart.data.datasets[0].data) {
            const frequency = currentChart.data.datasets[0].data[index]
            const time = ms[index]
            const phonemeName = phonemeNames[index]

            modifiers.push({
                ms: time,
                hertz: frequency,
                phoneme_name: phonemeName
            })
        }

        const requestData = {
            method: 'POST',
            body: JSON.stringify({
                input_text: userText,
                locale,
                voice: type,
                modifiers
            }),
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        };

        return fetch(`${process.env.VUE_APP_API_URL}/audio-voice/edited`, requestData)
            .then(response => response.blob())
            .then(blob => readAudioStream(commit, blob))
            .catch(() => {
                commit('bindLoader');
                commit('setError', 'Could not process the edited points, try again later');
            });
    },

    generateXmlFileFromText({ commit, getters, state: { userText } }) {
        const selectedVoice = getters.selectedVoice;

        if (!selectedVoice) {
            return Promise.reject('Voice not found');
        }

        const { locale, type } = selectedVoice;

        const requestData = {
            method: 'POST',
            body: JSON.stringify({
                input_text: userText,
                locale,
                voice: type,
            }),
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        };

        return fetch(`${process.env.VUE_APP_API_URL}/phonemes/xml`, requestData)
            .then(response => response.blob())
            .then(blob => {
                const fileURL = window.URL.createObjectURL(blob);
                const fileLink = document.createElement('a');
                fileLink.href = fileURL;
                fileLink.setAttribute('download', 'MaryTTS.xml');
                document.body.appendChild(fileLink);
                fileLink.click();
            })
            .catch(() => {
                commit('setError', 'Could not process the edited points, try again later');
            });
    },

    simplifiedAudioStreamFromXml({ commit, getters, state: { xmlFile } }) {
        commit('clearStream');
        commit('bindLoader');
        commit('setError', null);

        const formData = new FormData();
        formData.append('xml', xmlFile);

        const selectedSpeechVoice = getters.selectedVoice;

        if (selectedSpeechVoice) {
            const { type, locale } = selectedSpeechVoice;

            formData.append('locale', locale);
            formData.append('voice', type);
        }

        const requestData = { method: "POST", body: formData };

        return fetch(`${process.env.VUE_APP_API_URL}/xml/audio-voice/simplify`, requestData)
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
                clearChartData(commit);
            });
    },

    simplifiedGraphPhonemesFromXml({ commit, state: { xmlFile } }) {
        const formData = new FormData();
        formData.append('xml', xmlFile);

        const requestData = { method: "POST", body: formData };

        return fetch(`${process.env.VUE_APP_API_URL}/xml/phonemes/simplify`, requestData)
            .then(response => {
                if (!response.ok) {
                    throw Error;
                }

                return response.json();
            })
            .then(data => commit('setPoints', gatherPoints(data)))
            .catch(() => {
                commit('setError', 'Invalid XML file.'),
                clearChartData(commit);
            });
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

    currentActiveTabFooter({ currentActiveTab }) {
        switch (currentActiveTab) {
            case textTab: return 'from-text-footer'
            case xmlTab: return 'from-xml-footer'
            default: return null
        }
    },

    selectedVoice({ selectedVoiceId, voiceSet }) {
        return voiceSet.find(({ id }) => id === selectedVoiceId);
    }
}

export default createStore({
    state,
    mutations,
    actions,
    getters,
})
