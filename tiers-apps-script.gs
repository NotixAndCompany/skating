/**
 * Оценки упражнений S/A/B/C для страницы «Тренировочная неделя на льду».
 * Вставьте этот код в Google Таблицу: Расширения → Apps Script.
 * Затем один раз запустите setup() и опубликуйте как веб-приложение (доступ: «Все»).
 * Читать оценки может любой, у кого есть ссылка; менять — только с ключом EDIT_KEY.
 */
const SHEET = 'tiers';
const VALID = ['S', 'A', 'B', 'C'];

/* Снимок оценок на 26.11.2026 — заливается в пустую таблицу при первом setup(). */
const SEED = {"aksel-s-hoda-vpered":"A","bystrye-malenkie-troyki":"S","cako":"S","cako-na-levuyu-lutc":"B","cako-na-pravuyu-cako-na-levuyu-flip":"B","cirkul-na-tulup":"A","dvoynye-s-cako":"A","flip-cherez-pereskok-ili-podskok":"C","flip-v-shpagate":"A","kaskady-s-flipom-cherez-oyler":"S","kaskady-s-rittbergerom":"S","kaskady-s-salhovom-cherez-oyler":"S","kaskady-s-tulupom":"S","kombinacii-s-akselem":"S","lutc-s-perebezhki":"A","lutc-s-shagov":"A","lutc-v-shpagate":"A","obratnyy-vint-rittberger":"S","perebezhka-salhovye-troyki":"A","pereskok-cako-oyler-pryzhok":"S","pereskoki":"A","podprygivaniya":"S","pryzhki-iz-libely":"A","pryzhki-s-kryuka-vykryuka":"A","pryzhki-s-vintov":"A","pryzhok-otskok-pryzhok":"A","pyanyy-shag-pereskok-zubchiki":"B","pyanyy-shag-so-skoboy-cako":"A","rittberger-po-krugu":"S","rittberger-s-shagov-i-povorotov":"A","rittbergerovye-troyki":"S","rittbergerovye-tvizly-seriya-rittbergerov":"A","salhov-s-perebezhki":"A","salhov-s-shagov-i-povorotov":"A","seriya-rittbergerov":"A","troyka-flipovyy-pryzhok-v-pol-oborota":"B","troyka-podsechka-vykryuk-lutc":"B","troyka-podskok-podskok-lutc":"B","tulup-iz-podsechek":"A","tulup-na-levuyu":"A","tury":"A","tvizly-na-pryzhki":"A","vnutrenniy-aksel":"A","vse-pryzhki-cherez-krossrolly":"A","vse-pryzhki-cherez-pereskok":"A","vse-pryzhki-s-mesta":"A","vse-pryzhki-s-troek":"A","zmeyka-s-pryzhkami":"A"};

function sheet_() {
  const ss = SpreadsheetApp.getActive();
  return ss.getSheetByName(SHEET) || ss.insertSheet(SHEET);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* Чтение: { "id-упражнения": "S", ... } */
function doGet() {
  const out = {};
  sheet_().getDataRange().getValues().forEach(function (r) {
    if (r[0] && VALID.indexOf(r[1]) >= 0) out[r[0]] = r[1];
  });
  return json_(out);
}

/* Запись: {id, tier, key}; пустой tier снимает оценку */
function doPost(e) {
  let body = {};
  try { body = JSON.parse(e.postData.contents); } catch (err) {}
  const key = PropertiesService.getScriptProperties().getProperty('EDIT_KEY');
  if (!key || body.key !== key) return json_({ ok: false, error: 'key' });
  if (!/^[a-z0-9-]{1,80}$/.test(body.id || '')) return json_({ ok: false, error: 'id' });
  if (body.tier && VALID.indexOf(body.tier) < 0) return json_({ ok: false, error: 'tier' });
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const sh = sheet_();
    const rows = sh.getDataRange().getValues();
    let row = -1;
    for (let i = 0; i < rows.length; i++) if (rows[i][0] === body.id) { row = i + 1; break; }
    if (!body.tier) { if (row > 0) sh.deleteRow(row); }
    else if (row > 0) sh.getRange(row, 2).setValue(body.tier);
    else sh.appendRow([body.id, body.tier]);
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true });
}

/* Запустить один раз: создаёт ключ редактора и заливает снимок оценок в пустой лист. Ключ смотреть в журнале выполнения. */
function setup() {
  const props = PropertiesService.getScriptProperties();
  let key = props.getProperty('EDIT_KEY');
  if (!key) { key = Utilities.getUuid().slice(0, 8); props.setProperty('EDIT_KEY', key); }
  const sh = sheet_();
  if (sh.getLastRow() === 0) {
    const rows = Object.keys(SEED).map(function (id) { return [id, SEED[id]]; });
    if (rows.length) sh.getRange(1, 1, rows.length, 2).setValues(rows);
  }
  Logger.log('Ключ редактора: ' + key);
}
