---
title: Managing your data
description: Bring data into SynDiary, keep it on your device, and export or delete it whenever you choose.
status: in-review
platforms: [ios, android]
---

Everything you put into SynDiary, and everything you bring into it, stays under your control. This page covers how data gets in, where it lives, how to get it back out, and how to remove it.

## Bringing data in

All imports are processed entirely on your device. Bringing in an archive or a calendar never sends your content to a server on SynDiary's side.

**Instagram and Facebook archives.** Meta lets you download a full export of your account as a ZIP file. [Download your Facebook & Instagram information](/managing-your-data/download-facebook-instagram/) walks through requesting that export from Meta Accounts Center and choosing the right format. Direct in-app import of that ZIP is on its way. For now, keep the file somewhere safe until it's available.

**Device calendar.** SynDiary can read events from your device's calendar and bring them into your timeline, using the calendar permission. This import happens locally, and your events aren't sent anywhere.

**Calendar feed by URL.** If you add a calendar feed (for example, a Google Calendar feed URL), SynDiary fetches that feed to keep events in sync. This is the one calendar option that goes online: it periodically checks the feed you've added instead of reading it once from the device.

**Photos and audio.** Attaching a photo or a voice recording to an entry uses your device's photos/files or microphone permission. These attachments stay local to the entry you create them on.

## Your data on your device

SynDiary has no account and no registration. Your entries, notes, moods, imported data, and attached media are stored in an encrypted database on your device, encrypted at rest by default. There's no server on SynDiary's side that receives your content, so the company can't read it or recover it for you.

SynDiary stores everything as structured entities based on [schema.org](https://schema.org/), an open standard. What you keep in SynDiary stays searchable and portable instead of locked into a proprietary format.

## Exporting and backing up

You can export your data as an encrypted ZIP/JSON bundle, a backup that stays protected the way your on-device data is. A plain-text export option is also available for when you need a readable copy. SynDiary warns you when you choose it that the exported copy is no longer protected.

If your encrypted storage uses a recovery code, keep it somewhere safe, separate from the device itself. Without it, encrypted data can't be recovered by anyone, including the SynDiary team.

## Deleting

You can edit or delete individual entries at any time. Settings includes an option to clear all data, if you want to start fresh without removing the app. Uninstalling SynDiary removes everything it stored on your device.

:::note[Beta]
SynDiary is in beta, so details may shift between releases.
:::
