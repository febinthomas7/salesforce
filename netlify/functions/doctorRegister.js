import crypto from "crypto";
import { getSfAccessToken } from "./getToken";

export async function handler(event) {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No body" }),
      };
    }

    const {
      name,
      email,
      phone_no,
      adhaar_no,
      password,
      date_of_birth,
      specialization,
      npi_id,
    } = JSON.parse(event.body);
    const id = "DOC" + Math.floor(Math.random() * 1000 + 100);
    // Simple unique ID generation

    if (
      !name ||
      !email ||
      !adhaar_no ||
      !password ||
      !specialization ||
      !npi_id
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing fields" }),
      };
    }

    // 1️⃣ HASH PASSWORD USING SHA-256
    const passwordHash = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    // 2️⃣ GET SALESFORCE ACCESS TOKEN
    const { access_token, instance_url } = await getSfAccessToken();

    // Static hospital assignment (change later if needed)
    const TEST_HOSPITAL_ID = "a04NS00000RN26PYAT";

    // 3️⃣ PREPARE SALESFORCE OBJECT (Doctor__c)
    const sfBody = {
      Hospital__c: TEST_HOSPITAL_ID,
      Name: name,
      Email__c: email,
      Phone_Number__c: phone_no,
      Aadhaar_No__c: adhaar_no,
      Password_Hash__c: passwordHash,
      Date_of_Birth__c: date_of_birth,
      Specialization__c: specialization,
      Doctor_Id__c: id,
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

    const data = await res.json();
    console.log("Salesforce response:", data);

    if (res.status === 201 || data.id) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          status: true,
          id: data.id,
          message: "Doctor registered successfully",
        }),
      };
    }

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
