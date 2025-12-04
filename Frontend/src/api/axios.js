import axios from "axios";

const api = axios.create({
  baseURL: "https://hope-backend-mvos.onrender.com", 
  withCredentials: true,
});

export default api;
