const API_BASE = process.env.NEXT_PUBLIC_BASE_URL;

export interface SubscribePayload {
  email: string;
}

export async function subscribeToNewsletter(payload: SubscribePayload) {
  const res = await fetch(`${API_BASE}/newsletter/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || json?.success === false) {
    // Nest validation errors can return message as an array
    const message = Array.isArray(json?.message) ? json.message[0] : json?.message;
    throw new Error(message ?? `Subscription failed (${res.status})`);
  }

  return json;
}