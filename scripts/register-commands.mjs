// 註冊（覆蓋）這個應用程式的所有斜線指令：
//   npm run register
// 有設 GUILD_ID 就註冊到該伺服器（立即生效），否則註冊為全域指令。

import * as thought from "../src/commands/thought.js";
import * as birthday from "../src/commands/birthday.js";

const APP_ID = process.env.DISCORD_APP_ID;
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.GUILD_ID;

if (!APP_ID || !BOT_TOKEN) {
  console.error("缺少 DISCORD_APP_ID 或 DISCORD_BOT_TOKEN（請確認 .env）");
  process.exit(1);
}

const url = GUILD_ID
  ? `https://discord.com/api/v10/applications/${APP_ID}/guilds/${GUILD_ID}/commands`
  : `https://discord.com/api/v10/applications/${APP_ID}/commands`;

const commands = [thought.data.toJSON(), birthday.data.toJSON()];

const res = await fetch(url, {
  method: "PUT", // 整批覆蓋，舊指令會被移除
  headers: {
    Authorization: `Bot ${BOT_TOKEN}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(commands),
});

const data = await res.json();
if (res.ok) {
  const scope = GUILD_ID ? `伺服器 ${GUILD_ID}` : "全域";
  console.log(`✓ 已註冊 ${data.length} 個指令（${scope}）：${data.map((c) => `/${c.name}`).join("、")}`);
} else {
  console.error("✗ 註冊失敗：", JSON.stringify(data, null, 2));
  process.exit(1);
}
