// --- CONFIGURATION ---
const TWITCH_CHANNEL = 'koroturtle_7643'; // Mets le pseudo de ta chaîne ici
const SUPABASE_URL = 'https://fxvoosxodlzzdmkkonee.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ocpNFrq6bY82rN3w58yRTA_u3AVyEFK'; // La clé anon de Supabase (pas la service_role !)
const DEFAULT_AVATAR = 'https://static-cdn.jtvnw.net/user-default-pictures-uv/75305d54-c7cc-40d1-bb60-a02c3b84b353-profile_image-300x300.png';

// --- SUPABASE ---
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const avatarCache = new Map();

async function getAvatar(username) {
  const cleanUser = username.toLowerCase();
  if (avatarCache.has(cleanUser)) return avatarCache.get(cleanUser);

  const { data } = await db
    .from('viewers')
    .select('avatar_url')
    .eq('twitch_username', cleanUser)
    .single();

  const url = (data && data.avatar_url) ? data.avatar_url : DEFAULT_AVATAR;
  avatarCache.set(cleanUser, url);
  return url;
}

// --- TWITCH ---
const client = new tmi.Client({
  channels: [TWITCH_CHANNEL]
});

client.connect();

const chatContainer = document.getElementById('chat-container');

client.on('message', async (channel, tags, message, self) => {
  const username = tags['display-name'] || tags.username;
  const color = tags.color || '#a970ff';
  const avatarUrl = await getAvatar(tags.username);

  const msgEl = document.createElement('div');
  msgEl.className = 'chat-message';
  msgEl.innerHTML = `
    <div class="avatar-container">
      <img src="${avatarUrl}" alt="${username}" onerror="this.src='${DEFAULT_AVATAR}'">
    </div>
    <div class="content">
      <span class="username" style="color: ${color}">${username}</span>
      <span class="text">${escapeHtml(message)}</span>
    </div>
  `;

  chatContainer.appendChild(msgEl);

  if (chatContainer.children.length > 25) {
    chatContainer.removeChild(chatContainer.children[0]);
  }
});

function escapeHtml(text) {
  const div = document.createElement('div');
  div.innerText = text;
  return div.innerHTML;
}
