const IS_MOCK = process.env.SMS_MOCK !== 'false';
const AT_USERNAME = process.env.AT_USERNAME || '';
const AT_API_KEY = process.env.AT_API_KEY || '';

export const sendSms = async (to, message) => {
  if (IS_MOCK || !AT_API_KEY) {
    console.log(`[SMS MOCK] To: ${to} — "${message}"`);
    return { success: true, mock: true };
  }

  const form = new URLSearchParams({
    username: AT_USERNAME,
    to: to.replace(/^0+/, '254'),
    message,
    from: process.env.AT_FROM || 'AGRICYCLE',
  });

  try {
    const res = await fetch('https://api.africastalking.com/version1/messaging', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        apiKey: AT_API_KEY,
      },
      body: form,
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('[SMS] Error:', err.message);
    return { success: false, error: err.message };
  }
};

export const sendOtp = async (phone, otp) => {
  return sendSms(phone, `AgriCycle: Your delivery confirmation OTP is ${otp}. Share this only with your courier upon receiving your goods.`);
};
