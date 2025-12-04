import axios from "axios";

const api = axios.create({
  baseURL: "https://YOUR_BACKEND_DOMAIN.onrender.com", 
  withCredentials: true,
});

export default api;
