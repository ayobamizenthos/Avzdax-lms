const base = "https://api.paystack.co";

type InitializeInput = {
  email: string;
  amountKobo: number;
  callbackUrl: string;
  metadata: Record<string, unknown>;
};

type InitializeResponse = {
  status: boolean;
  message: string;
  data?: { authorization_url: string; access_code: string; reference: string };
};

type VerifyResponse = {
  status: boolean;
  message: string;
  data?: {
    status: string;
    reference: string;
    amount: number;
    currency: string;
    customer: { email: string };
    metadata: Record<string, unknown> | null;
  };
};

function secret() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not set");
  return key;
}

export async function initializeTransaction(
  input: InitializeInput
): Promise<InitializeResponse> {
  const response = await fetch(`${base}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: input.amountKobo,
      callback_url: input.callbackUrl,
      metadata: input.metadata,
    }),
    cache: "no-store",
  });
  return response.json();
}

export async function verifyTransaction(
  reference: string
): Promise<VerifyResponse> {
  const response = await fetch(
    `${base}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${secret()}` },
      cache: "no-store",
    }
  );
  return response.json();
}

export const PLANS = {
  full: { label: "Full payment", amountKobo: 6_500_000, naira: 65_000 },
  deposit: { label: "Commitment deposit", amountKobo: 2_500_000, naira: 25_000 },
  foundations: { label: "Foundations Programme fee", amountKobo: 3_500_000, naira: 35_000 },
} as const;

export type PlanKey = keyof typeof PLANS;
