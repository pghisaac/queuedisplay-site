# Queue Display

Smart-TV queue number display (left third) with scheduled images/videos (right two-thirds).

| File | What it is |
|---|---|
| `index.html` | The TV page. Put this URL in MagicInfo. |
| `admin.html` | Manage uploads and schedules. Open in any browser. |
| `config.js` | Supabase address/key and timezone. |
| `schedule.js` | "Is this item playing now?" logic shared by both pages. |
| `supabase-setup.sql` | One-time database and storage setup. |

## Using the TV page

Type an order number and press Enter (keyboard or scanner). Prefix `*` = Grabfood, `/` = Foodpanda, none = Takeaway.

## One-time setup (about 10 minutes)

1. Create a free project at <https://supabase.com> (any region; Singapore is closest).
2. **SQL Editor → New query**, paste all of `supabase-setup.sql`, **Run**.
3. **Authentication → Users → Add user**: enter your email and a strong password, tick *Auto confirm*.
4. **Authentication → Sign In / Providers**: turn **off** "Allow new users to sign up" so nobody else can create an account.
5. **Project Settings → API**: copy the **Project URL** and the **anon public** key into `config.js`. Commit and push.
6. Open `https://<your-site>/admin.html`, sign in, upload content.

The anon key is meant to be public. The database rules only let it *read* content; changing or uploading anything requires the signed-in admin account.

## Scheduling

Each item can have any mix of: from/until date, from/until time of day, and days of the week. Blank means always.
Times use the timezone in `config.js` (`Asia/Singapore` by default), not the TV's own clock.
A time window may cross midnight (for example 22:00 → 02:00). Day-of-week rules are checked against the current day, so for a window that crosses midnight the after-midnight part follows the new day.

Items play in the order shown, top to bottom, then repeat. Only items that are active at that moment are included, and the list is re-checked after every item. The TV downloads changes about once a minute.

If nothing is scheduled at a given time, or the backend can't be reached on first start, the TV shows the two built-in images (`OKNEXTV1_1.jpg`, `OKNEXTV1_2.jpg`). The last good list is cached on the TV, so a short internet outage doesn't blank the screen.

## Notes

- Videos play muted (the speaker is reserved for the order-number ding) and play to the end.
- Recommended media size is 1280×1080. Images are cropped to fill (`object-fit: cover`).
- Free Supabase projects pause after a week of no activity. The TV calls the API every minute, so this shouldn't happen while it is running.
