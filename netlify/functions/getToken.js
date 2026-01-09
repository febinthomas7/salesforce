let sfTokenCache = {
  access_token: null,
  instance_url: null,
  expires_at: 0,
};

export async function getSfAccessToken() {
  const now = Date.now();

  // ✅ Return cached token if still valid
  if (sfTokenCache.access_token && sfTokenCache.expires_at > now) {
    return sfTokenCache;
  }

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
    throw new Error(
      data.error_description || "Unable to obtain Salesforce access token"
    );
  }

  // 🔥 Cache token (Salesforce tokens usually valid ~2 hours)
  sfTokenCache = {
    access_token: data.access_token,
    instance_url: data.instance_url,
    expires_at: now + 1000 * 60 * 90, // 90 minutes
  };

  return sfTokenCache;
}
