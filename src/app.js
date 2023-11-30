import dotenv from 'dotenv';
dotenv.config();

if (!process.env.VONAGE_APPLICATION_ID || !process.env.VONAGE_PRIVATE_KEY_PATH) {
  console.log('Please provide both VONAGE_APPLICATION_ID and VONAGE_PRIVATE_KEY_PATH environment variables.');
  process.exit(1);
}


import Express from 'express';
const app = Express();

import cookieParser from 'cookie-parser';
app.use(cookieParser());

app.set('view engine', 'ejs');
app.set('views', 'src/views');

app.use(Express.static('public'))

app.use(Express.urlencoded({ extended: true }));

app.get('/', (req, res) => { res.render('index') });

import { smsIndex, smsStart, smsCheck } from './routes/sms.js';
app.get('/sms', smsIndex);
app.use('/sms/start', smsStart);
app.use('/sms/check', smsCheck);


import { silentIndex, silentStart, silentCallback, silentCheck } from './routes/silent.js';
app.get('/silent', silentIndex);
app.use('/silent/start', silentStart);
app.use('/silent/callback', silentCallback);
app.use('/silent/check', silentCheck);


app.all('*', (req, res) => {
  res.status(404).json({
    status: 404,
    title: 'Not Found',
  });
});

app.use((err, req, res, next) => {
  res.status(500).json({
    status: 500,
    title: 'Internal Server Error',
    detail: err.message,
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App started on port ${port}`);
});

