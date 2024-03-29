import axios from 'axios';
import { tokenGenerate } from '@vonage/jwt';
import fs from 'fs';
import path from 'path';

import dotenv from 'dotenv';
dotenv.config();

const privateKeyPath = path.join(process.env.VONAGE_PRIVATE_KEY_PATH);
const privateKey = fs.readFileSync(privateKeyPath, 'utf8').toString();
const silentAuthChecks = [];

export const silentIndex = async (req, res) => {
  res.render('silent');
};

export const silentStart = async (req, res) => {
  const { number, redirect_url } = req.body;
  if (!number) {
    res.render('silent', { error: 'Phone number is required' });
    return;
  }
  const jwtToken = tokenGenerate(process.env.VONAGE_APPLICATION_ID, privateKey);

  try {
    const { data } = await axios.post(
      'https://api.nexmo.com/v2/verify',
      {
        brand: 'VonageDemo',
        workflow: [{ channel: "silent_auth", to: number, redirect_url: redirect_url || 'https://localhost:3000' }]
      },
      {
        headers: { 'Authorization': `Bearer ${jwtToken}` }
      },
    );

    if (!data.request_id || !data.check_url) {
      res.render('silent', { error: 'Something went wrong' });
      return;
    }

    const randomSilentAuthId = Math.random();
    silentAuthChecks.push({ 'id' : randomSilentAuthId, 'requestId' : data.request_id })
    res.cookie('session_data', randomSilentAuthId, {'maxAge' : 6000})
    res.redirect(data.check_url)
  } catch (error) {
    console.log(error);
    res.render('silent', { error: error.message });
  }
};

export const silentCallback = async (req, res) => {
  res.render('silent_callback');
};

export const silentCheck = async (req, res) => {
  const request_id = req.query.request_id;
  const sessionId = req.cookies.session_data;

  const { requestId } = silentAuthChecks.find(({ id }) => `${id}` === `${sessionId}`) || {}
  console.log(requestId, request_id);

  // XSS Check
  if (request_id !== requestId) {
    res.render('silent', {
      error: 'Something went wrong. Please try again. 1'
    });
    return;
  }

  const code = req.query.code;
  console.log('silentCheck', request_id, code);

  if (!code) {
    res.render('silent', {
      error: 'Something went wrong. Please try again.'
    });
    return;
  }
  
  const jwtToken = tokenGenerate(
    process.env.VONAGE_APPLICATION_ID,
    privateKey
  );

  try {
    const { data } = await axios.post(
      `https://api.nexmo.com/v2/verify/${request_id}`,
      { code: code },
      {
        headers: { 'Authorization': `Bearer ${jwtToken}` }
      },
    );

    if (data.status) {
      res.render('silent', {
        notice: 'Authorised!',
        logged_in: true,
      });
    } else {
      res.render('silent', {
        error: data.error_text || "Error checking code"
      });
    }
  }

  catch (error) {
    console.log(error);
    res.render('silent', {
      error: error.message
    });
  }

};