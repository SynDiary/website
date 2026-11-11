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

A recovery code can unlock existing encrypted storage if the device's key is lost. It cannot recreate files lost with a phone or replace a backup. The SynDiary team does not hold a server copy of your entries, backup, or recovery code.

If you have a saved SynDiary backup, follow [Back up and restore](/managing-your-data/back-up-and-restore/). Keep the backup protected and any recovery code secure, separately from the phone.

## Backup and restore

| Problem | What to check |
| --- | --- |
| I saw "Backup ready" but cannot find the file. | That message means the export was prepared. Complete **Save to device** or **Share**, then check the chosen destination. |
| Photos or audio are missing after restore. | A JSON export contains references, not original files. Use a ZIP created with **Include original media** on. Check export and restore warnings for files that could not be included or restored. |
| My preferences, API keys, or AI models did not return. | These are not included in backups. Set up preferences and service connections again, and download any models you need. Recovery codes and calendar feed URLs are also excluded. |
| Restore does not accept my file. | Choose a ZIP or JSON previously exported from SynDiary. A Facebook or Instagram archive belongs in the separate archive import flow. Keep the original backup and include the error message when asking for help. |
| I lost my phone and my only backup was on it. | Look for a copy you previously saved or shared to another location. A recovery code alone cannot recreate the missing data, and the SynDiary team cannot recover it for you. |
| Is my backup encrypted? | No. Both ZIP and JSON exports are unencrypted. Protect the file before sharing it or storing it outside the app. |

## AI issues

**On-device AI won't start, or a model download is stuck.** The on-device model needs to be downloaded once, from Hugging Face, before it can run. The download needs a working network connection and enough free storage. If it stalls, check both and try again.

**Cloud AI isn't responding.** Cloud AI requires your own valid API key for the provider you've chosen. Double-check the key in Settings. While a cloud route is active, SynDiary shows a "Cloud AI on" indicator; if you don't see it, the app is running on-device instead.

## Getting help and sending useful feedback

Settings includes a send-feedback option that opens your email client with an editable diagnostic summary already filled in, so you can review and adjust it before sending. To help the team understand the issue, include:

- Your platform (iOS or Android)
- The app version
- The steps that led to the problem

You can also reach the team directly through the [contact form](https://www.syndiary.com/#contact).

:::note
SynDiary is under active development. Details may shift between releases.
:::
