import jwt from "jsonwebtoken";
import { getSfAccessToken } from "./getToken";
import { clearCache } from "./cache";

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

    // 3️⃣ ENSURE HOSPITAL ACCESS
    if (!decoded.hospital_id) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: "Hospital access only" }),
      };
    }

    const hospitalId = decoded.hospital_id;

    // 4️⃣ READ BODY
    const { data } = JSON.parse(event.body || "{}");

    if (
      !data?.name ||
      !data?.phone_no ||
      !data?.adhaar_no ||
      !data?.date_of_birth ||
      !data?.email
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields" }),
      };
    }

    // 5️⃣ SALESFORCE TOKEN
    const { access_token, instance_url } = await getSfAccessToken();

    // 6️⃣ PREPARE RECEPTIONIST OBJECT
    const sfBody = {
      Hospital__c: hospitalId,
      Name: data.name,
      Phone_No__c: data.phone_no,
      Adhaar_No__c: data.adhaar_no,
      Date_of_Birth__c: data.date_of_birth,
      Email__c: data.email || "",
    };

    // 7️⃣ CREATE RECEPTIONIST
    const res = await fetch(
      `${instance_url}/services/data/v57.0/sobjects/Receptionist__c`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sfBody),
      }
    );

    const sfData = await res.json();

    if (!res.ok || !sfData.id) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          status: false,
          error: sfData,
        }),
      };
    }

    // ✅ CLEAR CACHE AFTER SUCCESS
    clearCache(`hospital-receptionists-${hospitalId}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: true,
        id: sfData.id,
        message: "Receptionist registered successfully",
      }),
    };
  } catch (err) {
    console.error("Receptionist register error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
