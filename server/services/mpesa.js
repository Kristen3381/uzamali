import axios from 'axios';

const CONSUMER_KEY = (process.env.MPESA_CONSUMER_KEY || 'mock_key').trim();
const CONSUMER_SECRET = (process.env.MPESA_CONSUMER_SECRET || 'mock_secret').trim();
const PASSKEY = (process.env.MPESA_PASSKEY || 'mock_passkey').trim();
const SHORTCODE = (process.env.MPESA_SHORTCODE || '174379').trim();
const CALLBACK_URL = (process.env.MPESA_CALLBACK_URL || 'https://yourdomain.com/api/payments/mpesa-callback').trim();
const IS_MOCK = process.env.MPESA_MOCK !== 'false';

const getTimestamp = () => {
  const d = new Date();
  return d.getFullYear().toString() +
    String(d.getMonth() + 1).padStart(2, '0') +
    String(d.getDate()).padStart(2, '0') +
    String(d.getHours()).padStart(2, '0') +
    String(d.getMinutes()).padStart(2, '0') +
    String(d.getSeconds()).padStart(2, '0');
};

const getPassword = () => {
  const timestamp = getTimestamp();
  return Buffer.from(SHORTCODE + PASSKEY + timestamp).toString('base64');
};

const getAccessToken = async () => {
  if (IS_MOCK) return 'mock_access_token';

  const auth = Buffer.from(CONSUMER_KEY + ':' + CONSUMER_SECRET).toString('base64');
  try {
    const { data } = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      { headers: { Authorization: `Basic ${auth}` } }
    );
    if (data.access_token) return data.access_token;
    throw new Error(data.errorMessage || 'Access token missing in response');
  } catch (err) {
    console.error('[Daraja OAuth Error]:', err.response?.data || err.message);
    throw new Error(err.response?.data?.errorMessage || err.message || 'Failed to authenticate with Safaricom');
  }
};

const formatPhone = (phone) => {
  if (!phone) return '254700000000';
  let cleaned = String(phone).replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.slice(1);
  } else if (!cleaned.startsWith('254') && cleaned.length === 9) {
    cleaned = '254' + cleaned;
  }
  return cleaned;
};

export const stkPush = async (phone, amount, orderId) => {
  if (IS_MOCK) {
    console.log(`[MPESA MOCK] STK Push to ${phone}: KES ${amount} (order ${orderId})`);
    return { success: true, mock: true, orderId };
  }

  const token = await getAccessToken();
  const timestamp = getTimestamp();
  const password = getPassword();

  const formattedPhone = formatPhone(phone);

  const payload = {
    BusinessShortCode: SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.max(1, Math.round(amount)),
    PartyA: formattedPhone,
    PartyB: SHORTCODE,
    PhoneNumber: formattedPhone,
    CallBackURL: CALLBACK_URL,
    AccountReference: `UZAMALI-${String(orderId).slice(-6)}`,
    TransactionDesc: 'UzaMali Produce Order Payment',
  };

  try {
    const { data } = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('[Daraja STK Push Response]:', data);
    return data;
  } catch (err) {
    console.error('[Daraja STK Push Request Error]:', err.response?.data || err.message);
    throw new Error(err.response?.data?.errorMessage || err.response?.data?.ResponseDescription || err.message);
  }
};

export const b2cPayout = async (phone, amount, orderId, reason = 'BusinessPayment') => {
  if (IS_MOCK) {
    console.log(`[MPESA MOCK] B2C Payout to ${phone}: KES ${amount} (order ${orderId})`);
    return { success: true, mock: true, orderId };
  }

  const token = await getAccessToken();

  const payload = {
    InitiatorName: process.env.MPESA_INITIATOR || 'testapi',
    SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL || '',
    CommandID: reason,
    Amount: Math.round(amount),
    PartyA: SHORTCODE,
    PartyB: formatPhone(phone),
    Remarks: `UzaMali payout order ${orderId}`,
    QueueTimeOutURL: CALLBACK_URL.replace('mpesa-callback', 'timeout'),
    ResultURL: CALLBACK_URL.replace('mpesa-callback', 'result'),
    Occasion: 'UzaMali',
  };

  try {
    const { data } = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/b2c/v3/paymentrequest',
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return data;
  } catch (err) {
    console.error('[Daraja B2C Error]:', err.response?.data || err.message);
    throw new Error(err.response?.data?.errorMessage || err.message);
  }
};

