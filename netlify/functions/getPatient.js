import jwt from "jsonwebtoken";
import { getSfAccessToken } from "./getToken";

export async function handler(event) {
  try {
    // 1️⃣ AUTH CHECK
    const authHeader =
      event.headers.authorization || event.headers.Authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Authorization token missing" }),
      };
    }

    const token = authHeader.split(" ")[1];
    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Invalid token" }),
      };
    }

    // ✅ Patient-only access
    if (!decoded.id) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: "Patient access only" }),
      };
    }

    const patientId = decoded.id;

    // 2️⃣ SALESFORCE TOKEN
    const { access_token, instance_url } = await getSfAccessToken();

    // 3️⃣ GET PATIENT
    const patientSoql = `
      SELECT
        Id,
        Name,
        Aadhaar_No__c,
        Phone__c,
        Email__c,
        Blood_Group__c,
        Date_of_Birth__c,
        Gender__c,
        Photo__c
      FROM Patient__c
      WHERE Id='${patientId}'
      LIMIT 1
    `;

    const patientRes = await fetch(
      `${instance_url}/services/data/v57.0/query?q=${encodeURIComponent(
        patientSoql
      )}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const patientData = await patientRes.json();

    if (!patientData.records?.length) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Patient not found" }),
      };
    }

    const patient = patientData.records[0];

    // 4️⃣ GET EMERGENCY CONTACT
    const ecSoql = `
      SELECT
        Id,
        Name,
        Relation__c,
        Phone_No__c,
        Email__c
      FROM Emergency_Contact__c
      WHERE Patient__c='${patientId}'
      LIMIT 1
    `;

    const ecRes = await fetch(
      `${instance_url}/services/data/v57.0/query?q=${encodeURIComponent(
        ecSoql
      )}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const ecData = await ecRes.json();
    const emergencyContact = ecData.records?.[0] || null;

    // 5️⃣ FINAL RESPONSE (Frontend Friendly)
    return {
      statusCode: 200,
      body: JSON.stringify({
        status: true,
        patient: {
          id: patient.Id,
          name: patient.Name,
          aadhaar: patient.Aadhaar_No__c,
          phone: patient.Phone__c,
          email: patient.Email__c,
          bloodGroup: patient.Blood_Group__c,
          dob: patient.Date_of_Birth__c,
          gender: patient.Gender__c,
          photo: patient.Photo__c || null,
        },
        emergencyContact: emergencyContact
          ? {
              id: emergencyContact.Id,
              name: emergencyContact.Name,
              relation: emergencyContact.Relation__c,
              phone: emergencyContact.Phone_No__c,
              email: emergencyContact.Email__c,
            }
          : null,
      }),
    };
  } catch (err) {
    console.error("Get patient error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
