import api from "./api";

export const loginUser = async (credentials) => {
  const res = await api.post("/.netlify/functions/patientLogin", credentials);
  return res.data;
};

export const registerUser = async (userData) => {
  const res = await api.post("/.netlify/functions/patientRegister", userData);
  return res.data;
};

export const loginDoctor = async (userData) => {
  const res = await api.post("/.netlify/functions/doctorLogin", userData);
  return res.data;
};

export const registerDoctor = async (userData) => {
  const res = await api.post("/.netlify/functions/doctorRegister", userData);
  return res.data;
};

export const registerHospital = async (userData) => {
  const res = await api.post("/.netlify/functions/hospitalResgister", userData);
  return res.data;
};

export const loginHospital = async (userData) => {
  const res = await api.post("/.netlify/functions/hospitalLogin", userData);
  return res.data;
};
