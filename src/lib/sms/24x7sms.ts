/**
 * 24x7SMS Integration — Saathini OTP
 * Docs: https://www.24x7sms.com/downloads/24X7SMS_http_API2.0.pdf
 */

import { getWebOtpOrigin } from "@/lib/auth/otp-autofill";

export interface SMSResponse {
  success: boolean;
  message?: string;
  error?: string;
  msgId?: string;
  batchId?: string;
}

export type OtpSmsClient = "web" | "android";

const SMS_OTP_TEXT =
  "{#var#} is your SAATHINI (Uttarakhandi Matrimonial & Dating Platform) login OTP code. Do not share this code with anyone. It is valid for 5 minutes. If you did not request this, please ignore this message. - Team SAATHINI";

/** Web — no `<#>` (Chrome WebOTP). Android — `<#>` for SMS Retriever. */
const SMS_OTP_BODY_WEB = SMS_OTP_TEXT;
const SMS_OTP_BODY_ANDROID = `<#>${SMS_OTP_TEXT}`;

/** GSM line break — some carriers merge `\n` into one line and break WebOTP. */
const SMS_ORIGIN_LINE_BREAK = "\r\n\r\n";

function fillOtpBody(template: string, otp: string): string {
  const marker = "{#var#}";
  const first = template.indexOf(marker);
  if (first === -1) return template;
  return template.slice(0, first) + otp + template.slice(first + marker.length);
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
  TEMPLATE_NOT_MATCHED: "Message does not match approved DLT template.",
  "No Templates Approved": "No DLT templates approved on your account.",
  BLOCKED: "Phone number or country is blocked.",
};

function parseSmsResponse(trimmedResult: string): SMSResponse {
  if (
    trimmedResult.includes(":") &&
    !trimmedResult.toUpperCase().includes("INVALID") &&
    !trimmedResult.toUpperCase().includes("TEMPLATE")
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

export function buildOtpMessage(otp: string, client: OtpSmsClient = "web"): string {
  const origin = getWebOtpOrigin() || "www.saathini.com";

  if (client === "android") {
    const androidHash = process.env.SMS_OTP_ANDROID_HASH?.trim() || otp;
    const body = fillOtpBody(SMS_OTP_BODY_ANDROID, otp);
    return `${body}${SMS_ORIGIN_LINE_BREAK}@${origin} #${androidHash}`;
  }

  const body = fillOtpBody(SMS_OTP_BODY_WEB, otp);
  return `${body}${SMS_ORIGIN_LINE_BREAK}@${origin} #${otp}`;
}

export async function sendOTP(
  phone: string,
  otp: string,
  client: OtpSmsClient = "web"
): Promise<SMSResponse> {
  try {
    const apiKey = process.env.SMS_API_KEY;
    const senderId = process.env.SMS_SENDER_ID || "SATINI";
    const serviceName = process.env.SMS_SERVICE_NAME || "TEMPLATE_BASE";
    const dltTemplateId =
      client === "web"
        ? process.env.SMS_DLT_WEB_TEMPLATE_ID?.trim() || process.env.SMS_DLT_TEMPLATE_ID
        : process.env.SMS_DLT_TEMPLATE_ID;
    const apiUrl =
      process.env.SMS_API_URL || "https://smsapi.24x7sms.com/api_2.0/SendSMS.aspx";

    if (!apiKey) {
      return { success: false, error: "SMS service not configured: SMS_API_KEY missing" };
    }

    if (!dltTemplateId) {
      return { success: false, error: "SMS service not configured: SMS_DLT_TEMPLATE_ID missing" };
    }

    const formattedPhone = formatPhoneNumber(phone);
    const message = buildOtpMessage(otp, client);

    const params = new URLSearchParams({
      APIKEY: apiKey,
      MobileNo: formattedPhone,
      SenderID: senderId,
      Message: message,
      ServiceName: serviceName,
      DLTTemplateID: dltTemplateId,
    });

    const response = await fetch(`${apiUrl}?${params.toString()}`, {
      method: "GET",
      headers: { "Content-Type": "text/plain" },
    });

    const result = (await response.text()).trim();
    const parsed = parseSmsResponse(result);
    if (process.env.NODE_ENV === "development") {
      console.info("[24x7SMS]", {
        client,
        phone: formattedPhone,
        dltTemplateId,
        serviceName,
        origin: client === "web" ? getWebOtpOrigin() : null,
        raw: result,
        parsed,
      });
    }
    return parsed;
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
    const senderId = process.env.SMS_SENDER_ID || "SATINI";
    const apiUrl =
      process.env.SMS_API_URL || "https://smsapi.24x7sms.com/api_2.0/SendSMS.aspx";

    if (!apiKey) {
      return { success: false, error: "SMS service not configured" };
    }

    const formattedPhone = formatPhoneNumber(phone);
    const params = new URLSearchParams({
      APIKEY: apiKey,
      MobileNo: formattedPhone,
      SenderID: senderId,
      Message: message,
      ServiceName: serviceName,
    });

    const response = await fetch(`${apiUrl}?${params.toString()}`, { method: "GET" });
    return parseSmsResponse((await response.text()).trim());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send SMS";
    return { success: false, error: message };
  }
}
