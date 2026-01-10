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

export const registerDoctor = async (token, userData) => {
  const res = await api.post("/.netlify/functions/doctorRegister", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: userData,
  });
  return res.data;
};

export const registerReceptionist = async (token, userData) => {
  const res = await api.post("/.netlify/functions/registerReceptionist", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: userData,
  });
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

export const createReport = async (token, userData) => {
  const res = await api.post("/.netlify/functions/createReport", userData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const getDoctorsByHospital = async (token) => {
  const res = await api.get("/.netlify/functions/getDoctorsByHospital", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
export const getReceptionistsByHospital = async (token) => {
  const res = await api.get("/.netlify/functions/getReceptionistsByHospital", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const getReportsByHospital = async (token) => {
  const res = await api.get("/.netlify/functions/getReportsByHospital", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const getReportsByDoctor = async (token) => {
  const res = await api.get("/.netlify/functions/getReportsByDoctor", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const getReportsByPatient = async (token) => {
  const res = await api.get("/.netlify/functions/getReportsByPatient", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const hospitalSearch = async (
  token,
  selectedState,
  selectedDistrict,
  debouncedSearch
) => {
  const res = await api.get(
    `/.netlify/functions/hospitalSearch?state=${selectedState}&district=${selectedDistrict}&search=${debouncedSearch}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

export const createOpdTicket = async (
  token,
  Id,
  slot,
  department,
  hospitalName
) => {
  const res = await api.post(
    `/.netlify/functions/createOpdTicket?hospitalId=${Id}&slot=${slot}&department=${department}&hospitalName=${hospitalName}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};
export const getPartners = async () => {
  const res = await api.get("/.netlify/functions/getPartners");
  return res.data;
};

export const loginReceptionist = async (credentials) => {
  const res = await api.post(
    "/.netlify/functions/loginReceptionist",
    credentials
  );
  return res.data;
};

export const getAppointmentsByReceptionist = async (token) => {
  const res = await api.get(
    "/.netlify/functions/getAppointmentsByReceptionist",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

export const getAppointmentsByPatient = async (token) => {
  const res = await api.get("/.netlify/functions/getAppointmentsByPatient", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const updateAppointmentsByReceptionist = async (token, userData) => {
  const res = await api.post(
    "/.netlify/functions/updateAppointmentsByReceptionist",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: userData,
    }
  );
  return res.data;
};

export const patientSettings = async (token, userData) => {
  const res = await api.post("/.netlify/functions/patientSettings", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: userData,
  });
  return res.data;
};

export const getPatient = async (token) => {
  const res = await api.get("/.netlify/functions/getPatient", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
