import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import nodemailer       from 'npm:nodemailer'

const GMAIL_ADDRESS   = Deno.env.get('GMAIL_ADDRESS')!
const GMAIL_APP_PW    = Deno.env.get('GMAIL_APP_PASSWORD')!
const TECH_EMAILS     = (Deno.env.get('TECH_EMAIL') ?? '').split(',').map(e => e.trim()).filter(Boolean)

// ── Helpers ───────────────────────────────────────────────────────────────────

function toYMD(dt: Date): string {
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
}

function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour   = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

function formatDateLong(ymd: string): string {
  const [y, mo, d] = ymd.split('-').map(Number)
  return new Date(y, mo - 1, d).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}

// ── Email builder ─────────────────────────────────────────────────────────────

function buildEmail(order: any, patient: any, dateStr: string, timeStr: string, dayLabel: string): string {
  const patientName = patient
    ? `${patient.first_name} ${patient.last_name}`
    : order.patient_initials ?? 'Unknown'

  const dob   = patient?.date_of_birth ?? null
  const phone = patient?.phone         ?? null

  const isInsurance = patient?.insurance_type === 'Insurance'
  const insuranceRows = isInsurance ? `
    <tr>
      <td style="padding:4px 0;width:50%">
        <span style="font-size:11px;color:#94a3b8;display:block">Payer</span>
        <span style="font-size:14px;color:#1e293b;font-weight:500">${patient.payer_name ?? '—'}</span>
      </td>
      <td style="padding:4px 0">
        <span style="font-size:11px;color:#94a3b8;display:block">Member ID</span>
        <span style="font-size:14px;color:#1e293b;font-weight:500">${patient.member_id ?? '—'}</span>
      </td>
    </tr>
    <tr>
      <td style="padding:4px 0">
        <span style="font-size:11px;color:#94a3b8;display:block">Auth #</span>
        <span style="font-size:14px;color:#1e293b;font-weight:500">${order.auth_number ?? '—'}</span>
      </td>
      <td style="padding:4px 0">
        <span style="font-size:11px;color:#94a3b8;display:block">Verified</span>
        <span style="font-size:14px;color:#1e293b;font-weight:500">${order.insurance_verified ? '✓ Yes' : 'Pending'}</span>
      </td>
    </tr>` : `
    <tr>
      <td colspan="2" style="padding:4px 0">
        <span style="font-size:14px;color:#1e293b;font-weight:500">Self-Pay</span>
      </td>
    </tr>`

  const indicationRow = order.clinical_indication ? `
    <tr>
      <td colspan="2" style="padding:4px 0">
        <span style="font-size:11px;color:#94a3b8;display:block">Clinical Indication</span>
        <span style="font-size:14px;color:#1e293b;font-weight:500">${order.clinical_indication}</span>
      </td>
    </tr>` : ''

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;margin:0;padding:24px">
  <div style="background:white;border-radius:12px;border:1px solid #e2e8f0;max-width:540px;margin:0 auto;overflow:hidden">

    <div style="background:#1e293b;padding:20px 24px">
      <p style="margin:0;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;font-weight:600">
        Appointment ${dayLabel}
      </p>
      <h1 style="margin:6px 0 0;font-size:22px;color:white;font-weight:700">${patientName}</h1>
      <p style="margin:6px 0 0;font-size:14px;color:#94a3b8">${dateStr} &nbsp;·&nbsp; ${timeStr}</p>
    </div>

    <div style="padding:24px">

      <p style="margin:0 0 10px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.06em">Patient</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
        <tr>
          <td style="padding:4px 0;width:50%">
            <span style="font-size:11px;color:#94a3b8;display:block">Date of Birth</span>
            <span style="font-size:14px;color:#1e293b;font-weight:500">${dob ?? '—'}</span>
          </td>
          <td style="padding:4px 0">
            <span style="font-size:11px;color:#94a3b8;display:block">Phone</span>
            <span style="font-size:14px;color:#1e293b;font-weight:500">${phone ?? '—'}</span>
          </td>
        </tr>
      </table>

      <hr style="border:none;border-top:1px solid #f1f5f9;margin:0 0 20px">

      <p style="margin:0 0 10px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.06em">Exam</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
        <tr>
          <td colspan="2" style="padding:4px 0">
            <span style="font-size:11px;color:#94a3b8;display:block">Exam Type</span>
            <span style="font-size:14px;color:#1e293b;font-weight:500">${order.exam_type}</span>
          </td>
        </tr>
        ${indicationRow}
        <tr>
          <td colspan="2" style="padding:4px 0">
            <span style="font-size:11px;color:#94a3b8;display:block">Facility</span>
            <span style="font-size:14px;color:#1e293b;font-weight:500">${order.facility}</span>
          </td>
        </tr>
      </table>

      <hr style="border:none;border-top:1px solid #f1f5f9;margin:0 0 20px">

      <p style="margin:0 0 10px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.06em">Insurance</p>
      <table style="width:100%;border-collapse:collapse">
        ${insuranceRows}
      </table>

    </div>

    <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:12px 24px">
      <p style="margin:0;font-size:11px;color:#94a3b8">MobileOps &nbsp;·&nbsp; Divine Imaging ATL</p>
    </div>

  </div>
</body>
</html>`
}

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const now      = new Date()
  const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1)
  const in2days  = new Date(now); in2days.setDate(now.getDate() + 2)

  const batches = [
    { date: toYMD(in2days),  type: 'reminder_2day', label: 'in 2 Days' },
    { date: toYMD(tomorrow), type: 'reminder_1day',  label: 'Tomorrow'  },
  ]


  // Collect all emails to send before opening the SMTP connection
  const queue: { orderId: string; type: string; forDate: string; subject: string; html: string }[] = []

  for (const { date, type, label } of batches) {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, patients(first_name, last_name, date_of_birth, phone, insurance_type, payer_name, member_id)')
      .eq('date', date)
      .eq('status', 'Scheduled')
      .is('archived_at', null)

    if (error) { console.error('fetch error:', error); continue }
    if (!orders?.length) continue

    const { data: existing } = await supabase
      .from('notifications')
      .select('order_id')
      .in('order_id', orders.map((o: any) => o.id))
      .eq('type', type)
      .eq('for_date', date)

    const notifiedIds = new Set((existing ?? []).map((n: any) => n.order_id))

    for (const order of orders) {
      if (notifiedIds.has(order.id)) continue

      const patient = order.patients ?? null
      const timeStr = order.time ? formatTime(order.time) : 'Time TBD'
      const dateStr = formatDateLong(date)
      const name    = patient
        ? `${patient.first_name} ${patient.last_name}`
        : order.patient_initials ?? 'Patient'

      queue.push({
        orderId: order.id,
        type,
        forDate: date,
        subject: `Appointment ${label} — ${name} · ${timeStr}`,
        html:    buildEmail(order, patient, dateStr, timeStr, label),
      })
    }
  }

  if (queue.length === 0) {
    return new Response(JSON.stringify({ sent: 0 }), { headers: { 'Content-Type': 'application/json' } })
  }

  // Open one transporter and send all queued emails
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_ADDRESS,
      pass: GMAIL_APP_PW,
    },
  })

  let sent = 0

  for (const item of queue) {
    try {
      await transporter.sendMail({
        from:    GMAIL_ADDRESS,
        to:      TECH_EMAILS.join(','),
        subject: item.subject,
        html:    item.html,
      })
      sent++
      const { error: insertError } = await supabase
        .from('notifications')
        .insert({ order_id: item.orderId, type: item.type, for_date: item.forDate })
      if (insertError) {
        console.error(`Failed to log notification for order ${item.orderId}:`, JSON.stringify(insertError))
      } else {
        console.log(`Sent and logged ${item.type} for order ${item.orderId}`)
      }
    } catch (err) {
      console.error(`Failed to send for order ${item.orderId}:`, err)
    }
  }

  return new Response(JSON.stringify({ sent }), { headers: { 'Content-Type': 'application/json' } })
})
