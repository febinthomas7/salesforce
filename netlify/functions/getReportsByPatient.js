import jwt from "jsonwebtoken";
import { getSfAccessToken } from "./getToken";

export async function handler(event) {
  try {
    // 1️⃣ AUTH HEADER CHECK
    const authHeader =
      event.headers.authorization || event.headers.Authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Authorization token missing" }),
      };
    }

    // ✅ Correct token extraction
    const token = authHeader.split(" ")[1];

    // 2️⃣ VERIFY JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Invalid token" }),
      };
    }

    // 3️⃣ ENSURE PATIENT TOKEN
    if (!decoded.id) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: "Patient access only" }),
      };
    }

    console.log("Decoded JWT:", decoded);
    // 4️⃣ SALESFORCE TOKEN
    const { access_token, instance_url } = await getSfAccessToken();

    // 5️⃣ QUERY REPORTS CREATED BY THIS DOCTOR
    const soql = `
      SELECT
        Id,
        Name,
        Notes__c,
        URL__c,
        Category__c,
        Title__c,
        Date_of_expire__c,
        Date_of_issue__c,
        Patient__r.Name,
        Doctor__r.Name,
        Hospital__r.Name
      FROM Patient_Report__c
      WHERE Patient__c = '${decoded.id}'
      ORDER BY CreatedDate DESC
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
    console.log("Fetched reports:", data);

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: true,
        count: data.totalSize,
        reports: data.records || [],
      }),
    };
  } catch (err) {
    console.error("Get reports error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
