const TelegramBot = require('node-telegram-bot-api');
const {parses_bal,parses_lesion} = require('./func/parse')
const anim_load = require("./func/anim_load")
const config = require("./config/config.json")
const sleep = require("./func/sleep")
const get = require("./func/get");
const post = require('./func/post');
const put = require('./func/put');


const API_KEY_BOT = '7473987432:AAFDw1tZ_45adx4NJuJV2-xNFqnVB39AVvg'
const DEV = false
const url = config.url_moyasch
const url_db = config.url_db


let user = "Maxim L";
let password= "Lozamaxim123";
let dotnet_use_anim = ["",".","..","..."]
let users_list_kik = []
let dotnet_use = []




const bot = new TelegramBot(API_KEY_BOT, {
    polling: true 
});
  
const butthons = config.buttons
const butthonss = [[butthons[0]],[butthons[1]],[butthons[2]],[butthons[3]],[butthons[4]]];





const yeah = async (id) => {
  const msg = await bot.sendMessage(id, "Перевірка акаунта...");
  get(url_db).then(async (users) => {

    const p = users.find(o => o._id === id);

    const f = await parses_bal(url, p.data[0], p.data[1]);
    if (f !== false) {
      bot.editMessageText(`Готово ✅. Акаунт існує та працює. Ваш середній бал: ${f.bal}`, {
        chat_id: id,
        message_id: msg.message_id
      });
      await sleep(1000);
      const msg_2 = await bot.sendMessage(id, "Вас зареєстровано. Надсилаю меню...");
      menu(id, msg_2);
    } else if (f === false) {
      bot.editMessageText(`Проблема 🚫. Акаунт не працює або його не існує.`, {
        chat_id: id,
        message_id: msg.message_id
      });
      no(id);
    }
  });
};

const no = (id) => {
  get(url_db).then(async (users) => {

    const p = users.find(o => o._id === id);
    bot.sendMessage(id, "Напишіть, будь ласка, ще раз команду /start та введіть правильні дані.");
    fetch(`${url_db}/${p.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });
  });
};



const menu = async (id,msg_2) =>{  
  if (msg_2) bot.deleteMessage(id, msg_2.message_id)
  bot.sendMessage(id,"Меню:", {
    reply_markup: { 
        keyboard: butthonss,
        resize_keyboard: true,
    }
})
}
 



const yes_no_reg = {
  reply_markup: {
    inline_keyboard: [
      [{ text: 'Так✅', callback_data: 'yeah' }],
      [{ text: 'Ні🚫', callback_data: 'no' }],
    ]
  }
};

bot.on('callback_query', (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;

  bot.answerCallbackQuery(callbackQuery.id);

  if (data === 'yeah') yeah(chatId)
  else if (data === 'no') no(chatId)
});


const request_login = (id) => async (msg) => {
  get(url_db).then(async (users)=>{
  const pd = users.find(o => o._id === id);

  console.log(msg.text)
  if (msg.text === "/start") {console.log(123)}
  else {

  
  if (pd.data.length ==0 ) {
  pd.data.push(msg.text);
  await put(url_db, pd);
  bot.once('text', request_password(id));
  }
}})

};

const request_password = (id) => async (msg) => {
  get(url_db).then(async (users)=>{
  const pd = users.find(o => o._id === id);


  if (msg.text === "/start") {console.log(321)}
  else {  
  pd.data.push(msg.text);
  if (pd.data.length ==2 ) {
  try {
    const users = await get(url_db);
    const f = users.find(o => o._id === id);
    pd.id = f.id;
    await put(url_db, pd);
  } catch (e) {
    console.error(`Error: ${e}`);
  }

  bot.sendMessage(id, `Ваш логін: ${pd.data[0]}, пароль: ${pd.data[1]}`, yes_no_reg);
  bot.removeListener('text', request_login);
  bot.removeListener('text', request_password);
}}
})
};










bot.on('text', async (msg) => {
  const id = msg.from.id;
  const msg_id = msg.message_id;
  
  if (DEV != false) {
    let use = {
      id: id,
      data: [user, password],
    };
    users_list_kik.push(use);
  }

  switch (msg.text) {
    case '/start':

      if (DEV != false) {
        yeah(id);
        let use = {
          id: id,
          data: [user, password],
        };
        users_list_kik.push(use);
        return 0;
      }

      get(url_db).then(async (users) => {
        let p = users.find(o => o._id === id);

        if (!p) {
          bot.sendMessage(id, "Привіт! Введіть свій логін і пароль від 'Моя школа'.");
          await sleep(100);
          bot.sendMessage(id, "Спочатку надішліть логін, а потім — наступним повідомленням пароль.");

          let use = {
            _id: id,
            data: [],
          };

          post(url_db, use);
          users_list_kik.push(use);

          bot.once('text', request_login(id));
        } else {
          menu(id);
          console.log("Акаунт уже зареєстровано");
        }
      });

      break;

    case butthons[0]: 
      console.log(msg.text);

      const g = await bot.sendMessage(id, 'Завантаження...');
      let dotf = {
        id: id,
        data: 0,
      };
      dotnet_use.push(dotf);
      const interd = anim_load(id, dotnet_use, dotnet_use_anim, bot, g);
      get(url_db).then(async (users) => {
        const pg = users.find(o => o._id === id);
        const fe = await parses_bal(url, pg.data[0], pg.data[1]);
        bot.sendMessage(id, `Ваш середній бал: ${fe.bal}\nМісце в класі: ${fe.mische}\nНепрочитаних повідомлень: ${fe.povidom}`);
        bot.deleteMessage(id, g.message_id);
        clearInterval(interd);
      });
      break;

    case butthons[2]: 
      console.log(msg.text);
      await bot.sendMessage(id, 'У розробці');
      break;

    case butthons[1]: 
      console.log(msg.text);

      const wait = await bot.sendMessage(id, 'Завантаження...');
      let dot = {
        id: id,
        data: 0,
      };
      dotnet_use.push(dot);
      const inter = anim_load(id, dotnet_use, dotnet_use_anim, bot, wait);
      get(url_db).then(async (users) => {
        const p = users.find(o => o._id === id);
        const f = await parses_bal(url, p.data[0], p.data[1]);

        bot.sendMessage(id, `Ваш середній бал на даний момент: ${f.bal}`);
        bot.deleteMessage(id, wait.message_id);
        clearInterval(inter);
      });
      break;

    case butthons[3]: 
      console.log(msg.text);

      const loadingMessage = await bot.sendMessage(id, 'Завантаження...');
      let userDots = {
        id: id,
        data: 0,
      };
      const currentDate = new Date();
      const currentDay = currentDate.getDay();
      dotnet_use.push(userDots);
      const loadingAnimation = anim_load(id, dotnet_use, dotnet_use_anim, bot, loadingMessage);
      let schedule = '';
      get(url_db).then(async (users) => {
        const userData = users.find(o => o._id === id);
        const lessonData = await parses_lesion(url, userData.data[0], userData.data[1]);

        JSON.parse(lessonData)[currentDay - 1].map((urk) => {
          schedule += `Урок: ${urk.urok}\nЧас: ${urk.time}\n\n`;
        });

        bot.sendMessage(id, schedule);
        bot.deleteMessage(id, loadingAnimation.message_id);
        clearInterval(loadingAnimation);
      });
      break;

    case butthons[4]: 
      console.log(msg.text);

      const waits = await bot.sendMessage(id, 'Завантаження...');
      let dots = { id: id, data: 0 };
      const today = new Date();
      const re = today.getDay(); 
      const hor = today.getHours(); 
      const min = today.getMinutes(); 

      dotnet_use.push(dots);
      const inters = anim_load(id, dotnet_use, dotnet_use_anim, bot, waits);

      let rozkl = 'Не вдалося отримати розклад.';
      get(url_db).then(async (users) => {
        const ps = users.find(o => o._id === id);
        const fs = await parses_lesion(url, ps.data[0], ps.data[1]);

        try {
          const lessonsForToday = JSON.parse(fs)[re - 1];

          if (lessonsForToday && lessonsForToday.length > 0) {
            lessonsForToday.forEach((urk) => {
              const [startTime, endTime] = urk.time.split(' - ');
              const [startHour, startMinute] = startTime.split(':').map(Number);
              const [endHour, endMinute] = endTime.split(':').map(Number);

              if (
                (hor > startHour || (hor === startHour && min >= startMinute)) &&
                (hor < endHour || (hor === endHour && min <= endMinute))
              ) {
                rozkl = `Зараз іде урок: ${urk.urok}\nЧас: ${urk.time}`;
              }
            });
          } else {
            rozkl = 'На даний момент уроків немає.';
          }
        } catch (error) {
          console.error('Помилка при обробці розкладу:', error);
          rozkl = 'Не вдалося отримати розклад.';
        }

        bot.sendMessage(id, rozkl);
        bot.deleteMessage(id, waits.message_id);
        clearInterval(inters);
      });
      break;

    default:
      break;
  }
});

bot.on('polling_error', (error) => {
  console.error(error);
});