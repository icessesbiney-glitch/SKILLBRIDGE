/**
 * Maps Ghanaian Mobile Money telecom operators to their official bank routing codes
 * used by Paystack for real-time mobile vault disbursements.
 */
export function getTelecomBankCode(provider: string): string {
  const cleanProvider = provider.toLowerCase().trim();
  
  switch (cleanProvider) {
    case "mtn":
    case "mtn_momo":
      return "MTN"; // MTN Mobile Money Bank Code
    case "vod":
    case "vodafone":
    case "telecel":
      return "VOD"; // Telecel / Vodafone Cash Bank Code
    case "tgo":
    case "airteltigo":
      return "ATL"; // AirtelTigo Money Bank Code
    default:
      throw new Error(`Unsupported Ghanaian telecom network operator: ${provider}`);
  }
}
