import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface AttendanceLog {
  erpid: string
  // other fields
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const payload = await req.json()
    const record: AttendanceLog = payload.record

    // Get user with matching erpid
    const { data: user, error } = await supabase
      .from('users')
      .select('fcm_token')
      .eq('erpid', record.erpid)
      .single()

    if (error || !user?.fcm_token) {
      console.log('No FCM token found for erpid:', record.erpid)
      return new Response('No token', { status: 200 })
    }

    // Send notification using Firebase REST API
    const firebaseServerKey = Deno.env.get('FIREBASE_SERVER_KEY')!
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${firebaseServerKey}`
      },
      body: JSON.stringify({
        to: user.fcm_token,
        notification: {
          title: 'Attendance Logged',
          body: 'Your attendance has been recorded.'
        }
      })
    })

    if (!response.ok) {
      console.error('Failed to send notification:', await response.text())
    }

    return new Response('Notification sent', { status: 200 })
  } catch (error) {
    console.error('Error:', error)
    return new Response('Error', { status: 500 })
  }
})