import {createApp} from 'vue'
import {createI18n} from "vue-i18n";
import {library} from "@fortawesome/fontawesome-svg-core";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {faDesktop, faGamepad, faGear, faRotate, faXmark} from "@fortawesome/free-solid-svg-icons";
import en_GB from "@/lang/languages/en_GB";
import th_TH from "@/lang/languages/th_TH";
import LinkApp from "@/link/LinkApp.vue";

library.add(faDesktop, faGamepad, faGear, faRotate, faXmark);

function savedLanguage() {
    try {
        const saved = localStorage.getItem("goxlr-link-lang");
        if (saved) return saved;
    } catch (e) {
        // storage blocked: fall back to the system language
    }
    return navigator.language.startsWith("th") ? "th_TH" : "en_GB";
}

const i18n = createI18n({
    legacy: true,
    locale: savedLanguage(),
    fallbackLocale: "en_GB",
    messages: {en_GB, th_TH},
});

createApp(LinkApp).use(i18n).component('font-awesome-icon', FontAwesomeIcon).mount('#app');
