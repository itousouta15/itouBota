import { kv } from "@vercel/kv";

// ---- 碎碎念（與官網 app/lib/kv.ts 使用同一個 list、同一種資料格式）----

const THOUGHTS_KEY = "thoughts";

export async function saveThought(text) {
  const entry = {
    id: crypto.randomUUID(),
    text,
    timestamp: new Date().toISOString(),
  };
  await kv.lpush(THOUGHTS_KEY, JSON.stringify(entry));
}

// ---- 生日（hash：field = Discord user ID，value = { month, day, year, username }）----

const BIRTHDAYS_KEY = "birthdays";
const LAST_ANNOUNCED_KEY = "birthday:last_announced";

export async function setBirthday(userId, entry) {
  await kv.hset(BIRTHDAYS_KEY, { [userId]: entry });
}

export async function getBirthday(userId) {
  return kv.hget(BIRTHDAYS_KEY, userId);
}

export async function getAllBirthdays() {
  return (await kv.hgetall(BIRTHDAYS_KEY)) ?? {};
}

export async function removeBirthday(userId) {
  return kv.hdel(BIRTHDAYS_KEY, userId);
}

// 防止重啟後同一天重複公告
export async function getLastAnnouncedDate() {
  return kv.get(LAST_ANNOUNCED_KEY);
}

export async function setLastAnnouncedDate(date) {
  await kv.set(LAST_ANNOUNCED_KEY, date);
}
