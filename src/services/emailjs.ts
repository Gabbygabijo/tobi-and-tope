import emailjs from '@emailjs/browser'

export interface RSVPFormData {
  guestName: string
  attending: 'yes' | 'no'
  guestCount: string
  message: string
}

export interface SendEmailResponse {
  success: boolean
  message?: string
}

/**
 * Checks if all required EmailJS environment variables are configured.
 */
export const isEmailJSConfigured = (): boolean => {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

  return Boolean(serviceId && templateId && publicKey)
}

/**
 * Sends RSVP details using @emailjs/browser.
 */
export const sendRSVPEmail = async (data: RSVPFormData): Promise<SendEmailResponse> => {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

  if (!serviceId || !templateId || !publicKey) {
    console.warn(
      '[EmailJS] Missing configuration: VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, or VITE_EMAILJS_PUBLIC_KEY.'
    )
    throw new Error(
      'Email service is not configured yet. Please ensure your EmailJS credentials are set in .env or GitHub Secrets.'
    )
  }

  const templateParams = {
    guest_name: data.guestName,
    attending: data.attending === 'yes' ? 'Joyfully Accept' : 'Regretfully Decline',
    guest_count: data.attending === 'yes' ? data.guestCount : '0',
    message: data.message.trim() || 'No personal note provided',
    submission_date: new Date().toLocaleString('en-US', {
      timeZone: 'Africa/Lagos',
      dateStyle: 'full',
      timeStyle: 'short',
    }),
    // Standard template aliases for flexibility
    from_name: data.guestName,
    to_name: 'Oluwatobi & Temitope',
  }

  try {
    await emailjs.send(serviceId, templateId, templateParams, {
      publicKey,
    })
    return { success: true }
  } catch (err: unknown) {
    console.error('[EmailJS Error]:', err)
    
    // Check if error is from EmailJS response
    const errObj = err as { text?: string; message?: string; status?: number }
    const rawError = errObj?.text || errObj?.message || ''

    if (rawError.includes('Invalid grant') || rawError.includes('reconnect your Gmail')) {
      throw new Error(
        'Email service authorization expired. Please reconnect your Gmail account in the EmailJS dashboard under Email Services.',
        { cause: err }
      )
    }

    throw new Error(
      rawError || 'Unable to submit RSVP at this time. Please try again or message the couple directly.',
      { cause: err }
    )
  }
}
