import jwt from "jsonwebtoken";
import { getSfAccessToken } from "./getToken";
import { getCache, setCache } from "./cache";

export async function handler(event) {
  try {
    // 1️⃣ AUTH HEADER CHECK
    const authHeader =
      event.headers.authorization || event.headers.Authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Authorization token missing" }),
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

    // 3️⃣ ENSURE PATIENT TOKEN
    if (!decoded?.id) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: "Patient access only" }),
      };
    }

    // 4️⃣ PAGINATION
    const limit = Number(event.queryStringParameters?.limit || 20);
    const offset = Number(event.queryStringParameters?.offset || 0);

    const cacheKey = `patient-reports-${decoded.id}`;
    const cachedData = getCache(cacheKey);

    if (cachedData) {
      return {
        statusCode: 200,
        body: JSON.stringify(cachedData),
      };
    }

    // 5️⃣ SALESFORCE TOKEN (CACHED INTERNALLY)
    const { access_token, instance_url } = await getSfAccessToken();

    // 6️⃣ SAFE + PAGINATED SOQL
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
      WHERE Patient__c = '${decoded.id.replace(/'/g, "\\'")}'
      ORDER BY CreatedDate DESC
      LIMIT ${limit}
      OFFSET ${offset}
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
      reports: data.records || [],
    };

    // 🔥 Cache response
    setCache(cacheKey, response);

    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (err) {
    console.error("Get patient reports error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
