<template>
    <div>
        <div class="field">
            <div class="control">
                <input class="input is-primary" type="text"
                    placeholder="Insert your text here" v-model="userText">
            </div>
        </div>

        <div class="field mt-2">
            <div class="control">
                <div class="select is-fullwidth is-primary">
                    <select v-model="selectedVoice">
                        <option :value="null" disabled>Select voice</option>
                        <option :value="id"
                            v-for="{id, locale, sex, type} in voiceTypes" :key="id">
                            {{ locale }} - {{ sex }} - {{ type }}</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="columns">
            <div class="column is-half">
                <audio-button
                    :isXml="false"
                    :shouldDisable="generateButtonDisabled"
                    :actionArgs="{ selectedVoice, userText }"
                />
            </div>
            <div class="column is-half">
                <a :href="xmlUrl(userText, selectedVoice)">
                    <button
                        class="button has-text-weight-bold is-primary mt-2 mb-4 is-fullwidth"
                        :disabled="generateButtonDisabled"
                        >Export XML</button>
                </a>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, computed } from "vue";
import { useStore } from "vuex";

export default {
    setup() {
        const store = useStore();

        const voiceTypes = computed(() => store.state.voiceSet);

        const userText = ref('');
        const selectedVoice = ref(null);

        const generateButtonDisabled = computed(() => !selectedVoice.value || !userText.value);

        const xmlUrl = computed(() => store.getters.maryttsXmlUrl);

        const activeTab = computed(() => store.state.currentActiveTab);

        return {
            userText,
            selectedVoice,
            voiceTypes,
            generateButtonDisabled,
            xmlUrl,
        }
    }
}
</script>
