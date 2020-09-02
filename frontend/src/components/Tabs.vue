<template>
    <div class="tabs is-boxed is-centered is-fullwidth">
        <ul>
            <li
                :class="{ 'is-active': activeTab === textTab }"
            >
                <a>
                    <span>Text</span>
                </a>
            </li>
            <li
                :class="{ 'is-active': activeTab === xmlTab }"
            >
                <a>
                    <span>XML</span>
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

        const activeTab = computed(() => store.getters.activeTab);

        return {
            activeTab,
            textTab,
            xmlTab,
        }
    }
}
</script>
