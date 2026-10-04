import PerfectScrollbarComponent from './PerfectScrollbar.vue';
import 'perfect-scrollbar/css/perfect-scrollbar.css';

export default {
  install(app) {
    app.component('PerfectScrollbar', PerfectScrollbarComponent);
  }
};
