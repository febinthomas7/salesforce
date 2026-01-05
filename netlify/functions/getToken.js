export async function getSfAccessToken() {
  try {
    const params = new URLSearchParams();
    params.append("grant_type", "password");
    params.append("client_id", process.env.CONSUMER_KEY);
    params.append("client_secret", process.env.CONSUMER_SECRET);
    params.append("username", process.env.USER_NAME);
    params.append("password", process.env.PASSWORD); // must include security token
    const res = await fetch(
      "https://login.salesforce.com/services/oauth2/token",
      {
        method: "POST",
        body: params,
      }
    );

    const data = await res.json();

    if (!data.access_token) {
      const err = new Error("Unable to obtain Salesforce access token");
      err.sf = data;
      throw err;
    }

    return {
      access_token: data.access_token,
      instance_url: data.instance_url,
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}