# getpivvy.com

The Pivvy website: plain HTML pages and one stylesheet, published for free with GitHub Pages.

- index.html: Home, with the three screenshots and the Join the beta form
- story.html, rules.html, terms.html, support.html: the other pages
- style.css: the look, the same colors and fonts as the app (mobile/src/lib/theme.ts)
- images/: the Dalmatian logo and the screenshots
- CNAME: tells GitHub Pages the site lives at getpivvy.com

Join the beta emails are saved in Supabase, in the beta_signups table
(mobile/supabase/migrations/0041_beta_signups.sql). Read them in the Supabase dashboard, Table Editor.

The privacy policy is still its own site at https://fittap.github.io/privacy/.
