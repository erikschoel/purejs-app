import axios from 'axios';
// import store from '@/store';

function createAPI(defaultHeaders) {
  let headers = defaultHeaders === false ? {} : {
    'Accept': 'application/json'
  };
  const api = axios.create({
    baseURL: 'http://purejs.nl/purejs-app/server/',
    withCredentials: false,
    headers: headers
  });
  api.interceptors.response.use((result) => {
    return result.data;
  }, (err) => {
    return Promise.reject(err);
  });
  return api;
}

export default(headers) => {
  return Promise.resolve(createAPI(headers));
}
