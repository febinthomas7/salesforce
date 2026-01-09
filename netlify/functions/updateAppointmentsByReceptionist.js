import jwt from "jsonwebtoken";
import { getSfAccessToken } from "./getToken";
import { clearCache } from "./cache";

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
    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Invalid token" }),
      };
    }

    // Optional role check (hospital/doctor/receptionist)
    if (!decoded?.id) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: "Unauthorized access" }),
      };
    }

    // 2️⃣ PARSE BODY
    const { data } = JSON.parse(event.body || "{}");

    if (!data.appointmentId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "appointmentId and doctorId are required",
        }),
      };
    }

    // 3️⃣ SALESFORCE TOKEN
    const { access_token, instance_url } = await getSfAccessToken();

    // 4️⃣ UPDATE Appointment__c
    const updateRes = await fetch(
      `${instance_url}/services/data/v57.0/sobjects/Appointment__c/${data.appointmentId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Status__c: data.status || "Successful",
          Doctor__c: data.doctorId || null,
        }),
      }
    );

    if (!updateRes.ok) {
      const error = await updateRes.json();
      throw new Error(error[0]?.message || "Failed to update appointment");
    }

    clearCache(`Receptionist-appointments-${decoded.hospital_id}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: true,
        message: "Appointment updated successfully",
      }),
    };
  } catch (err) {
    console.error("Update appointment error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
