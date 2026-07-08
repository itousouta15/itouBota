import { Client, Events, GatewayIntentBits, MessageFlags } from "discord.js";
import * as thought from "./commands/thought.js";
import * as birthday from "./commands/birthday.js";
import { startBirthdayScheduler } from "./birthdayScheduler.js";

const token = process.env.DISCORD_BOT_TOKEN;
if (!token) {
  console.error("缺少 DISCORD_BOT_TOKEN（請確認 .env，參考 .env.example）");
  process.exit(1);
}

const commands = new Map([
  [thought.data.name, thought],
  [birthday.data.name, birthday],
]);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (c) => {
  console.log(`✓ 已登入：${c.user.tag}`);
  startBirthdayScheduler(c);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(`指令 /${interaction.commandName} 執行失敗：`, err);
    const reply = { content: "出錯了 (´;ω;`) 請稍後再試", flags: MessageFlags.Ephemeral };
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(reply).catch(() => {});
    } else {
      await interaction.reply(reply).catch(() => {});
    }
  }
});

client.login(token);
