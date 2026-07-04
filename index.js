const { Telegraf, Markup } = require('telegraf');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('adsearn.db');

const bot = new Telegraf('8999473576:AAHoQkIB3EnBeuAQlr-SLJ5XmtzkdJq5lW4');
const ADMIN_ID = 8939180157;

// Database Setup
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, lang TEXT, balance REAL DEFAULT 0, payment_type TEXT, payment_info TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS ads (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT, channel_link TEXT, description TEXT, total_quota INTEGER, current_views INTEGER DEFAULT 0, status TEXT)");
});

// Start Command
bot.start((ctx) => {
    ctx.reply('Choose Language / ဘာသာစကားရွေးပါ:', Markup.inlineKeyboard([
        [Markup.button.callback('Myanmar 🇲🇲', 'lang_my'), Markup.button.callback('English 🇬🇧', 'lang_en')]
    ]));
});

// Language Select
bot.action(['lang_my', 'lang_en'], (ctx) => {
    const lang = ctx.match[0] === 'lang_my' ? 'my' : 'en';
    db.run("INSERT OR REPLACE INTO users (id, lang) VALUES (?, ?)", [ctx.from.id, lang]);
    
    const menu = lang === 'my' 
        ? Markup.keyboard([['ကြော်ငြာထည့်ရန်', 'ကြော်ငြာကြည့်ရန်']])
        : Markup.keyboard([['Post Ad', 'View Ads']]);
    
    ctx.reply(lang === 'my' ? 'Welcome! ကျေးဇူးပြု၍ ရွေးချယ်ပါ:' : 'Welcome! Please choose:', menu.resize());
});

// Ad Post Flow
bot.hears(['Post Ad', 'ကြော်ငြာထည့်ရန်'], (ctx) => {
    ctx.reply('⚠️ အရေးကြီး: Bot ကို Channel တွင် Admin ပေးပြီး "Invite users via link" ကို enable လုပ်ပါ။\n\nဈေးနှုန်း: 1 View = 50 MMK. (အနည်းဆုံး 10,000 MMK သို့ 3$)\n\nKBZ/Wave: 09674881696 (Myint Maung)\nBinance ID: 569217843\n\nငွေလွှဲပြေစာ ပို့ရန် အောက်ပါကိုနှိပ်ပါ:', 
    Markup.inlineKeyboard([Markup.button.callback('အတည်ပြုမည်', 'confirm_ad')]));
});

bot.action('confirm_ad', (ctx) => {
    ctx.reply('ကျေးဇူးပြု၍ Channel/Group Link, Description နှင့် ငွေလွှဲပြေစာပုံ ပို့ပေးပါ။');
    // Admin ထံ forward လုပ်ရန် logic ဒီနေရာတွင် ထည့်ပါ
});

// Wallet Setup
bot.hears(['View Ads', 'ကြော်ငြာကြည့်ရန်'], (ctx) => {
    // Payment method checking code...
    ctx.reply('သင်၏ ငွေပေးချေမှုအချက်အလက်များကို အရင်ချိတ်ဆက်ပါ။');
});

// Withdrawal Logic (10,000 MMK Limit)
bot.hears('Withdraw', (ctx) => {
    db.get("SELECT balance FROM users WHERE id = ?", [ctx.from.id], (err, row) => {
        if (row.balance >= 10000) {
            ctx.reply('သင်၏ ငွေထုတ်တောင်းဆိုမှုကို Admin ထံ ပေးပို့လိုက်ပါပြီ။');
        } else {
            ctx.reply('ငွေထုတ်ရန် အနည်းဆုံး 10,000 MMK လိုအပ်ပါသည်။');
        }
    });
});

bot.launch();

