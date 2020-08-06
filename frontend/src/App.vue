<template>
    <div>
        <nav class="navbar" role="navigation" aria-label="main navigation">
            <div class="navbar-brand">
                <h1 class="navbar-item">
                    Mary Text to Speech
                </h1>
            </div>
        </nav>
        <section>
            <div class="columns">
                <div class="column my-2 ml-2">
                    <textarea class="textarea" placeholder="Insert your text here" rows="30" v-model="userText"></textarea>
                    <button class="button has-text-weight-bold is-primary mt-2 is-fullwidth" @click="generateAudio">Generete audio</button>
                </div>
                <div class="column my-2 mr-2">
                    <div class="field">
                        <div class="control">
                            <div class="select is-fullwidth is-primary">
                                <select v-model="selectedVoice">
                                    <option :value="id" v-for="{id, locale, sex, type} in selectData" :key="id">
                                        {{ locale }} - {{ sex }} - {{ type }}</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <audio :src="stream" autoplay="true" controls="" type="audio/wave"></audio>
                </div>
            </div>
        </section>
        <br>
    </div>
</template>
<script>
import { ref } from "vue";

export default {
    setup () {
        const stream = ref(undefined);
        const userText = ref(undefined);
        const selectedVoice = ref(undefined);
        const locale = ref(undefined);
        const type = ref(undefined);
        const selectData = [
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
        ];

        const generateAudio = () => {
            const selectedSpeechVoice = selectData.find(x => x.id === selectedVoice.value);
            const { locale, type } = selectedSpeechVoice;

            const requestObjects = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    input_text: userText.value,
                    locale: locale,
                    voice: type
                })
            };

            fetch("http://localhost:8000/audio-voice", requestObjects)
                .then(response => response.blob())
                .then(blob => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                    stream.value = reader.result };
                    reader.readAsDataURL(blob);
                });
        };

        return {
            stream,
            generateAudio,
            userText,
            selectedVoice,
            selectData
        }
    },
};
</script>
