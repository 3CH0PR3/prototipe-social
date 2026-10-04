import dayjs from 'dayjs';
import 'dayjs/locale/es';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

// Extend dayjs with required plugins
dayjs.extend(customParseFormat);
dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

// Set default locale
dayjs.locale('es');

// Create the plugin object
export const DayjsPlugin = {
  install(app) {
    // Register global methods/mixins
    app.config.globalProperties.$dayjs = dayjs;

    // Register additional utilities as global properties
    app.config.globalProperties.$formatDate = (date, format = 'DD-MMM-YYYY') => {
      return dayjs(date).format(format);
    };
  }
};
