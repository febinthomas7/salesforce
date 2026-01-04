import { v2 as cloudinary } from "cloudinary";
import busboy from "busboy";
import { getSfAccessToken } from "./getToken";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function handler(event) {
  return new Promise((resolve) => {
    const bb = busboy({
      headers: event.headers || event.multiValueHeaders,
    });

    let fields = {};
    let fileBuffer;

    bb.on("file", (_, file, info) => {
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
        if (!fileBuffer) {
          return resolve({
            statusCode: 400,
            body: JSON.stringify({ error: "File is required" }),
          });
        }

        // 1️⃣ Upload to Cloudinary
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "patient-reports" },
          async (error, result) => {
            if (error) {
              return resolve({
                statusCode: 500,
                body: JSON.stringify({ error: error.message }),
              });
            }

            // 2️⃣ Salesforce Auth
            const { access_token, instance_url } = await getSfAccessToken();

            //static add for perticular pateint, Doctor, Hospital 
            const TEST_PATIENT_ID = "a00NS00002UwgpPYAR";
            const TEST_DOCTOR_ID = "a01NS00002FomqzYAB";
            const TEST_HOSPITAL_ID = "a04NS00000RN26PYAT";

            // 3️⃣ Create Report__c
            const sfBody = {
              Patient__c: TEST_PATIENT_ID, // Hardcoded for your test patient
              Doctor__c: TEST_DOCTOR_ID, // Hardcoded for your test doctor
              Hospital__c: TEST_HOSPITAL_ID, // Hardcoded for your test hospital
              Title__c: fields.title || "Medical Report",
              URL__c: result.secure_url,
              Category__c: fields.category,
              Notes__c: fields.description,
              Date_of_expire__c: fields.expiryDate || null,
              Date_of_issue__c: new Date().toISOString().split("T")[0],
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

            resolve({
              statusCode: 200,
              body: JSON.stringify({
                message: "Report uploaded successfully",
              }),
            });
          }
        );

        uploadStream.end(fileBuffer);
      } catch (err) {
        resolve({
          statusCode: 500,
          body: JSON.stringify({ error: err.message }),
        });
      }
    });

    bb.end(Buffer.from(event.body, "base64"));
  });
}
