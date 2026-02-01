
import { supabase } from '../supabase';

export interface ReminderResult {
  sentCount: number;
  failedCount: number;
  logs: string[];
}

/**
 * This logic simulates what would run in a Supabase Edge Function (Cron Job).
 * It identifies appointments in the next 24-48 hours and "sends" WhatsApp messages.
 */
export const processAppointmentReminders = async (organizationId: string): Promise<ReminderResult> => {
  const result: ReminderResult = { sentCount: 0, failedCount: 0, logs: [] };

  try {
    // 1. Fetch Clinic Settings to verify WhatsApp is enabled
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('name, settings')
      .eq('id', organizationId)
      .single();

    if (orgError || !org?.settings?.whatsappEnabled) {
      result.logs.push("WhatsApp reminders are disabled for this clinic.");
      return result;
    }

    // 2. Calculate Date Range (Next 24 to 48 hours)
    const today = new Date();
    const startRange = new Date(today);
    startRange.setDate(today.getDate() + 1);
    const endRange = new Date(today);
    endRange.setDate(today.getDate() + 2);

    const startDateStr = startRange.toISOString().split('T')[0];
    const endDateStr = endRange.toISOString().split('T')[0];

    // 3. Fetch Pending Appointments
    const { data: appointments, error: apptError } = await supabase
      .from('appointments')
      .select(`
        id,
        date,
        time,
        reason,
        doctorName,
        patient:patients (full_name, phone)
      `)
      .eq('organization_id', organizationId)
      .gte('date', startDateStr)
      .lte('date', endDateStr)
      .eq('status', 'Scheduled');

    if (apptError) throw apptError;
    if (!appointments || appointments.length === 0) {
      result.logs.push("No upcoming appointments found in the 24-48h window.");
      return result;
    }

    // 4. Process Batch
    for (const appt of appointments) {
      const patient = (appt as any).patient;
      if (!patient?.phone) {
        result.logs.push(`Skipped ${patient?.full_name}: No phone number.`);
        result.failedCount++;
        continue;
      }

      // Format Message Template
      const message = `*OmniClinic Reminder*\n\n` +
        `Hello ${patient.full_name},\n` +
        `This is a reminder for your appointment at *${org.name}*.\n\n` +
        `📅 *Date:* ${appt.date}\n` +
        `⏰ *Time:* ${appt.time}\n` +
        `👨‍⚕️ *Doctor:* ${appt.doctorName || 'General Practitioner'}\n` +
        `📝 *Reason:* ${appt.reason}\n\n` +
        `Please arrive 15 minutes early. Reply to this message if you need to reschedule.`;

      // Simulating WhatsApp API Call (e.g. Twilio, Infobip)
      console.log(`[WhatsApp API] Sending to ${patient.phone}:`, message);
      
      // Update appointment to prevent double-reminding (Optional: requires field in schema)
      // await supabase.from('appointments').update({ reminder_sent: true }).eq('id', appt.id);
      
      result.sentCount++;
      result.logs.push(`Successfully reminded ${patient.full_name}.`);
    }

    return result;
  } catch (err: any) {
    console.error("Reminder Processing Error:", err);
    result.logs.push(`Error: ${err.message}`);
    return result;
  }
};
