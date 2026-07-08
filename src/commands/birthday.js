import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { setBirthday, getBirthday, getAllBirthdays, removeBirthday } from "../kv.js";
import { parseBirthdayInput, formatBirthday, daysUntilNextBirthday } from "../dates.js";

export const data = new SlashCommandBuilder()
  .setName("生日")
  .setDescription("生日紀錄")
  .addSubcommand((sub) =>
    sub
      .setName("設定")
      .setDescription("記錄你的生日")
      .addStringOption((opt) =>
        opt
          .setName("日期")
          .setDescription("例如 07-08 或 2000-07-08（年份可省略）")
          .setRequired(true)
      )
  )
  .addSubcommand((sub) =>
    sub
      .setName("查詢")
      .setDescription("查詢某人的生日（不填就查自己）")
      .addUserOption((opt) => opt.setName("使用者").setDescription("要查詢的人"))
  )
  .addSubcommand((sub) => sub.setName("列表").setDescription("列出所有已記錄的生日"))
  .addSubcommand((sub) => sub.setName("移除").setDescription("移除你的生日紀錄"));

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();

  if (sub === "設定") {
    const input = interaction.options.getString("日期", true);
    const parsed = parseBirthdayInput(input);
    if (!parsed) {
      return interaction.reply({
        content: "看不懂這個日期 (´・ω・`) 請用 MM-DD 或 YYYY-MM-DD，例如 `07-08`、`2000-07-08`",
        flags: MessageFlags.Ephemeral,
      });
    }
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    await setBirthday(interaction.user.id, {
      ...parsed,
      username: interaction.user.username,
    });
    return interaction.editReply(`已記錄你的生日：${formatBirthday(parsed)} 🎂`);
  }

  if (sub === "查詢") {
    const user = interaction.options.getUser("使用者") ?? interaction.user;
    await interaction.deferReply();
    const entry = await getBirthday(user.id);
    if (!entry) {
      return interaction.editReply({
        content: `還沒有 <@${user.id}> 的生日紀錄，請本人用 \`/生日 設定\` 新增`,
        allowedMentions: { parse: [] },
      });
    }
    const days = daysUntilNextBirthday(entry.month, entry.day);
    const countdown = days === 0 ? "就是今天！🎉" : `還有 ${days} 天`;
    return interaction.editReply({
      content: `🎂 <@${user.id}> 的生日：${formatBirthday(entry)}（${countdown}）`,
      allowedMentions: { parse: [] },
    });
  }

  if (sub === "列表") {
    await interaction.deferReply();
    const all = await getAllBirthdays();
    const entries = Object.entries(all);
    if (entries.length === 0) {
      return interaction.editReply("目前還沒有任何生日紀錄，用 `/生日 設定` 新增第一筆吧！");
    }
    const lines = entries
      .map(([userId, entry]) => ({
        userId,
        entry,
        days: daysUntilNextBirthday(entry.month, entry.day),
      }))
      .sort((a, b) => a.days - b.days)
      .map(({ userId, entry, days }) => {
        const countdown = days === 0 ? "🎉 今天" : `還有 ${days} 天`;
        return `\`${formatBirthday({ month: entry.month, day: entry.day })}\` <@${userId}>（${countdown}）`;
      });
    return interaction.editReply({
      content: `🎂 **生日列表**\n${lines.join("\n")}`,
      allowedMentions: { parse: [] },
    });
  }

  if (sub === "移除") {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const removed = await removeBirthday(interaction.user.id);
    return interaction.editReply(
      removed ? "已移除你的生日紀錄" : "你本來就沒有生日紀錄喔"
    );
  }
}
