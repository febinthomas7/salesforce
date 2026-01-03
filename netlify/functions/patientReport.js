import crypto from "crypto";
import jwt from "jsonwebtoken";
import { getSfAccessToken } from "./getToken";

export async function handler(event) {
  try {
    if (!event.body) {
      return { statusCode: 400, body: JSON.stringify({ error: "No body" }) };
    }

    const { password } = JSON.parse(event.body);

    // 1. GENERATE HASH OF INPUT
    const inputHash = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    const { access_token, instance_url } = await getSfAccessToken();

    // 2. QUERY SALESFORCE
    const soql = `SELECT Id, Patient__c,Doctor__c,Hospital__c,File_URL__c,Report_Type__c,Notes__c, Date__c FROM Patient_Report__c WHERE Hospital_Id__c='${hospital_id}' LIMIT 1`;

    const qRes = await fetch(
      `${instance_url}/services/data/v57.0/query?q=${encodeURIComponent(soql)}`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    const qData = await qRes.json();

    if (!qData.records || qData.records.length === 0) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Invalid credentials" }),
      };
    }

    const record = qData.records[0];

    // 3. COMPARE HASHES
    if (inputHash !== record.Password_Hash__c) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Invalid credentials" }),
      };
    }

    // 4. GENERATE JWT
    const token = jwt.sign(
      { id: record.Id, name: record.Name, email: record.Email__c },
      process.env.JWT_SECRET || "devsecret",
      { expiresIn: "7d" }
    );

    return { statusCode: 200, body: JSON.stringify({ status: true, token }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
