<template>
    <div>
        <h1>MaryTTS</h1>
        <button @click="generateAudio">Generete audio</button>
        <br>
        <audio :src="stream" autoplay="true" controls="" type="audio/wave"></audio>
        <input type="text" v-model="userText">
    </div>
</template>
<script>
import { ref } from "vue";

export default {
    setup () {
        const stream = ref(undefined);
        const userText = ref(undefined);
        const selectedVoice = ref("");
        const generateAudio = () => {
            const requestObjects = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({input_text: userText.value, locale: "en_US", voice: "cmu-rms-hsmm"})
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
        }
    },
};
</script>
