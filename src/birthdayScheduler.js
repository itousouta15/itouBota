import { getAllBirthdays, getLastAnnouncedDate, setLastAnnouncedDate } from "./kv.js";
import { todayInTaipei, isBirthdayToday } from "./dates.js";

const DAY_MS = 24 * 60 * 60 * 1000;

// 台北固定 UTC+8（無日光節約時間），可以直接用偏移量計算
function msUntilNextTaipeiMidnight() {
  const now = Date.now();
  const taipei = new Date(now + 8 * 3600000);
  const nextMidnight =
    Date.UTC(taipei.getUTCFullYear(), taipei.getUTCMonth(), taipei.getUTCDate() + 1) -
    8 * 3600000;
  return nextMidnight - now;
}

export function startBirthdayScheduler(client) {
  const channelId = process.env.BIRTHDAY_CHANNEL_ID;
  if (!channelId) {
    console.warn("⚠ 未設定 BIRTHDAY_CHANNEL_ID，生日提醒功能停用（紀錄功能不受影響）");
    return;
  }

  const run = () =>
    checkBirthdays(client, channelId).catch((err) => console.error("生日檢查失敗：", err));

  run(); // 啟動時先檢查一次，涵蓋白天重啟的情況
  setTimeout(() => {
    run();
    setInterval(run, DAY_MS);
  }, msUntilNextTaipeiMidnight() + 30000);
}

async function checkBirthdays(client, channelId) {
  const today = todayInTaipei();
  const pad2 = (n) => String(n).padStart(2, "0");
  const todayStr = `${today.year}-${pad2(today.month)}-${pad2(today.day)}`;

  if ((await getLastAnnouncedDate()) === todayStr) return;

  const all = await getAllBirthdays();
  const celebrants = Object.keys(all).filter((userId) =>
    isBirthdayToday(all[userId].month, all[userId].day, today)
  );

  if (celebrants.length > 0) {
    const channel = await client.channels.fetch(channelId);
    const mentions = celebrants.map((id) => `<@${id}>`).join("、");
    await channel.send(`🎂 今天是 ${mentions} 的生日，生日快樂！🎉`);
    console.log(`✓ 已發送生日祝福：${todayStr}（${celebrants.length} 人）`);
  }

  await setLastAnnouncedDate(todayStr);
}
