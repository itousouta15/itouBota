// 通知官網重新驗證 /thoughts 頁面（沒設定就跳過，網站會靠 ISR 每小時自己更新）
export async function revalidateSite() {
  const url = process.env.SITE_REVALIDATE_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!url || !secret) return;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "x-revalidate-secret": secret },
    });
    if (!res.ok) {
      console.warn(`revalidate 失敗：${res.status} ${await res.text()}`);
    }
  } catch (err) {
    console.warn("revalidate 失敗：", err);
  }
}
