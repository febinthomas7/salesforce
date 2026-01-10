import jwt from "jsonwebtoken";
import { getSfAccessToken } from "./getToken";
import { clearCache } from "./cache";

export async function handler(event) {
  try {
    // 1️⃣ AUTH CHECK
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

    if (!decoded?.id) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: "Unauthorized access" }),
      };
    }

    // 2️⃣ PARSE BODY
    const { data } = JSON.parse(event.body || "{}");
    console.log(data);

    // 3️⃣ SALESFORCE TOKEN
    const { access_token, instance_url } = await getSfAccessToken();

    // 4️⃣ UPDATE PATIENT__c
    const patientBody = {
      Name: data.name,
      Aadhaar_No__c: data.aadhaar,
      Phone__c: data.phone,
      Email__c: data.email,
      Password__c: data.password,
      Blood_Group__c: data.bloodGroup,
      Date_of_Birth__c: data.dob,
      Gender__c: data.gender,
      Photo__c: data.photo || null,
    };

    // Remove undefined values
    Object.keys(patientBody).forEach((key) => {
      if (
        patientBody[key] === "" ||
        patientBody[key] === null ||
        patientBody[key] === undefined
      ) {
        delete patientBody[key];
      }
    });
    const patientRes = await fetch(
      `${instance_url}/services/data/v57.0/sobjects/Patient__c/${decoded.id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patientBody),
      }
    );

    if (!patientRes.ok) {
      const err = await patientRes.json();
      throw new Error(err[0]?.message || "Failed to update patient");
    }

    // 5️⃣ CREATE Emergency_Contact__c
    if (data.ecName || data.ecPhone) {
      const emergencyBody = {
        Name: data.ecName,
        Relation__c: data.ecRelation,
        Phone_No__c: data.ecPhone,
        Email__c: data.ecEmail,
        Patient__c: decoded.id,
      };

      Object.keys(emergencyBody).forEach((key) => {
        if (
          emergencyBody[key] === "" ||
          emergencyBody[key] === null ||
          emergencyBody[key] === undefined
        ) {
          delete emergencyBody[key];
        }
      });

      const ecRes = await fetch(
        `${instance_url}/services/data/v57.0/sobjects/Emergency_Contact__c`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(emergencyBody),
        }
      );

      if (!ecRes.ok) {
        const err = await ecRes.json();
        throw new Error(
          err[0]?.message || "Failed to create emergency contact"
        );
      }
    }

    // 6️⃣ CLEAR CACHE
    // clearCache(`patient-${data.patientId}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: true,
        message: "Patient and emergency contact updated successfully",
      }),
    };
  } catch (err) {
    console.error("Update patient + emergency contact error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
