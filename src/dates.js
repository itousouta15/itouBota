const TAIPEI_TZ = "Asia/Taipei";

export function todayInTaipei() {
  // en-CA 的日期格式是 YYYY-MM-DD
  const s = new Intl.DateTimeFormat("en-CA", { timeZone: TAIPEI_TZ }).format(new Date());
  const [year, month, day] = s.split("-").map(Number);
  return { year, month, day };
}

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function daysInMonth(month, year) {
  if (month === 2) return year == null || isLeapYear(year) ? 29 : 28;
  return [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
}

// 接受 07-08、7/8、2000-07-08、2000/7/8、7月8日、2000年7月8日
export function parseBirthdayInput(input) {
  const m = input.trim().match(/^(?:(\d{4})[年\-\/\.])?(\d{1,2})[月\-\/\.](\d{1,2})日?$/);
  if (!m) return null;

  const year = m[1] ? Number(m[1]) : null;
  const month = Number(m[2]);
  const day = Number(m[3]);

  if (year != null && (year < 1900 || year > todayInTaipei().year)) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > daysInMonth(month, year)) return null;

  return { month, day, year };
}

const pad2 = (n) => String(n).padStart(2, "0");

export function formatBirthday({ month, day, year }) {
  const md = `${pad2(month)}/${pad2(day)}`;
  return year ? `${year}/${md}` : md;
}

// 2/29 出生的人在非閏年以 2/28 慶祝
function celebrationDayFor(month, day, year) {
  if (month === 2 && day === 29 && !isLeapYear(year)) return { month: 2, day: 28 };
  return { month, day };
}

export function isBirthdayToday(month, day, today = todayInTaipei()) {
  const c = celebrationDayFor(month, day, today.year);
  return c.month === today.month && c.day === today.day;
}

export function daysUntilNextBirthday(month, day, today = todayInTaipei()) {
  const base = Date.UTC(today.year, today.month - 1, today.day);
  for (let y = today.year; ; y++) {
    const c = celebrationDayFor(month, day, y);
    const candidate = Date.UTC(y, c.month - 1, c.day);
    if (candidate >= base) return Math.round((candidate - base) / 86400000);
  }
}
