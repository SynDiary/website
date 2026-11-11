---
title: Managing your data
description: Bring data into SynDiary, keep it on your device, and export or delete it whenever you choose.
status: in-review
platforms: [ios, android]
---

Everything you put into SynDiary, and everything you bring into it, stays under your control. This page covers how data gets in, where it lives, how to get it back out, and how to remove it.

## Bringing data in

All imports are processed entirely on your device. Bringing in an archive or a calendar never sends your content to a server on SynDiary's side.

**Instagram and Facebook archives.** Meta lets you download a full export of your account as a ZIP file. [Download your Facebook & Instagram information](/managing-your-data/download-facebook-instagram/) walks through requesting that export from Meta Accounts Center and choosing the right format. Once you have the ZIP, open **Settings → Import your memories** in SynDiary, choose Facebook or Instagram, and select the file.

**Device calendar.** SynDiary can read events from your device's calendar and bring them into your timeline, using the calendar permission. This import happens locally, and your events aren't sent anywhere.

**Calendar feed by URL.** If you add a calendar feed (for example, a Google Calendar feed URL), SynDiary fetches that feed to keep events in sync. This is the one calendar option that goes online: it periodically checks the feed you've added instead of reading it once from the device.

**Photos and audio.** Attaching a photo or a voice recording to an entry uses your device's photos/files or microphone permission. These attachments stay local to the entry you create them on.

## Your data on your device

SynDiary has no account and no registration. Your entries, notes, moods, imported data, and attached media are stored in an encrypted database on your device, encrypted at rest by default. There's no server on SynDiary's side that receives your content, so the company can't read it or recover it for you.

SynDiary stores everything as structured entities based on [schema.org](https://schema.org/), an open standard. What you keep in SynDiary stays searchable and portable instead of locked into a proprietary format.

## Exporting and backing up

Open **Settings → Back up & Restore → Back up** to save a copy of your data. With **Include original media** on, SynDiary creates a ZIP containing your entries, their connections, and available original photos and audio. Turning it off creates a smaller JSON export without the original media files.

Both formats are unencrypted. Protect the file before storing or sharing it, and keep a copy away from your phone. **Backup ready** means the export is prepared; you still need to save or share it.

See [Back up and restore](/managing-your-data/back-up-and-restore/) for the full procedure, screenshots, backup contents, and exclusions.

## Restoring a backup

Open **Settings → Back up & Restore → Restore**, choose a saved SynDiary ZIP or JSON export, review the summary, then select **Add to SynDiary** and confirm. Keep the app open until it finishes and check the results. A JSON-only export cannot recover missing photos or audio.

A recovery code unlocks existing encrypted storage; it does not replace a saved backup. Recovery codes are not included in exports. Keep yours secure and separate from the phone.

## Deleting

You can edit or delete individual entries at any time. **Settings → Back up & Restore → Erase everything** removes your entries, photos, and settings. Save and check a backup before using it or uninstalling SynDiary. A backup stored outside the app is a separate copy; protect or delete it separately.

:::note
SynDiary is under active development. Details may shift between releases.
:::
