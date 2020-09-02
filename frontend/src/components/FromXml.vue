<template>
    <div>
        <div class="file is-centered">
            <label class="file-label">
                <input class="file-input"
                    type="file"
                    @change="swapFile">
                <span class="file-cta">
                    <span class="file-icon">
                        <font-awesome-icon icon="upload" />
                    </span>
                    <span class="file-label">
                        Choose a XML file…
                    </span>
                </span>
            </label>
        </div>
    </div>
</template>

<script>
import { ref, watch, computed } from "vue";

export default {
    setup() {
        const xmlFile = ref(null);

        const swapFile = ((file) => {
            xmlFile.value = file.target.files[0];
        });

        return {
            xmlFile,
            swapFile,
        }
    }
}
</script>
