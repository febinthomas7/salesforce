import { getSfAccessToken } from "./getToken";
import { getCache, setCache } from "./cache";
export async function handler(event) {
  try {
    // ✅ CACHE CHECK
    const cacheKey = `partners`;
    const cachedData = getCache(cacheKey);

    if (cachedData) {
      return {
        statusCode: 200,
        body: JSON.stringify(cachedData),
      };
    }
    // This will now either work or jump straight to the catch block below
    const { access_token, instance_url } = await getSfAccessToken();

    const soql = `
      SELECT Id, Name, Description__c, Logo__c, Website__c 
      FROM Company_Advertisement__c 
      ORDER BY CreatedDate DESC
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
      partners: data.records || [],
    };

    setCache(cacheKey, response);
    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (err) {
    console.error("Handler Error:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Backend Failure",
        details: err.message,
      }),
    };
  }
}
