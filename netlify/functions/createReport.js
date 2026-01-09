import { v2 as cloudinary } from "cloudinary";
import busboy from "busboy";
import jwt from "jsonwebtoken";
import { getSfAccessToken } from "./getToken";
import { clearCache } from "./cache";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function handler(event) {
  return new Promise((resolve) => {
    // 1️⃣ AUTH
    const authHeader =
      event.headers.authorization || event.headers.Authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return resolve({
        statusCode: 401,
        body: JSON.stringify({ error: "Invalid authorization format" }),
      });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return resolve({
        statusCode: 401,
        body: JSON.stringify({ error: "Invalid token" }),
      });
    }

    // 2️⃣ PARSE MULTIPART FORM
    const bb = busboy({ headers: event.headers || event.multiValueHeaders });
    let fields = {};
    let fileBuffer = null;

    bb.on("file", (_, file) => {
      const chunks = [];
      file.on("data", (d) => chunks.push(d));
      file.on("end", () => {
        fileBuffer = Buffer.concat(chunks);
      });
    });

    bb.on("field", (name, val) => {
      fields[name] = val;
    });

    bb.on("finish", async () => {
      try {
        const { aadhaar, hospitalId } = fields;

        if (!aadhaar || !hospitalId || !fileBuffer) {
          return resolve({
            statusCode: 400,
            body: JSON.stringify({
              error: "aadhaar, hospitalId and file are required",
            }),
          });
        }

        // 3️⃣ SALESFORCE AUTH
        const { access_token, instance_url } = await getSfAccessToken();

        // 4️⃣ VERIFY PATIENT
        const patientSoql = `
          SELECT Id, Name
          FROM Patient__c
          WHERE Aadhaar_No__c='${aadhaar.replace(/'/g, "\\'")}'
          LIMIT 1
        `;

        const patientRes = await fetch(
          `${instance_url}/services/data/v57.0/query?q=${encodeURIComponent(
            patientSoql
          )}`,
          { headers: { Authorization: `Bearer ${access_token}` } }
        );

        const patientData = await patientRes.json();

        if (!patientData.records?.length) {
          return resolve({
            statusCode: 404,
            body: JSON.stringify({ error: "Patient not found" }),
          });
        }

        const patientId = patientData.records[0].Id;

        // 5️⃣ VERIFY HOSPITAL
        const hospitalSoql = `
          SELECT Id, Name ,Hospital__c
          FROM Doctor__c
          WHERE Id='${decoded.id.replace(/'/g, "\\'")}'
          LIMIT 1
        `;

        const hospitalRes = await fetch(
          `${instance_url}/services/data/v57.0/query?q=${encodeURIComponent(
            hospitalSoql
          )}`,
          { headers: { Authorization: `Bearer ${access_token}` } }
        );

        const hospitalData = await hospitalRes.json();

        if (!hospitalData.records?.length) {
          return resolve({
            statusCode: 404,
            body: JSON.stringify({ error: "Hospital not found" }),
          });
        }
        const hospitalRecordId = hospitalData.records[0].Hospital__c;

        // 6️⃣ UPLOAD TO CLOUDINARY
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "patient-reports",
            resource_type: "auto",
          },
          async (err, result) => {
            if (err) {
              return resolve({
                statusCode: 500,
                body: JSON.stringify({ error: err.message }),
              });
            }

            // 7️⃣ CREATE REPORT IN SALESFORCE
            const sfBody = {
              Patient__c: patientId,
              Hospital__c: hospitalRecordId,
              Doctor__c: decoded.id,
              Title__c: fields.title || "Medical Report",
              Category__c: fields.category || "General",
              Notes__c: fields.description || "",
              URL__c: result.secure_url,
              Date_of_issue__c: new Date().toISOString().split("T")[0],
              Date_of_expire__c: fields.expiryDate ? fields.expiryDate : null,
            };

            const sfRes = await fetch(
              `${instance_url}/services/data/v57.0/sobjects/Patient_Report__c`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${access_token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(sfBody),
              }
            );

            const sfData = await sfRes.json();

            if (!sfRes.ok) {
              return resolve({
                statusCode: 400,
                body: JSON.stringify(sfData),
              });
            }

            // ✅ CLEAR RELATED CACHES
            clearCache(`doctor-reports-${decoded.id}`);
            clearCache(`patient-reports-${patientId}`);
            clearCache(`hospital-reports-${hospitalRecordId}`);

            // 8️⃣ FINAL RESPONSE
            return resolve({
              statusCode: 200,
              body: JSON.stringify({
                success: true,
                reportId: sfData.id,
                fileUrl: result.secure_url,
                patientId,
                hospitalId,
              }),
            });
          }
        );

        uploadStream.end(fileBuffer);
      } catch (err) {
        return resolve({
          statusCode: 500,
          body: JSON.stringify({ error: err.message }),
        });
      }
    });

    bb.end(Buffer.from(event.body, "base64"));
  });
}
