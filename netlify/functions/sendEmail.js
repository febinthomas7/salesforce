// require("dotenv").config();

// import fetch from "node-fetch";

export async function handler(event, context) {
  try {
    console.log("RAW EVENT BODY:", event.body);
    const { username, password } = JSON.parse(event.body || "{}");
    console.log(process.env.CONSUMER_KEY);
    if (!username || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Username & password required" }),
      };
    }

    const params = new URLSearchParams();
    params.append("grant_type", "password");
    params.append("client_id", process.env.CONSUMER_KEY);
    params.append("client_secret", process.env.CONSUMER_SECRET);
    params.append("username", username);
    params.append("password", password); // must include security token

    const res = await fetch(
      "https://login.salesforce.com/services/oauth2/token",
      {
        method: "POST",
        body: params,
      }
    );

    const data = await res.json();
    console.log(data);

    // OAuth success has "access_token" field
    if (data.access_token) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "OAuth Successful",
          access_token: data.access_token.substring(0, 25) + "...",
          instance_url: data.instance_url,
        }),
      };
    }

    // OAuth failed
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "OAuth Failed",
        salesforce_error: data.error_description || data.error,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
