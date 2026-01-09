import jwt from "jsonwebtoken";
import { getSfAccessToken } from "./getToken";
import { getCache, setCache } from "./cache";

export async function handler(event) {
  try {
    const authHeader =
      event.headers.authorization || event.headers.Authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Unauthorized" }),
      };
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.hospital_id) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: "Hospital access only" }),
      };
    }

    const hospitalId = decoded.hospital_id;

    // ✅ CACHE CHECK
    const cacheKey = `Receptionist-appointments-${hospitalId}`;
    const cachedData = getCache(cacheKey);

    if (cachedData) {
      return {
        statusCode: 200,
        body: JSON.stringify(cachedData),
      };
    }

    // 🔄 FETCH FROM SALESFORCE
    const { access_token, instance_url } = await getSfAccessToken();
    const headers = { Authorization: `Bearer ${access_token}` };

    // 1️⃣ Appointments
    const appointmentSOQL = `
      SELECT
        Id,
        Name,
        Department__c,
        Date__c,
        Status__c,
        Visit_Time__c,
        Patient__r.Name,
        Patient__r.Aadhaar_No__c,
        Patient__r.Phone__c,
        Hospital__r.Name,
        Hospital__r.NPI_id__c,
        Doctor__r.Name,
        Doctor__r.Doctor_Id__c,
        Doctor__r.Specialization__c,
        Doctor__r.Phone_No__c,
        Doctor__c
      FROM Appointment__c
      WHERE Hospital__c='${hospitalId}'
      ORDER BY CreatedDate DESC
    `;

    const appointmentsRes = await fetch(
      `${instance_url}/services/data/v57.0/query?q=${encodeURIComponent(
        appointmentSOQL
      )}`,
      { headers }
    );

    const appointmentsData = await appointmentsRes.json();

    // 2️⃣ Doctors
    const doctorSOQL = `
      SELECT
        Id,
        Name,
        Email__c,
        Doctor_Id__c,
        Hospital__c,
        Phone_No__c,
        Specialization__c,
        Status__c,
        CreatedDate
      FROM Doctor__c
      WHERE Hospital__c='${hospitalId}'
      ORDER BY CreatedDate DESC
    `;

    const doctorsRes = await fetch(
      `${instance_url}/services/data/v57.0/query?q=${encodeURIComponent(
        doctorSOQL
      )}`,
      { headers }
    );

    const doctorsData = await doctorsRes.json();

    // ✅ RESPONSE OBJECT
    const response = {
      status: true,
      hospital: {
        name: appointmentsData.records?.[0]?.Hospital__r?.Name || "",
        npi: appointmentsData.records?.[0]?.Hospital__r?.NPI_id__c || "",
      },
      appointments: appointmentsData.records || [],
      doctors: doctorsData.records || [],
    };

    // ✅ STORE IN CACHE
    setCache(cacheKey, response);

    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (err) {
    console.error("Hospital data error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
