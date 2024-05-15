import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8036"
})

export default api;