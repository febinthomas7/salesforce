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

    // 3️⃣ READ QUERY PARAMS
    const { state, district, search } = event.queryStringParameters || {};

    let conditions = [];

    if (state) {
      conditions.push(`State__r.Name='${state.replace(/'/g, "\\'")}'`);
    }

    if (district) {
      conditions.push(`District__r.Name='${district.replace(/'/g, "\\'")}'`);
    }

    if (search) {
      const safeSearch = search.replace(/'/g, "\\'");
      conditions.push(
        `(Name LIKE '%${safeSearch}%' OR State__r.Name LIKE '%${safeSearch}%')`
      );
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // 4️⃣ GET SALESFORCE TOKEN
    const { access_token, instance_url } = await getSfAccessToken();

    // 5️⃣ SOQL QUERY
    const soql = `
      SELECT
        Id,
        Name,
        Address__c,
        Contact_Number__c,
        District__r.Name,
        Image__c,
        State__r.Name,
        NPI_id__c
      FROM Hospital__c
      ${whereClause}
      ORDER BY Name ASC
      LIMIT 200
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

    // 6️⃣ RETURN RESPONSE
    return {
      statusCode: 200,
      body: JSON.stringify({
        status: true,
        hospitals: data.records || [],
      }),
    };
  } catch (err) {
    console.error("Get hospitals error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
