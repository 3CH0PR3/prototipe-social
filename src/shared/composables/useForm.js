import { reactive } from 'vue';

export const useForm = (initialValues = {}) => {
  const form = reactive({
    ...initialValues,

    errors: {},
    processing: false,
    wasSuccessful: false,
    recentlySuccessful: false,

    data() {
      // Eliminar propiedades internas del form
      const formData = { ...this };

      delete formData.errors;
      delete formData.processing;
      delete formData.wasSuccessful;
      delete formData.recentlySuccessful;
      delete formData.data;
      delete formData.setError;
      delete formData.setErrors;
      delete formData.clearErrors;
      delete formData.reset;
      delete formData.transform;
      delete formData.defaults;
      delete formData.isDirty;
      delete formData.hasErrors;

      return formData;
    },

    transform(callback) {
      this._transformCallback = callback;
      const data = this.data();
      return callback ? callback(data) : data;
    },

    defaults(field, value) {
      if (typeof field === 'undefined') {
        return { ...initialValues };
      }

      if (typeof field === 'object') {
        Object.assign(initialValues, field);
        return this;
      }

      if (typeof value === 'undefined') {
        return initialValues[field];
      }

      initialValues[field] = value;
      return this;
    },

    setError(field, message) {
      this.errors[field] = message;
      return this;
    },

    setErrors(serverErrors = {}) {
      this.errors = Object.fromEntries(
        Object.entries(serverErrors).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
      );
      return this;
    },

    clearErrors(...fields) {
      if (fields.length === 0) {
        this.errors = {};
        return this;
      }

      fields.forEach((field) => {
        delete this.errors[field];
      });

      return this;
    },

    reset(...fields) {
      if (fields.length === 0) {
        Object.assign(this, initialValues);
        this.errors = {};
        this.wasSuccessful = false;
        this.recentlySuccessful = false;
        return this;
      }

      fields.forEach((field) => {
        this[field] = initialValues[field];
      });

      return this;
    },

    isDirty(field) {
      if (field) {
        return this[field] !== initialValues[field];
      }

      return Object.keys(initialValues).some((key) => this[key] !== initialValues[key]);
    },

    hasErrors(...fields) {
      if (fields.length === 0) {
        return Object.keys(this.errors).length > 0;
      }

      return fields.some((field) => this.errors[field]);
    }
  });

  return form;
};
