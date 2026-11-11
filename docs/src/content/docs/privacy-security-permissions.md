---
title: Privacy, security & permissions
description: How SynDiary handles your data, what stays private, and the permissions it asks for.
status: in-review
platforms: [ios, android]
---

SynDiary stores your content on your device by default. Your data lives in a database that's encrypted at rest by default, there's no account and no registration, and the SynDiary team runs no server that receives your content. The team can't read or recover your data because it never reaches them.

A short list of clearly marked, optional features can send data off your device. This page walks through each one: what triggers it, what's involved, and how to turn it off.

## What stays on your device

By default, nothing you write leaves your device. That includes:

- Entries, notes, moods, and anything else you write.
- Anything you import from Instagram or Facebook export archives, or from a calendar.
- Photos, audio recordings, and other media you attach.
- Your settings and preferences.

Imports are processed entirely on your device. Instagram and Facebook archive imports read the export file you already downloaded and never connect to Instagram or Facebook. See [Managing your data](/managing-your-data/) for import instructions.

## What can leave your device, and when

Each of the following is off by default, happens only when you take a clear action, or both. Nothing else leaves your device.

### Cloud AI (optional, your own key)

SynDiary's AI features run on your device by default. If you'd rather use a cloud model, you can connect your own API key for a supported provider: Google Gemini, OpenAI, or Anthropic for chat, and OpenAI or Deepgram for voice transcription.

Cloud AI stays off until you turn it on. Once it's on, the messages, personal context, or audio you submit go to your chosen provider, processed under that provider's own terms, using your key. The app shows an in-session notice when this happens and keeps a persistent "Cloud AI on" indicator visible while a cloud route is active. Turn cloud AI off any time in Settings to return to on-device processing.

### AI model downloads

If you download an on-device AI model, the app fetches the model files from Hugging Face's content delivery network. This is a standard web download that you start yourself. None of your content is transmitted, only the model files, though the file host, like any website you visit, sees your IP address.

### Calendar feed sync

If you add a Google Calendar feed by URL, the app periodically fetches that feed so your events show up in your timeline. The request goes directly from your device to the calendar host, which sees standard web-request metadata. Importing from your device calendar or from a calendar file is different: those are read locally, with no network access.

### AI assistant response reports

If the AI assistant produces a response you consider harmful, inaccurate, or inappropriate, you can report it. We process reports to review and improve AI content safety, keep the reporting service functional and abuse-resistant, and provide related support when needed. Reports are never used for advertising or profiling.

Before anything is sent, the app shows a confirmation preview with the exact response and the category you picked. Only four fields are submitted: the assistant response, one allowed report category (for example, `harmful` or `misleading`), a random `AIR-…` reference, and the submission time. Your prompt, conversation history, AI memories, API key, and device identifiers are never included.

Reports are sent over HTTPS to the SynDiary website service hosted by Netlify. Like any web request, this exposes your IP address and standard request metadata to the host; this is used for transport and abuse protection (including rate limiting). Each accepted report gets an expiry timestamp 89 days after receipt, and a daily purge removes expired records, so automatic deletion happens within up to 24 hours after expiry (no later than about 90 days after receipt). To delete a report sooner, email [info@syndiary.com](mailto:info@syndiary.com) with the `AIR-…` reference shown after submission — no account or personal details needed.

### App update check

On mobile, the app checks at most every six hours whether the installed version is still current, by fetching a small static file from [www.syndiary.com](https://www.syndiary.com). The request carries no identifiers and no cookies, though like any web request it reveals your IP address, and the web host learns that the app launched. It's an anonymous check, not a tracking call.

### Backup files and sharing

Creating a backup writes an unencrypted file outside the app's encrypted storage. **Save to device** lets you choose a location, and **Share** uses your phone's sharing options. If you choose a cloud folder, another app, or a recipient, the export goes to that destination. Check the destination and protect the file before continuing.

### Feedback

Nothing is sent automatically. If you choose to send feedback, the app opens your email client with an editable diagnostic summary. It reaches the team only after you review it and hit send.

### Analytics

Analytics is opt-in and off by default. If you turn it on, the app records anonymized usage events such as screens visited and feature counters, never your content. In the current version, these events stay on your device and aren't transmitted anywhere.

## Website analytics

The main website and this documentation portal use Umami at [analytics.openadviser.com](https://analytics.openadviser.com) to measure visits and see which pages are useful. Page views send the page address and title, referrer, browser language, and screen size. URL query strings and fragments are removed from page addresses and referrers before sending. Like any web request, the analytics service receives your IP address and standard request metadata.

This setup uses no analytics cookies, advertising identifiers, session recordings, or heatmaps. It does not collect form contents or data stored in the SynDiary app. Enable Do Not Track in your browser to stop analytics collection. These website measurements are separate from the app's optional on-device analytics described above.

## Permissions

SynDiary may ask for a few device permissions, each for a local purpose. You can revoke any of them at any time in your device settings.

- **Microphone:** for recording voice notes; transcription happens on device by default.
- **Calendar:** to bring your device calendar events into your timeline, locally.
- **Photos / files:** to attach media and to read archive files you import, locally.
- **Notifications** (if offered): scheduled on the device.

## Staying in control

You can edit or delete individual entries, or use **Settings → Back up & Restore → Erase everything**. Save and check a backup first. Erasing app data or uninstalling SynDiary does not delete copies you saved or shared elsewhere.

[Backup files](/managing-your-data/back-up-and-restore/) are unencrypted ZIP or JSON exports, even when your on-device storage is encrypted. ZIP backups can include original photos and audio; JSON exports contain references without those files. Read the security notice, protect the export, and keep a copy away from your phone.

If your encrypted storage uses a recovery code, keep it somewhere safe and separate from your phone. It can unlock existing encrypted storage, but cannot replace a missing backup. Recovery codes are not included in exports, and the SynDiary team cannot retrieve your code or a lost backup for you.

:::note
SynDiary is under active development. Details may shift between releases.
:::

This page explains SynDiary's privacy behavior in plain language. The binding documents are the [Privacy Policy](https://www.syndiary.com/privacy-policy.html) and [Terms of Service](https://www.syndiary.com/terms-of-service.html) on the main site. Questions? Reach the team at [info@syndiary.com](mailto:info@syndiary.com).
