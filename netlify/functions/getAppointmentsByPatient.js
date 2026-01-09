import jwt from "jsonwebtoken";
import { getSfAccessToken } from "./getToken";

// In-memory cache (per Netlify instance)
const patientAppointmentsCache = new Map();
const CACHE_TTL = 60 * 1000; // 1 minute

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

    const cacheKey = `${decoded.id}_${limit}_${offset}`;
    const cached = patientAppointmentsCache.get(cacheKey);

    // 🔥 Serve from cache if valid
    if (cached && Date.now() - cached.time < CACHE_TTL) {
      return {
        statusCode: 200,
        body: JSON.stringify(cached.data),
        headers: {
          "Cache-Control": "public, max-age=60",
        },
      };
    }

    // 5️⃣ SALESFORCE TOKEN (CACHED INTERNALLY)
    const { access_token, instance_url } = await getSfAccessToken();

    // 6️⃣ SAFE + PAGINATED SOQL
    const soql = `
      SELECT
        Id,
        Name,
        Date__c,
        Department__c,
        Status__c,
        Visit_Time__c,
        Hospital__r.Name
      FROM Appointment__c
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
      appointments: data.records || [],
    };

    // 🔥 Cache response
    patientAppointmentsCache.set(cacheKey, {
      time: Date.now(),
      data: response,
    });

    return {
      statusCode: 200,
      body: JSON.stringify(response),
      headers: {
        "Cache-Control": "public, max-age=60",
      },
    };
  } catch (err) {
    console.error("Get patient reports error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
