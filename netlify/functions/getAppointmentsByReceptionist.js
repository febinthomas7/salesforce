import jwt from "jsonwebtoken";
import { getSfAccessToken } from "./getToken";

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
    const { access_token, instance_url } = await getSfAccessToken();

    const headers = { Authorization: `Bearer ${access_token}` };

    // 1️⃣ Appointments + Patients
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
        Hospital__r.NPI_id__c
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

    // 2️⃣ Doctors (USERS)
    const doctorSOQL = `
      SELECT
        Id,
        Name,
        Email__c,
        Doctor_Id__c,
        Hospital__c,
        Phone_No__c,
        Specialization__c,
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
    console.log("Doctors Data:", doctorsData);

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: true,
        hospital: {
          name: appointmentsData.records?.[0]?.Hospital__r?.Name || "",
          npi: appointmentsData.records?.[0]?.Hospital__r?.NPI_id__c || "",
        },
        appointments: appointmentsData.records || [],
        doctors: doctorsData.records || [],
      }),
    };
  } catch (err) {
    console.error("Hospital data error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
