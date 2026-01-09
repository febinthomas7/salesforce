import jwt from "jsonwebtoken";
import { getSfAccessToken } from "./getToken";

const reportsCache = new Map();
const CACHE_TTL = 60 * 1000;

export async function handler(event) {
  try {
    // 1️⃣ AUTH
    const authHeader =
      event.headers.authorization || event.headers.Authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return { statusCode: 401, body: "Unauthorized" };
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id) {
      return { statusCode: 403, body: "Doctor access only" };
    }

    // 2️⃣ PAGINATION
    const limit = Number(event.queryStringParameters?.limit || 20);
    const offset = Number(event.queryStringParameters?.offset || 0);

    const cacheKey = `${decoded.id}_${limit}_${offset}`;
    const cached = reportsCache.get(cacheKey);

    if (cached && Date.now() - cached.time < CACHE_TTL) {
      return {
        statusCode: 200,
        body: JSON.stringify(cached.data),
      };
    }

    // 3️⃣ SALESFORCE TOKEN (CACHED)
    const { access_token, instance_url } = await getSfAccessToken();

    // 4️⃣ SAFE SOQL
    const soql = `
      SELECT Id, Name, Notes__c, URL__c, Category__c, Title__c,
             Date_of_expire__c, Date_of_issue__c,
             Patient__r.Name, Doctor__r.Name, Hospital__r.Npi_Id__c
      FROM Patient_Report__c
      WHERE Doctor__c = '${decoded.id.replace(/'/g, "\\'")}'
      ORDER BY CreatedDate DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    const res = await fetch(
      `${instance_url}/services/data/v57.0/query?q=${encodeURIComponent(soql)}`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    const data = await res.json();

    const response = {
      status: true,
      count: data.totalSize,
      reports: data.records || [],
    };

    // 🔥 Cache response
    reportsCache.set(cacheKey, {
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
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
