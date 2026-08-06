---
title: Privacy, security & permissions
description: How SynDiary handles your data, what stays private, and the permissions it asks for.
status: in-review
platforms: [ios, android]
---

Everything you put into SynDiary stays on your device. Your data lives in a database that's encrypted at rest by default, there's no account and no registration, and the SynDiary team runs no server that receives your content. The team can't read or recover your data because it never reaches them.

A short list of clearly marked, optional features can send data off your device. This page walks through each one: what triggers it, what's involved, and how to turn it off.

## What stays on your device

By default, nothing you write leaves your device. That includes:

- Entries, notes, moods, and anything else you write.
- Anything you import from Instagram or Facebook export archives, or from a calendar.
- Photos, audio recordings, and other media you attach.
- Your settings and preferences.

Imports are processed entirely on your device. That will include the Instagram and Facebook archive import once it ships: it reads the export file you already downloaded and never connects to Instagram or Facebook. See [Managing your data](/managing-your-data/) for what you can bring in today.

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

If the AI assistant produces a response you consider harmful, inaccurate, or inappropriate, you can report it. The purpose is to help the SynDiary team identify patterns and improve content-safety measures — reports are never used for ads, analytics, or profiling.

Before anything is sent, the app shows a confirmation preview with the exact response and the category you picked. Only four fields are submitted: the assistant response, the report category, a random `AIR-…` reference, and the submission time. Your prompt, conversation history, AI memories, API key, and device identifiers are never included.

Reports are sent over HTTPS to the SynDiary website and automatically deleted after at most 89 days. To delete a report sooner, email info@syndiary.com with the `AIR-…` reference shown after submission — no account or personal details needed.

### App update check

On mobile, the app checks at most every six hours whether the installed version is still current, by fetching a small static file from www.syndiary.com. The request carries no identifiers and no cookies, though like any web request it reveals your IP address, and the web host learns that the app launched. It's an anonymous check, not a tracking call.

### Feedback

Nothing is sent automatically. If you choose to send feedback, the app opens your email client with an editable diagnostic summary. It reaches the team only after you review it and hit send.

### Analytics

Analytics is opt-in and off by default. If you turn it on, the app records anonymized usage events such as screens visited and feature counters, never your content. In the current version, these events stay on your device and aren't transmitted anywhere.

## Permissions

SynDiary may ask for a few device permissions, each for a local purpose. You can revoke any of them at any time in your device settings.

- **Microphone:** for recording voice notes; transcription happens on device by default.
- **Calendar:** to bring your device calendar events into your timeline, locally.
- **Photos / files:** to attach media and to read archive files you import, locally.
- **Notifications** (if offered): scheduled on the device.

## Staying in control

You can edit or delete individual entries whenever you like, and clear all data from Settings in one step. Uninstalling the app removes everything.

When you export your data, you can choose an encrypted bundle (ZIP/JSON) or a plain-text export. The plain-text option warns you that the exported copy is unprotected.

If your encrypted storage uses a recovery code, keep it somewhere safe. Without it, that data can't be recovered by anyone, including the SynDiary team.

:::note
SynDiary is under active development — details may shift between releases.
:::

This page explains SynDiary's privacy behavior in plain language. The binding documents are the [Privacy Policy](https://www.syndiary.com/privacy-policy.html) and [Terms of Service](https://www.syndiary.com/terms-of-service.html) on the main site. Questions? Reach the team at info@syndiary.com.
