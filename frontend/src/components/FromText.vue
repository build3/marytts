<template>
    <div>
        <div class="field">
            <div class="control">
                <input class="input is-primary" type="text"
                    placeholder="Insert your text here" :value="getUserText" @input="setUserText">
            </div>
        </div>

        <div class="field mt-2">
            <div class="control">
                <div class="select is-fullwidth is-primary">
                    <select @change="setSeletectedVoice" :value="getSelectedVoice">
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
                    :shouldDisable="generateButtonDisabled" />
            </div>
            <div class="column is-half">
                <a :href="xmlUrl">
                    <button
                        class="button has-text-weight-bold is-primary mt-2 mb-4 is-fullwidth"
                        :disabled="generateButtonDisabled">Export XML</button>
                </a>
            </div>
        </div>
    </div>
</template>

<script>
import { computed } from "vue";
import { useStore } from "vuex";

export default {
    setup() {
        const store = useStore();

        const voiceTypes = computed(() => store.state.voiceSet);

        const getUserText = computed(() => store.state.userText);
        const setUserText = ((event) => store.dispatch('updateUserText', event.target.value));

        const getSelectedVoice = computed(() => store.state.selectedVoiceId);
        const setSeletectedVoice = ((event) => store.dispatch('updateSelectedVoice', event.target.value));

        const generateButtonDisabled = computed(() => !getSelectedVoice.value || !getUserText.value);

        const xmlUrl = computed(() => store.getters.maryttsXmlUrl);

        return {
            voiceTypes,
            generateButtonDisabled,
            xmlUrl,
            getUserText,
            setUserText,
            getSelectedVoice,
            setSeletectedVoice,
        }
    }
}
</script>
