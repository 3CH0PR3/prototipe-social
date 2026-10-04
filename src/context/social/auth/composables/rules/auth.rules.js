export const loginRules = {
  email: 'required|email',
  password: 'required|min:8|max:50',
};

export const registerRules = {
  name: 'required|min:3|max:100',
  email: 'required|email',
  password: 'required|password|min:8|max:50',
  password_confirmation: 'required',
};

export const forgotRules = {
  email: 'required|email',
};

export const resetRules = {
  password: 'required|password|min:8|max:50',
  password_confirmation: 'required|password|min:8|max:50',
};
