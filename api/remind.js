const SUPABASE_URL = 'https://cetppwtxkkucyylfpxlq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Xxp4jkRbsWeVroqrp2siKw_efm94XXM';
const BOT_TOKEN = '8983813743:AAEnLeYtCTQivQkENz5SJ_jVZvcg89XI7ig';

const TG_ID_MAP = {
  840314306:  'daiw',
  973224270:  'tuti',
  1766832597: 'luka',
  888236045:  'andrey',
  781212677:  'ulfsees',
  376186862:  'saintrap',
  1312326080: 'ksusha',
};

const MONTHS = {'янв':0,'фев':1,'мар':2,'апр':3,'мая':4,'май':4,'июн':5,'июл':6,'авг':7,'сен':8,'окт':9,'ноя':10,'дек':11};

function parseDayToISO(label) {
  const m = label.match(/(\d{1,2})\s+([а-я]+)/i);
  if (!m) return null;
  const day = parseInt(m[1]);
  const mon = MONTHS[m[2].slice(0,3)];
  if (mon == null) return null;
  return `2026-${String(mon+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}

export default async function handler(req, res) {
  // получаем все активные задачи
  const r = await fetch(`${SUPABASE_URL}/rest/v1/tasks?select=*&status=neq.done&deleted_at=is.null`, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
  });
  const tasks = await r.json();

  // завтрашняя дата
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0,0,0,0);
  const tomorrowISO = `2026-${String(tomorrow.getMonth()+1).padStart(2,'0')}-${String(tomorrow.getDate()).padStart(2,'0')}`;

  let sent = 0;
  for (const task of tasks) {
    if (!task.day || !task.person) continue;
    const iso = parseDayToISO(task.day);
    if (iso !== tomorrowISO) continue;

    // кому слать
    const persons = task.person.split(',').map(s => s.trim()).filter(Boolean);
    for (const pid of persons) {
      const tgEntry = Object.entries(TG_ID_MAP).find(([k,v]) => v === pid);
      if (!tgEntry) continue;
      const tgId = parseInt(tgEntry[0]);
      const text = `⏰ Завтра дедлайн!\n\n*${task.name}*\n\n📅 ${task.day}`;
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: tgId, text, parse_mode: 'Markdown' })
      });
      sent++;
    }
  }

  res.json({ ok: true, sent });
}
