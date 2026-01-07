import crypto from "crypto";
import jwt from "jsonwebtoken";
import { getSfAccessToken } from "./getToken";

export async function handler(event) {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No body" }),
      };
    }

    const { doctor_id, password } = JSON.parse(event.body);

    if (!doctor_id || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing fields" }),
      };
    }

    // 1️⃣ HASH INPUT PASSWORD
    const inputHash = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    // 2️⃣ GET SALESFORCE ACCESS TOKEN
    const { access_token, instance_url } = await getSfAccessToken();

    // 3️⃣ QUERY DOCTOR BY Doctor_Id__c
    const soql = `
      SELECT Id, Name, Email__c, Password_Hash__c
      FROM Doctor__c
      WHERE Doctor_Id__c='${doctor_id.replace(/'/g, "\\'")}'
      LIMIT 1
    `;

    const qRes = await fetch(
      `${instance_url}/services/data/v57.0/query?q=${encodeURIComponent(soql)}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const qData = await qRes.json();

    if (!qData.records || qData.records.length === 0) {
      return {
        statusCode: 401,
        body: JSON.stringify({ status: false, error: "Invalid credentials" }),
      };
    }

    const record = qData.records[0];

    // 4️⃣ COMPARE HASHES
    if (inputHash !== record.Password_Hash__c) {
      return {
        statusCode: 401,
        body: JSON.stringify({ status: false, error: "Password not correct" }),
      };
    }

    // 5️⃣ GENERATE JWT
    const payload = {
      id: record.Id,
      name: record.Name,
      email: record.Email__c,
      doctor_id,
      role: "doctor",
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || "devsecret", {
      expiresIn: "7d",
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: true,
        token,
        name: record.Name,
      }),
    };
  } catch (err) {
    console.error("Doctor login error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
