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
  const text = interaction.options.getString("內容", true);
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  await saveThought(text);
  await revalidateSite();

  await interaction.editReply(`已記錄：${text}`);
}
