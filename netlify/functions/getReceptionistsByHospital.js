import jwt from "jsonwebtoken";
import { getSfAccessToken } from "./getToken";
import { getCache, setCache } from "./cache";

export async function handler(event) {
  try {
    // 1️⃣ AUTH CHECK
    const authHeader =
      event.headers.authorization || event.headers.Authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Invalid authorization format" }),
      };
    }

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

    // 3️⃣ ENSURE HOSPITAL TOKEN
    if (!decoded.hospital_id) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: "Hospital access only" }),
      };
    }

    const hospitalId = decoded.hospital_id;

    // ✅ CACHE CHECK
    const cacheKey = `hospital-receptionists-${hospitalId}`;

    const cachedData = getCache(cacheKey);

    if (cachedData) {
      return {
        statusCode: 200,
        body: JSON.stringify(cachedData),
      };
    }

    // 4️⃣ SALESFORCE ACCESS TOKEN
    const { access_token, instance_url } = await getSfAccessToken();

    // 5️⃣ QUERY ALL RECEPTIONISTS UNDER HOSPITAL
    const soql = `
      SELECT
        Id,
        Name,
        Receptionist_Id__c,
        Phone_No__c,
        Hospital__c,
        Date_of_Birth__c,
        Adhaar_No__c,
        CreatedDate
      FROM Receptionist__c
      WHERE Hospital__c='${hospitalId}'
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

    const response = {
      status: true,
      count: data.totalSize,
      receptionists: data.records || [],
    };

    // ✅ STORE IN CACHE (5 minutes)
    setCache(cacheKey, response);

    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (err) {
    console.error("Get receptionists error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
