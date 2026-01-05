import crypto from "crypto";
import jwt from "jsonwebtoken";
import { getSfAccessToken } from "./getToken";

export async function handler(event) {
  try {
    if (!event.body) {
      return { statusCode: 400, body: JSON.stringify({ error: "No body" }) };
    }

    const { password, npi_id } = JSON.parse(event.body);

    // 1. GENERATE HASH OF INPUT
    const inputHash = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    const { access_token, instance_url } = await getSfAccessToken();

    // 2. QUERY SALESFORCE
    const soql = `SELECT  NPI_Id__c, Password_Hash__c , Name, Email__c, id  FROM Hospital__c WHERE Npi_Id__c='${npi_id}' LIMIT 1`;

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
    console.log("Fetched hospital record:", record);

    // 3. COMPARE HASHES
    if (inputHash !== record.Password_Hash__c) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Invalid credentials" }),
      };
    }

    console.log({
      id: record.Id,
      name: record.Name,
      email: record.Email__c,
      npiId: record.NPI_id__c,
      hospital_id: record.Id,
    });
    // 4. GENERATE JWT
    const token = jwt.sign(
      {
        id: record.Id,
        name: record.Name,
        email: record.Email__c,
        npiId: record.NPI_id__c,
        hospital_id: record.Id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ status: true, token, name: record.Name }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
