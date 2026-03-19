import { NextResponse } from 'next/server'

// Vercel Cron: runs every hour
// vercel.json: { "crons": [{ "path": "/api/cron/sync", "schedule": "0 * * * *" }] }

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const response = await fetch(`${baseUrl}/api/feeds/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.CRON_SECRET}`,
    },
  })

  const result = await response.json()
  return NextResponse.json(result)
}
