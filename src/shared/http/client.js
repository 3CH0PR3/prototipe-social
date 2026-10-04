import axios from 'axios';

export const client = axios.create({
  timeout: 30000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});
