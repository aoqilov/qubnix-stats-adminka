import axios from "axios";

// Hozircha hech qanday so'rov ketmaydi (USE_MOCK, ./mock.ts) — backend ulanganda shu instans ishlaydi.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
