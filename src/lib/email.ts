export async function sendTransactionalEmail({ to, subject, html, text }: { to: string; subject: string; html?: string; text?: string }) {
  const apiKey = process.env.SENDGRID_API_KEY
  const from = process.env.SENDGRID_FROM
  if (!apiKey || !from) throw new Error('SendGrid not configured')

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: from },
      subject,
      content: [
        ...(text ? [{ type: 'text/plain', value: text }] : []),
        ...(html ? [{ type: 'text/html', value: html }] : []),
      ],
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`SendGrid error: ${res.status} ${body}`)
  }

  return true
}
