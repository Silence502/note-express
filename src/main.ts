import './assets/main.css'
import 'primeicons/primeicons.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import Custom from "@/plugins/primevue/presets/custom";
import Tooltip from 'primevue/tooltip';
import {i18n} from "@/i18n/config.ts";
import ConfirmationService from 'primevue/confirmationservice';

const app = createApp(App)
app.use(i18n);
app.directive('tooltip', Tooltip);
app.use(createPinia())
app.use(ConfirmationService);
app.use(ToastService);
app.use(PrimeVue, {
    theme: {
        ripple: true,
        preset: Custom,
        options: {
            prefix: 'p',
            darkModeSelector: '.dark',
            cssLayer: false
        }
    }
});
app.use(router)

app.mount('#app')
