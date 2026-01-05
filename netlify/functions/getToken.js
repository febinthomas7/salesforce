export async function getSfAccessToken() {
  try {
    const params = new URLSearchParams();
    params.append("grant_type", "password");
    params.append("client_id", process.env.CONSUMER_KEY);
    params.append("client_secret", process.env.CONSUMER_SECRET);
    params.append("username", process.env.USER_NAME);
    params.append("password", process.env.PASSWORD); 

    const res = await fetch(
      "https://login.salesforce.com/services/oauth2/token",
      {
        method: "POST",
        body: params,
      }
    );

    const data = await res.json();

    if (!data.access_token) {
      throw new Error(data.error_description || "Unable to obtain Salesforce access token");
    }

    // Successfully return the credentials
    return {
      access_token: data.access_token,
      instance_url: data.instance_url,
    };
  } catch (err) {
    // 🔹 CRITICAL: Throw the error so the calling function knows it failed
    throw err; 
  }
}