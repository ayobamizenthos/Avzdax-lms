const endpoint = "https://api.resend.com/emails";

type EmailInput = {
  to: string[];
  subject: string;
  heading: string;
  message: string;
  href?: string;
};

function template(heading: string, message: string, href?: string) {
  const button = href
    ? `<a href="https://lms.avzdax.com${href}" style="display:inline-block;margin-top:20px;padding:12px 22px;background:#111318;color:#ffffff;border-radius:10px;text-decoration:none;font-weight:600">Open in the academy</a>`
    : "";
  return `<div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px;color:#16181d">
    <p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#7c828f;margin:0">Avzdax Academy</p>
    <h1 style="font-size:22px;margin:16px 0 8px">${heading}</h1>
    <p style="font-size:15px;line-height:1.6;color:#4a4f5a;margin:0">${message}</p>
    ${button}
    <p style="font-size:12px;color:#7c828f;margin-top:28px">You're receiving this because you're a member of the Avzdax Academy cohort.</p>
  </div>`;
}

export async function sendEmail({ to, subject, heading, message, href }: EmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || to.length === 0) return;

  const from = process.env.EMAIL_FROM ?? "Avzdax Academy <onboarding@resend.dev>";

  try {
    await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html: template(heading, message, href),
      }),
    });
  } catch {
    return;
  }
}
