import jwt from "jsonwebtoken";
import { getSfAccessToken } from "./getToken";

export async function handler(event) {
  try {
    // 1️⃣ AUTH HEADER CHECK
    const authHeader = event.headers.authorization;
    if (!authHeader) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Authorization token missing" }),
      };
    }

    const token = authHeader.replace("Bearer ", localstorage.getItem("token"));

    // 2️⃣ VERIFY JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "devsecret");
    } catch {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Invalid token" }),
      };
    }

    if (!decoded.doctor_id) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: "Not a doctor token" }),
      };
    }

    // 3️⃣ GET SALESFORCE TOKEN
    const { access_token, instance_url } = await getSfAccessToken();

    // 4️⃣ QUERY DOCTOR
    const soql = `
      SELECT
        Id,
        Name,
        Email__c,
        Phone_Number__c,
        Aadhaar_No__c,
        Date_of_Birth__c,
        Specialization__c,
        Doctor_Id__c,
        Hospital__c,
        Profile_Image_URL__c
      FROM Doctor__c
      WHERE Doctor_Id__c='${decoded.doctor_id.replace(/'/g, "\\'")}'
      LIMIT 1
    `;

    const res = await fetch(
      `${instance_url}/services/data/v57.0/query?q=${encodeURIComponent(soql)}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const data = await res.json();

    if (!data.records || data.records.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Doctor not found" }),
      };
    }

    // 5️⃣ RETURN DOCTOR DATA
    return {
      statusCode: 200,
      body: JSON.stringify({
        status: true,
        doctor: data.records[0],
      }),
    };
  } catch (err) {
    console.error("Get doctor error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
