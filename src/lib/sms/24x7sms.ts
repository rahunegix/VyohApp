/**
 * 24x7SMS Integration — Saathini OTP
 * Docs: https://www.24x7sms.com/downloads/24X7SMS_http_API2.0.pdf
 */

export interface SMSResponse {
  success: boolean;
  message?: string;
  error?: string;
  msgId?: string;
  batchId?: string;
}

export function formatPhoneNumber(phone: string): string {
  let formatted = phone.replace(/[^0-9]/g, "");

  if (formatted.startsWith("00")) {
    formatted = formatted.substring(2);
  }

  formatted = formatted.replace(/^\+/, "");

  if (formatted.length === 10) {
    formatted = "91" + formatted;
  } else if (formatted.length === 11 && formatted.startsWith("0")) {
    formatted = "91" + formatted.substring(1);
  }

  return formatted;
}

const ERROR_MESSAGES: Record<string, string> = {
  "INVALID PARAMETERS": "Invalid SMS parameters. Check API key, phone, sender ID, and template.",
  "INVALID SenderID": "Sender ID is not approved for your account.",
  "Invalid APIKey": "Invalid SMS API key.",
  "INVALID username": "Invalid SMS credentials.",
  "INVALID password": "Invalid SMS credentials.",
  "INVALID Username or Password": "Invalid SMS API key.",
  "INSUFFICIENT_CREDIT": "Insufficient SMS credits.",
  "Template Does Not Match": "Message does not match approved DLT template.",
  "No Templates Approved": "No DLT templates approved on your account.",
  BLOCKED: "Phone number or country is blocked.",
};

function parseSmsResponse(trimmedResult: string): SMSResponse {
  if (
    trimmedResult.includes(":") &&
    !trimmedResult.toUpperCase().includes("INVALID")
  ) {
    const parts = trimmedResult.split(":");
    if (parts.length >= 3) {
      return {
        success: true,
        message: "SMS sent successfully",
        msgId: parts[0],
        batchId: parts[2],
      };
    }
  }

  const upper = trimmedResult.toUpperCase();
  for (const [key, msg] of Object.entries(ERROR_MESSAGES)) {
    if (upper.includes(key.toUpperCase())) {
      return { success: false, error: msg };
    }
  }

  return { success: false, error: trimmedResult || "Failed to send SMS" };
}

function getOtpMessage(otp: string): string {
  const template =
    process.env.SMS_OTP_TEMPLATE ??
    "<#>{#var#} is your Saathini login code. Valid for 10 minutes. Do not share it with anyone. - InfoTheme {#var#}";
  return template.replace(/\{#var#\}/g, otp);
}

export async function sendOTP(phone: string, otp: string): Promise<SMSResponse> {
  try {
    const apiKey = process.env.SMS_API_KEY;
    const senderId = process.env.SMS_SENDER_ID || "InfoTheme";
    const serviceName = process.env.SMS_SERVICE_NAME || "TEMPLATE_BASE";
    const dltTemplateId =
      process.env.SMS_DLT_TEMPLATE_ID || "1307173504924789355";
    const apiUrl = "https://smsapi.24x7sms.com/api_2.0/SendSMS.aspx";

    if (!apiKey) {
      return { success: false, error: "SMS service not configured: SMS_API_KEY missing" };
    }

    const formattedPhone = formatPhoneNumber(phone);
    const message = getOtpMessage(otp);
    const encodedMessage = encodeURIComponent(message);

    const url = `${apiUrl}?APIKEY=${apiKey}&MobileNo=${formattedPhone}&SenderID=${senderId}&Message=${encodedMessage}&ServiceName=${serviceName}&DLTTemplateID=${dltTemplateId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "text/plain" },
    });

    const result = (await response.text()).trim();
    return parseSmsResponse(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send SMS";
    return { success: false, error: message };
  }
}

export async function sendSMS(
  phone: string,
  message: string,
  serviceName = "PROMOTIONAL_HIGH"
): Promise<SMSResponse> {
  try {
    const apiKey = process.env.SMS_API_KEY;
    const senderId = process.env.SMS_SENDER_ID || "InfoTheme";
    const apiUrl = "https://smsapi.24x7sms.com/api_2.0/SendSMS.aspx";

    if (!apiKey) {
      return { success: false, error: "SMS service not configured" };
    }

    const formattedPhone = formatPhoneNumber(phone);
    const encodedMessage = encodeURIComponent(message);
    const url = `${apiUrl}?APIKEY=${apiKey}&MobileNo=${formattedPhone}&SenderID=${senderId}&Message=${encodedMessage}&ServiceName=${serviceName}`;

    const response = await fetch(url, { method: "GET" });
    return parseSmsResponse((await response.text()).trim());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send SMS";
    return { success: false, error: message };
  }
}
