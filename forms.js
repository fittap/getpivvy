// The Home page forms: Join the beta and Become a Founding Creator.
// Join the beta: saves the email in Supabase (the beta_signups table). The site can only add
// emails, never read them; the list is in the Supabase dashboard, Table Editor, beta_signups.
// This key is Supabase's publishable key, which is safe to show on a web page.
const SUPABASE_URL = 'https://vcmgnqhxerrbdcdkpgfi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_XougXZvyG7jXKryZA-01Ww_fykRQ0V2';

// Basic bot protection for both forms. Bots fill in the hidden "company" box, or send the form
// faster than a person could type; they're shown the thank you without anything being saved.
// Supabase also allows only 5 sign ups an hour from one connection, and each email once.
const pageOpenedAt = Date.now();
function looksLikeABot(f) {
  return f.elements.company.value !== '' || Date.now() - pageOpenedAt < 2500;
}
async function tooManySignups(res) {
  if (res.status !== 400) return false;
  const body = await res.json().catch(() => ({}));
  return String(body.message || '').includes('PIVVY_TOO_MANY_SIGNUPS');
}
const TOO_MANY = 'Too many sign ups from this connection. Please try again in an hour.';

const form = document.getElementById('beta-form');
const input = document.getElementById('beta-email');
const message = document.getElementById('beta-message');
const button = form.querySelector('button');

function show(text, isError) {
  message.textContent = text;
  message.classList.toggle('error', !!isError);
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = input.value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    show('Please enter a valid email address.', true);
    return;
  }
  if (looksLikeABot(form)) {
    form.reset();
    show("You're on the list! We'll email you when your invite is ready.");
    return;
  }
  button.disabled = true;
  show('');
  try {
    const res = await fetch(SUPABASE_URL + '/rest/v1/beta_signups', {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ email }),
    });
    // 409 means the email is already on the list, which is fine.
    if (res.ok || res.status === 409) {
      form.reset();
      show("You're on the list! We'll email you when your invite is ready.");
    } else if (await tooManySignups(res)) {
      show(TOO_MANY, true);
    } else {
      show('Something went wrong. Please try again in a moment.', true);
    }
  } catch (e) {
    show("Couldn't connect. Please check your internet and try again.", true);
  } finally {
    button.disabled = false;
  }
});

// Become a Founding Creator: saves the request in Supabase (the creator_applications table).
// Like the beta list, the site can only add requests, never read them; they're in the
// Supabase dashboard, Table Editor, creator_applications.
const creatorForm = document.getElementById('creator-form');
const creatorEmail = document.getElementById('creator-email');
const creatorHandle = document.getElementById('creator-handle');
const creatorAgree = document.getElementById('creator-agree');
const creatorMessage = document.getElementById('creator-message');
const creatorButton = creatorForm.querySelector('button');

function showCreator(text, isError) {
  creatorMessage.textContent = text;
  creatorMessage.classList.toggle('error', !!isError);
}

// Accepts "@name", "name", or a pasted profile link, and keeps just the username.
function cleanHandle(text) {
  return text.trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^(www\.)?(instagram\.com|tiktok\.com)\//i, '')
    .replace(/^@/, '')
    .replace(/[/?].*$/, '');
}

creatorForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = creatorEmail.value.trim().toLowerCase();
  const handle = cleanHandle(creatorHandle.value);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showCreator('Please enter a valid email address.', true);
    return;
  }
  if (!/^[A-Za-z0-9._]{1,30}$/.test(handle)) {
    showCreator('Please enter your Instagram or TikTok handle, like @yourname.', true);
    return;
  }
  if (!creatorAgree.checked) {
    showCreator('Please confirm you’re 18 or older and agree to the Community Rules.', true);
    return;
  }
  if (looksLikeABot(creatorForm)) {
    creatorForm.reset();
    showCreator('Thanks! We’ll be in touch soon.');
    return;
  }
  creatorButton.disabled = true;
  showCreator('');
  try {
    const res = await fetch(SUPABASE_URL + '/rest/v1/creator_applications', {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ email, handle, agreed_rules: true }),
    });
    // 409 means this email already asked, which is fine.
    if (res.ok || res.status === 409) {
      creatorForm.reset();
      showCreator('Thanks! We’ll be in touch soon.');
    } else if (await tooManySignups(res)) {
      showCreator(TOO_MANY, true);
    } else {
      showCreator('Something went wrong. Please try again in a moment.', true);
    }
  } catch (e) {
    showCreator("Couldn't connect. Please check your internet and try again.", true);
  } finally {
    creatorButton.disabled = false;
  }
});
