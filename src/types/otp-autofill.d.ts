interface OTPCredential extends Credential {
  code: string;
}

interface OTPCredentialRequestOptions {
  otp: {
    transport: string[];
  };
}

interface CredentialRequestOptions {
  otp?: OTPCredentialRequestOptions["otp"];
}
