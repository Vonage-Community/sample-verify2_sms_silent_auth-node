import axios from 'axios';
import { tokenGenerate } from '@vonage/jwt';

import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import fs from 'fs';
const privateKeyPath = path.join(process.env.VONAGE_PRIVATE_KEY_PATH);
const privateKey = fs.readFileSync(privateKeyPath, 'utf8').toString();

export const smsIndex = (req, res) => {
  const request_id = req.cookies.request_id;
  if (request_id) {
    res.render('sms', { request_id: request_id, notice: 'Request already in progress.' });
  } else {
    res.render('sms');
  }
};

export const smsStart = async (req, res) => {
  const { number } = req.body;
  if (!number) {
    res.render('sms', { error: 'Phone number is required' });
    return;
  }
  const jwtToken = tokenGenerate(process.env.VONAGE_APPLICATION_ID, privateKey);

  try {
    const { data } = await axios.post(
      'https://api.nexmo.com/v2/verify',
      {
        brand: 'VonageDemo',
        workflow: [{ channel: "sms", to: number }]
      },
      {
        headers: { 'Authorization': `Bearer ${jwtToken}` }
      },
    );

    if (data.request_id === null) {
      res.render('sms', { error: data.detail || "Error sending SMS" });
    } else {
      res.cookie('request_id', data.request_id);
      res.render('sms', { request_id: data.request_id, notice: 'SMS sent!' });
    }
  } catch (error) {
    res.render('sms', { error: error.response.data.detail || error.message });
  }
};

export const smsCheck = async (req, res) => {
  // res.clearCookie('request_id');

  const { request_id, code } = req.body;
  if (!request_id || !code) {
    res.render('sms', { error: 'Request ID and code are required' });
    return;
  }
  const jwtToken = tokenGenerate(process.env.VONAGE_APPLICATION_ID, privateKey);

  try {

    const { data } = await axios.post(
      `https://api.nexmo.com/v2/verify/${request_id}`,
      { code: code },
      {
        headers: { 'Authorization': `Bearer ${jwtToken}` }
      },
    );

    if (data.status) {
      res.clearCookie('request_id');
      res.render('sms', { notice: 'Code is correct - Authorised!', logged_in: true });
    } else {
      res.render('sms', { error: data.error_text || "Error checking code" });
    }
  }

  catch (error) {
    res.clearCookie('request_id');
    res.render('sms', { error: error.data.details || error.message });
  }
}
