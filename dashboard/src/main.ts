import { createApp } from "vue";
import PrimeVue from "primevue/config";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Textarea from "primevue/textarea";
import Tag from "primevue/tag";
import Tooltip from "primevue/tooltip";
import App from "./App.vue";

// CSS imports
import "./style.css";
import "@primevue/resources/themes/lara-light-blue/theme.css";
import "@primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";

const app = createApp(App);

// Import PrimeVue config
import PrimeVueConfig from "./config/primevue.config";

// Use PrimeVue with config
app.use(PrimeVue, PrimeVueConfig);

// Register PrimeVue components
app.component("Button", Button);
app.component("DataTable", DataTable);
app.component("Column", Column);
app.component("Dialog", Dialog);
app.component("InputText", InputText);
app.component("Dropdown", Dropdown);
app.component("Textarea", Textarea);
app.component("Tag", Tag);

// Register PrimeVue directives
app.directive("tooltip", Tooltip);

app.mount("#app");
