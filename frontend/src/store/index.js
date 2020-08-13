import { createStore } from 'vuex';

const state = {
    stream: null,
    phonemes: null,
    runLoader: false,
    msPoints: null,
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

    setPoints(state, [ms, hertz]) {
        state.msPoints = ms;
        state.hertzPoints = hertz;
    },

    clearPhonemesData(state) {
        state.msPoints = null;
        state.hertzPoints = null;
    }
}

const actions = {
    async audioStream ({ commit, state }, userData) {
        commit('clearStream');

        const selectedSpeechVoice = state.voiceSet.find(voice => voice.id === userData.selectedVoice.value);

        if (selectedSpeechVoice) {
            commit('bindLoader');
            const { type, locale } = selectedSpeechVoice;


        const requestData = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                input_text: userData.userText.value,
                locale: locale,
                voice: type
            })
        };

        fetch(process.env.VUE_APP_API_URL+"/audio-voice", requestData)
            .then(response => response.blob())
            .then(blob => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    commit('setStream', reader.result);
                };
                reader.readAsDataURL(blob);
                commit('bindLoader');
            });
        }
    },

    graphPhonemes({ commit, state }, userData) {
        commit('clearPhonemesData');
        const selectedSpeechVoice = state.voiceSet.find(voice => voice.id === userData.selectedVoice.value);

        if (selectedSpeechVoice) {
            const { type, locale } = selectedSpeechVoice;


            const requestData = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    input_text: userData.userText.value,
                    locale: locale,
                    voice: type
                })
            };

            return fetch(process.env.VUE_APP_API_URL+"/phonemes", requestData)
                .then(response =>  response.json())
                .then(data => {
                    const points = data.reduce((acc, { ms, hertz }) => {
                        acc[0].push(ms);
                        acc[1].push(hertz);

                        return acc
                    }, [[], []]);

                    commit('setPoints', points);
                })
        }
    },
}

const getters = {
    toggleLoader(state) {
        return state.runLoader ? 'is-loading': '';
    },
}

export default createStore({
    state,
    mutations,
    actions,
    getters,
})