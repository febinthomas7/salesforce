import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getSfAccessToken } from "./getToken";

export async function handler(event) {
  try {
    if (!event.body) {
      return { statusCode: 400, body: JSON.stringify({ error: "No body" }) };
    }

    const { doctor_id, password } = JSON.parse(event.body);

    if (!doctor_id || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing fields" }),
      };
    }

    // Get access token
    const { access_token, instance_url } = await getSfAccessToken();
    // Query Salesforce for patient by Aadhaar_No__c
    const soql = `SELECT Id, Name, Email__c, Password_Hash__c FROM Doctor__c WHERE Doctor_Id__c='${doctor_id}' LIMIT 1`;
    const qRes = await fetch(
      `${instance_url}/services/data/v57.0/query?q=${encodeURIComponent(soql)}`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    const qData = await qRes.json();
    console.log(qData);

    if (!qData.records || qData.records.length === 0) {
      return {
        statusCode: 401,
        body: JSON.stringify({ status: false, error: "Invalid credentials" }),
      };
    }

    const record = qData.records[0];
    const hash = record.Password_Hash__c;

    // Compare passwords
    const match = await bcrypt.compare(password, hash);
    if (!match) {
      return {
        statusCode: 401,
        body: JSON.stringify({ status: false, error: "password not correct" }),
      };
    }

    // Create JWT
    const payload = {
      id: record.Id,
      name: record.Name,
      email: record.Email__c,
      doctor_id: doctor_id,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "devsecret", {
      expiresIn: "7d",
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ status: true, token, data: payload }),
    };
  } catch (err) {
    console.error("Login error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
