# WhatsApp booking setup (Meta WhatsApp Business API)

When a visitor submits the booking form, the website sends this message
straight to your WhatsApp number. The visitor doesn't need to open WhatsApp.

```
New Booking Request - TORQ
Name: Customer Name
Phone: 9876543210
Track: RC Racing Track
Date: 15 November 2026
Preferred Time: 4:00 PM - 6:00 PM

Please contact the customer to confirm the slot.
```

> Meta does not allow a message template to **end** with a filled-in value, so the
> last line ("Please contact the customer…") has to be there.

Until the steps below are done, the form still works. If sending fails, the visitor
sees a **Send on WhatsApp** button that opens WhatsApp with the same message.

---

## 1. Create the Meta app (about 15 minutes)

1. Go to <https://developers.facebook.com>, log in and click **My Apps → Create App**.
2. Choose **Business** as the type (or the "Connect with customers through WhatsApp" use case),
   and link or create your **Meta Business** account (TORQ).
3. Open the **API Setup** page. In the current dashboard it sits inside the use case:
   **Use cases** (left menu) → **Connect with customers through WhatsApp** → **Customize**
   → **Quickstart** → **Start using the API**. In older dashboards it's **WhatsApp → API Setup**.
4. Meta gives you a free **test sender number**. On the API Setup page:
   - Click **Generate access token** to get a 24-hour token for development (`WA_TOKEN`).
   - Copy the **Phone number ID**. This is `WA_PHONE_NUMBER_ID`.
   - Under **To**, add the business WhatsApp number that should receive bookings and verify it with the code WhatsApp sends.
     While testing, Meta only delivers to numbers you have verified like this.

## 2. Create the message template

1. Go to **WhatsApp Manager → Message templates → Create template**.
2. Fill in the template:
   - **Category:** Utility
   - **Name:** `new_booking_request`
   - **Language:** English (`en`)
3. Paste this as the **Body**:

   ```
   New Booking Request - TORQ
   Name: {{1}}
   Phone: {{2}}
   Track: {{3}}
   Date: {{4}}
   Preferred Time: {{5}}

   Please contact the customer to confirm the slot.
   ```
4. Add sample values (Customer Name, 9876543210, RC Racing Track, 15 November 2026,
   4:00 PM - 6:00 PM), then click **Submit**. Approval usually takes from a few minutes to a day.

## 3. Get a permanent access token

The token shown on the API Setup page expires after 24 hours. For the live site:

1. Go to **Business Settings → Users → System users → Add**, and set the role to Admin.
2. Click **Add assets**, choose your app and give it **full control**.
3. Click **Generate new token**, choose your app, and tick the
   `whatsapp_business_messaging` and `whatsapp_business_management` permissions.
4. Copy the token. This is `WA_TOKEN`. Keep it private and never put it in `config.js`.

## 4. Put the website on Netlify

The form sends through a small server function (`netlify/functions/booking.mjs`).
That keeps the token secret, which a plain HTML page can't do.

1. Create a free account at <https://app.netlify.com>.
2. Deploy this folder (**not** `_old-version`). Either:
   - push it to GitHub and choose **Add new site → Import an existing project**, or
   - install the Netlify CLI (`npm i -g netlify-cli`), then run `netlify deploy --prod` in this folder.

   Plain drag-and-drop does **not** include server functions, so use one of the two options above.
3. Go to **Site configuration → Environment variables** and add:

   | Key                  | Value                                        |
   |----------------------|----------------------------------------------|
   | `WA_TOKEN`           | the token from step 3                        |
   | `WA_PHONE_NUMBER_ID` | the Phone number ID from step 1              |
   | `WA_TO`              | `91XXXXXXXXXX` (business number that receives the bookings) |
   | `WA_TEMPLATE`        | `new_booking_request`                        |
   | `WA_TEMPLATE_LANG`   | `en`                                         |
   | `ALLOWED_ORIGIN`     | *(optional)* your site URL, e.g. `https://torq.netlify.app` |

4. Redeploy, then submit a test booking. The message should arrive on the business WhatsApp number you set in `WA_TO`.

## 5. Going live

- **Sender number:** the test number only sends to verified numbers. To send to any
  number, add your own business sender number in **WhatsApp Manager → Phone numbers**.
  That number can't also be used in the normal WhatsApp app. Then update `WA_PHONE_NUMBER_ID`.
- **Receiving number:** bookings go to `WA_TO` on Netlify. Make sure it is the business number
  (country code + number, digits only).
- **WhatsApp buttons:** these use the `TORQ_WHATSAPP` environment variable (or `whatsapp` in your
  local `config.js`). That number is used by the backup **Send on WhatsApp** button and all the
  other WhatsApp buttons.

## 6. Business details (phone, WhatsApp, Instagram, address)

These are kept **out of GitHub**. `config.js` is in `.gitignore`; on Netlify it is created at deploy
time by `scripts/make-config.mjs` from these environment variables:

| Key               | Example value                                 |
|-------------------|-----------------------------------------------|
| `TORQ_PHONE`      | `+91 98765 43210`                             |
| `TORQ_WHATSAPP`   | `919876543210` (country code + number)        |
| `TORQ_INSTAGRAM`  | `https://www.instagram.com/your_handle`       |
| `TORQ_CITY`       | `Kochi`                                       |
| `TORQ_ADDRESS`    | full street address                           |
| `TORQ_MAPS_QUERY` | *(optional)* what Google Maps searches for    |
| `TORQ_HOURS`      | *(optional)* `10:00 AM – 10:00 PM`            |

After changing any of them, trigger a redeploy (**Deploys → Trigger deploy**).

## If a message doesn't arrive

Open Netlify → **Logs → Functions → booking**. The WhatsApp API's error is printed there.
Common causes:
- **Template not approved yet**, or its name or language doesn't match.
- **Recipient not verified** while using the test sender number.
- **Token expired:** use the System User token from step 3.
- **API version:** Meta retires old versions over time. If a version error appears, set
  `WA_API_VERSION` (default `v23.0`) to the current version shown in your app dashboard.
