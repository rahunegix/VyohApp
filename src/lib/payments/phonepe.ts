import crypto from "crypto";

export interface PhonePeConfig {
  merchantId: string;
  saltKey: string;
  saltIndex: number;
  env: "sandbox" | "production";
}

function getConfig(): PhonePeConfig | null {
  const merchantId = process.env.PHONEPE_MERCHANT_ID;
  const saltKey = process.env.PHONEPE_SALT_KEY;
  const saltIndex = Number(process.env.PHONEPE_SALT_INDEX || "1");
  if (!merchantId || !saltKey) return null;
  return {
    merchantId,
    saltKey,
    saltIndex,
    env: process.env.PHONEPE_ENV === "production" ? "production" : "sandbox",
  };
}

function baseUrl(env: PhonePeConfig["env"]) {
  return env === "production"
    ? "https://api.phonepe.com/apis/hermes"
    : "https://api-preprod.phonepe.com/apis/pg-sandbox";
}

export function generatePhonePeChecksum(payload: string, endpoint: string, config: PhonePeConfig) {
  const hash = crypto
    .createHash("sha256")
    .update(payload + endpoint + config.saltKey)
    .digest("hex");
  return `${hash}###${config.saltIndex}`;
}

export async function createPhonePePayment(params: {
  amountPaise: number;
  merchantTransactionId: string;
  userId: string;
  mobileNumber: string;
  redirectUrl: string;
  callbackUrl: string;
}) {
  const config = getConfig();
  if (!config) {
    return { success: false as const, error: "PhonePe not configured" };
  }

  const endpoint = "/pg/v1/pay";
  const payload = {
    merchantId: config.merchantId,
    merchantTransactionId: params.merchantTransactionId,
    merchantUserId: params.userId,
    amount: params.amountPaise,
    redirectUrl: params.redirectUrl,
    redirectMode: "REDIRECT",
    callbackUrl: params.callbackUrl,
    mobileNumber: params.mobileNumber.replace(/\D/g, "").slice(-10),
    paymentInstrument: { type: "PAY_PAGE" },
  };

  const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");
  const checksum = generatePhonePeChecksum(base64Payload, endpoint, config);

  const res = await fetch(`${baseUrl(config.env)}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
    },
    body: JSON.stringify({ request: base64Payload }),
  });

  const json = await res.json();
  if (!json.success) {
    return { success: false as const, error: json.message || "PhonePe payment failed" };
  }

  return {
    success: true as const,
    checkoutUrl: json.data?.instrumentResponse?.redirectInfo?.url as string,
    transactionId: params.merchantTransactionId,
  };
}

export function verifyPhonePeCallback(base64Response: string, receivedChecksum: string) {
  const config = getConfig();
  if (!config) return false;
  const expected = generatePhonePeChecksum(base64Response, "/pg/v1/status", config);
  return expected === receivedChecksum;
}

export function decodePhonePeResponse(base64Response: string) {
  return JSON.parse(Buffer.from(base64Response, "base64").toString("utf8"));
}
