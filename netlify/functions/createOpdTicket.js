import jwt from "jsonwebtoken";
import { getSfAccessToken } from "./getToken";

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

    if (!decoded.id) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: "Not a patient token" }),
      };
    }

    const { hospitalId, department, slot, hospitalName } =
      event.queryStringParameters || {};

    if (!hospitalId || !slot) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing booking details" }),
      };
    }

    // 4️⃣ GET SALESFORCE TOKEN
    const { access_token, instance_url } = await getSfAccessToken();

    // 6️⃣ CREATE OPD TICKET
    const createRes = await fetch(
      `${instance_url}/services/data/v57.0/sobjects/Appointment__c`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Patient__c: decoded.id,
          Hospital__c: hospitalId,
          Visit_Time__c: slot,
          Date__c: new Date().toISOString().split("T")[0],
          Department__c: department,
          Name: hospitalName,
        }),
      }
    );

    const createData = await createRes.json();

    if (!createRes.ok) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to create OPD ticket" }),
      };
    }

    // 7️⃣ RETURN TICKET
    return {
      statusCode: 200,
      body: JSON.stringify({
        status: true,
        ticket: {
          slot,
          createdAt: new Date().toLocaleString(),
        },
      }),
    };
  } catch (err) {
    console.error("Create OPD Ticket Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
