// Supabase Edge Function: notify-consultation

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SLACK_WEBHOOK_URL = Deno.env.get('SLACK_WEBHOOK_URL')
const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER')
const ONCALL_PHONE_NUMBER = Deno.env.get('ONCALL_PHONE_NUMBER')

interface ConsultationPayload {
  type: 'INSERT'
  table: string
  record: {
    id: string
    person_id: string
    chief_complaint: string
    created_at: string
    status: string
  }
  old_record: null
}

serve(async (req) => {
  try {
    const payload: ConsultationPayload = await req.json()
    
    // Only process new consultations
    if (payload.type !== 'INSERT' || payload.table !== 'consultation_requests') {
      return new Response('Not a new consultation', { status: 200 })
    }

    const consultation = payload.record
    
    // Get patient details
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: person } = await supabase
      .from('people')
      .select('first_name, last_name, date_of_birth')
      .eq('id', consultation.person_id)
      .single()

    // Calculate patient age
    const age = person?.date_of_birth 
      ? Math.floor((Date.now() - new Date(person.date_of_birth).getTime()) / 31557600000)
      : 'Unknown'

    const message = `🚨 *NEW CONSULTATION* 🚨
    
*Patient:* ${person?.first_name} ${person?.last_name} (${age} yo)
*Chief Complaint:* ${consultation.chief_complaint}
*Time:* ${new Date(consultation.created_at).toLocaleString('en-US', { 
  timeZone: 'America/New_York',
  dateStyle: 'short',
  timeStyle: 'short' 
})}
*Consultation ID:* ${consultation.id}

*View in MyERDoc:* https://myerdoc.com/clinician/workspace?id=${consultation.id}`

    // Send Slack notification
    if (SLACK_WEBHOOK_URL) {
      try {
        const slackResponse = await fetch(SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: message,
            blocks: [
              {
                type: 'header',
                text: {
                  type: 'plain_text',
                  text: '🚨 NEW CONSULTATION',
                  emoji: true
                }
              },
              {
                type: 'section',
                fields: [
                  {
                    type: 'mrkdwn',
                    text: `*Patient:*\n${person?.first_name} ${person?.last_name} (${age} yo)`
                  },
                  {
                    type: 'mrkdwn',
                    text: `*Time:*\n${new Date(consultation.created_at).toLocaleString('en-US', { 
                      timeZone: 'America/New_York',
                      dateStyle: 'short',
                      timeStyle: 'short' 
                    })}`
                  }
                ]
              },
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `*Chief Complaint:*\n${consultation.chief_complaint}`
                }
              },
              {
                type: 'actions',
                elements: [
                  {
                    type: 'button',
                    text: {
                      type: 'plain_text',
                      text: '📋 View Consultation',
                      emoji: true
                    },
                    url: `https://myerdoc.com/clinician/workspace?id=${consultation.id}`,
                    style: 'primary'
                  }
                ]
              }
            ]
          })
        })

        if (!slackResponse.ok) {
          console.error('Slack notification failed:', await slackResponse.text())
        }
      } catch (error) {
        console.error('Error sending Slack notification:', error)
      }
    }

    // Send SMS via Twilio (backup notification)
    if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER && ONCALL_PHONE_NUMBER) {
      try {
        const smsBody = `NEW CONSULTATION\nPatient: ${person?.first_name} ${person?.last_name} (${age})\nChief Complaint: ${consultation.chief_complaint}\nView: https://myerdoc.com/clinician/workspace?id=${consultation.id}`
        
        const twilioAuth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)
        
        const twilioResponse = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${twilioAuth}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              To: ONCALL_PHONE_NUMBER,
              From: TWILIO_PHONE_NUMBER,
              Body: smsBody,
            }),
          }
        )

        if (!twilioResponse.ok) {
          console.error('Twilio SMS failed:', await twilioResponse.text())
        }
      } catch (error) {
        console.error('Error sending SMS notification:', error)
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Notifications sent' }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in notify-consultation function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
