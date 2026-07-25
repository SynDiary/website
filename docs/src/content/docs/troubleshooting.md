---
title: Troubleshooting & support
description: Fixes for common import, storage, and AI issues, plus how to send useful feedback.
status: in-review
platforms: [ios, android]
---

Having trouble? Start here for common issues, then reach out if you're still stuck.

## Import issues

Most import problems trace back to the Meta export itself, not SynDiary. The [Download your Facebook & Instagram information](/managing-your-data/download-facebook-instagram/) guide covers these in detail:

- **Can't find Accounts Center?** Update Facebook or Instagram, then search Settings for "Accounts Center" or "Download your information."
- **Download stuck as pending?** Large accounts take longer for Meta to prepare. Wait for the notification or email.
- **Download link expired?** Return to *Download your information* in Accounts Center and request a new file.
- **ZIP too large for your phone?** Download from a desktop browser instead, or free up storage first.
- **Chose HTML instead of JSON?** Request a new download and choose JSON.

## Storage and recovery

If your encrypted storage uses a recovery code, that code is the only way back in. If it's lost, the data can't be recovered by anyone, including the SynDiary team, since there's no account or server holding a copy. Keep your recovery code somewhere safe, separate from the device itself.

## AI issues

**On-device AI won't start, or a model download is stuck.** The on-device model needs to be downloaded once, from Hugging Face, before it can run. The download needs a working network connection and enough free storage. If it stalls, check both and try again.

**Cloud AI isn't responding.** Cloud AI requires your own valid API key for the provider you've chosen. Double-check the key in Settings. While a cloud route is active, SynDiary shows a "Cloud AI on" indicator; if you don't see it, the app is running on-device instead.

## Getting help and sending useful feedback

Settings includes a send-feedback option that opens your email client with an editable diagnostic summary already filled in, so you can review and adjust it before sending. To help the team understand the issue, include:

- Your platform (iOS or Android)
- The app version
- The steps that led to the problem

You can also reach the team directly through the [contact form](https://www.syndiary.com/#contact).

:::note[Beta]
SynDiary is in beta, so details may shift between releases.
:::
