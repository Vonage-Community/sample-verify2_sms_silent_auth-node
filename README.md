# Vonage Verify sample app - 2FA with SMS and SilentAuth

## How to use it

1. Clone this repository
2. Install dependencies: `npm install`
3. Create a `.env` file with your credentials (see `.env.example` for an example)
4. You will need to create a Vonage account, if you don't have have one already, via the [Vonage Dashboard](https://dashboard.nexmo.com)
5. Create a [Vonage application](https://dashboard.nexmo.com/applications) and store the generated `private.key` in the current folder. You can find more information about Vonage applications [here](https://developer.nexmo.com/concepts/guides/applications)
6. Add the `VONAGE_APPLICATION_ID` and `VONAGE_PRIVATE_KEY_PATH` to the `.env` file.
7. Run the app: `npm run watch`
8. Install ngrok or similar to expose your local server to the internet
9. Run ngrok: `ngrok http 3000`
10. Navigate to the ngrok URL in your mobile phone browser and make sure you are disconnected from any WiFi networks
11. Enter your phone number in either the '2FA via SMS' or 'Silent Auth' sections and click the 'Start' button
