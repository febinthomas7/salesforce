import crypto from "crypto";
import { getSfAccessToken } from "./getToken";

export async function handler(event) {
  try {
    if (!event.body) {
      return { statusCode: 400, body: JSON.stringify({ error: "No body" }) };
    }

    const { name, gmail, phone_no, adhaar_no, password } = JSON.parse(event.body);

    if (!name || !gmail || !adhaar_no || !password) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing fields" }) };
    }

    // 1. HASH THE PASSWORD BEFORE SENDING
    
    const hash = crypto.createHash('sha256').update(password).digest('hex');

    const { access_token, instance_url } = await getSfAccessToken();

    // 2. PREPARE SALESFORCE BODY
    
    const sfBody = {
      Name: name,
      Email__c: gmail,
      Phone__c: phone_no,
      Aadhaar_No__c: adhaar_no,
      Password_Hash__c: hash, 
    };

    const res = await fetch(
      `${instance_url}/services/data/v57.0/sobjects/Patient__c/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sfBody),
      }
    );

    const data = await res.json();

    if (res.status === 201 || data.id) {
      return { statusCode: 200, body: JSON.stringify({ status: true, id: data.id }) };
    }

    return { statusCode: 400, body: JSON.stringify({ status: false, error: data }) };
  } catch (err) {
    console.error("Signup error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}