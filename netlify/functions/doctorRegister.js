import bcrypt from "bcryptjs";
import { getSfAccessToken } from "./getToken";

export async function handler(event) {
  try {
    if (!event.body) {
      return { statusCode: 400, body: JSON.stringify({ error: "No body" }) };
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
      id,
    } = JSON.parse(event.body);

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

    // Hash password
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);

    // Get access token
    const { access_token, instance_url } = await getSfAccessToken();

    //static add for perticular Hospital
    const TEST_HOSPITAL_ID = "a04NS00000RN26PYAT";

    // Prepare Salesforce object (Patient__c)
    const sfBody = {
      Hospital__c: TEST_HOSPITAL_ID,
      Name: name,
      Email__c: email,
      Phone_Number__c: phone_no,
      Aadhaar_No__c: adhaar_no,
      Password_Hash__c: hash,
      Date_of_Birth__C: date_of_birth,
      Specialization__C: specialization,
      Doctor_Id__C: id,
    };

    // Create record
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

    if (res.status === 201 || data.id) {
      return {
        statusCode: 200,
        body: JSON.stringify({ status: true, id: data.id }),
      };
    }

    // any SF error
    return {
      statusCode: 400,
      body: JSON.stringify({ status: false, error: data }),
    };
  } catch (err) {
    console.error("error:", err);
    const body = err.sf ? err.sf : { message: err.message };
    return { statusCode: 500, body: JSON.stringify({ error: body }) };
  }
}
