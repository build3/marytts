<template>
    <div class="tabs is-boxed is-centered is-fullwidth">
        <ul>
            <li
                :class="{ 'is-active': activeTab === textTab }"
                @click="changeTab(textTab)">
                <a>
                    <span>From text</span>
                </a>
            </li>
            <li
                :class="{ 'is-active': activeTab === xmlTab }"
                @click="changeTab(xmlTab)">
                <a>
                    <span>From XML</span>
                </a>
            </li>
        </ul>
    </div>
</template>

<script>
import { computed } from "vue";
import { useStore } from "vuex";

import { textTab, xmlTab } from '../store/index';

export default {
    setup() {
        const store = useStore();

        const activeTab = computed(() => store.state.currentActiveTab);

        const changeTab = ((tab) => store.dispatch('changeTab', tab))

        return {
            activeTab,
            textTab,
            xmlTab,
            changeTab,
        }
    }
}
</script>
