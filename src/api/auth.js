import api from "./api";

export const loginUser = async (credentials) => {
  const res = await api.post("/.netlify/functions/patientLogin", credentials);
  return res.data;
};

export const registerUser = async (userData) => {
  const res = await api.post("/.netlify/functions/patientRegister", userData);
  return res.data;
};

export const registerHospital = async (userData) => {
  const res = await api.post("/api/hospital/register", userData);
  return res.data;
};

export const loginHospital = async (userData) => {
  const res = await api.post("/api/hospital/login", userData);
  return res.data;
};
