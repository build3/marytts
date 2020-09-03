<template>
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
</template>

<script>
import { computed } from "vue";
import { useStore } from "vuex";

export default {
    setup() {
        const store = useStore();

        const voiceTypes = computed(() => store.state.voiceSet);

        const getSelectedVoice = computed(() => store.state.selectedVoiceId);
        const setSeletectedVoice = (({ target: { value }}) => store.dispatch('updateSelectedVoice', value));

        return {
            voiceTypes,
            getSelectedVoice,
            setSeletectedVoice,
        }
    }
}
</script>
