import https from 'https';

const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || 'mock_key';
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || 'mock_secret';
const PASSKEY = process.env.MPESA_PASSKEY || 'mock_passkey';
const SHORTCODE = process.env.MPESA_SHORTCODE || '174379';
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL || 'https://yourdomain.com/api/payments/mpesa-callback';
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

const getAccessToken = () => {
  return new Promise((resolve, reject) => {
    if (IS_MOCK) return resolve('mock_access_token');

    const auth = Buffer.from(CONSUMER_KEY + ':' + CONSUMER_SECRET).toString('base64');
    const req = https.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      { headers: { Authorization: 'Basic ' + auth } },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data).access_token);
          } catch {
            reject(new Error('Failed to get access token'));
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
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
    AccountReference: `UZAMALI-${orderId.slice(-6)}`,
    TransactionDesc: 'UzaMali Produce Order Payment',
  };

  return new Promise((resolve, reject) => {
    const req = https.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      { headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' } },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            reject(new Error('STK Push failed'));
          }
        });
      }
    );
    req.write(JSON.stringify(payload));
    req.end();
  });
};

export const b2cPayout = async (phone, amount, orderId, reason = 'BusinessPayment') => {
  if (IS_MOCK) {
    console.log(`[MPESA MOCK] B2C Payout to ${phone}: KES ${amount} (order ${orderId})`);
    return { success: true, mock: true, orderId };
  }

  const token = await getAccessToken();
  const timestamp = getTimestamp();
  const password = getPassword();

  const payload = {
    InitiatorName: process.env.MPESA_INITIATOR || 'testapi',
    SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL || '',
    CommandID: reason,
    Amount: Math.round(amount),
    PartyA: SHORTCODE,
    PartyB: phone.replace(/^0+/, '254'),
    Remarks: `AgriCycle payout order ${orderId}`,
    QueueTimeOutURL: CALLBACK_URL.replace('callback', 'timeout'),
    ResultURL: CALLBACK_URL.replace('callback', 'result'),
    Occasion: 'AgriCycle',
  };

  return new Promise((resolve, reject) => {
    const req = https.post(
      'https://sandbox.safaricom.co.ke/mpesa/b2c/v3/paymentrequest',
      { headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' } },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            reject(new Error('B2C failed'));
          }
        });
      }
    );
    req.write(JSON.stringify(payload));
    req.end();
  });
};
