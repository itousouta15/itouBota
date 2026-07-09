import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { saveThought } from "../kv.js";
import { revalidateSite } from "../revalidate.js";

export const data = new SlashCommandBuilder()
  .setName("碎碎念")
  .setDescription("新增一則碎碎念")
  .addStringOption((opt) =>
    opt.setName("內容").setDescription("你想說的話").setRequired(true)
  );

export async function execute(interaction) {
  if (interaction.user.id !== process.env.OWNER_ID) {
    return interaction.reply({
      content: "這個指令只有蒼太本人可以用喔 (｡•́︿•̀｡)",
      flags: MessageFlags.Ephemeral,
    });
  }

  const text = interaction.options.getString("內容", true);
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  await saveThought(text);
  await revalidateSite();

  await interaction.editReply(`已記錄：${text}`);
}
