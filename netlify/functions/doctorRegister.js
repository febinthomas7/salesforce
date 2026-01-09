import jwt from "jsonwebtoken";
import { getSfAccessToken } from "./getToken";
import { clearCache } from "./cache";
export async function handler(event) {
  try {
    const authHeader =
      event.headers.authorization || event.headers.Authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Invalid authorization format" }),
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
    if (!decoded.id) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: "Hospital access only" }),
      };
    }

    console.log("Decoded JWT in doctorRegister:", decoded);
    const { data } = JSON.parse(event.body);

    if (!data.name || !data.email || !data.adhaar_no || !data.specialization) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing fields" }),
      };
    }

    // 2️⃣ GET SALESFORCE ACCESS TOKEN
    const { access_token, instance_url } = await getSfAccessToken();

    // 3️⃣ PREPARE SALESFORCE OBJECT (Doctor__c)
    const sfBody = {
      Hospital__c: decoded.id,
      Name: data.name,
      Email__c: data.email,
      Phone_No__c: data.phone_no,
      Aadhaar_No__c: data.adhaar_no,
      Date_of_Birth__c: data.date_of_birth,
      Specialization__c: data.specialization,
      Status__c: "Available",
    };

    // 4️⃣ CREATE RECORD IN SALESFORCE
    const res = await fetch(
      `${instance_url}/services/data/v57.0/sobjects/Doctor__c/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sfBody),
      }
    );

    const Data = await res.json();
    console.log("Salesforce response:", Data);

    if (res.status === 201 || Data.id) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          status: true,
          id: Data.id,
          message: "Doctor registered successfully",
        }),
      };
    }
    clearCache(`hospital-doctors-${decoded.id}`);

    // Salesforce error
    return {
      statusCode: 400,
      body: JSON.stringify({ status: false, error: data }),
    };
  } catch (err) {
    console.error("Doctor register error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
