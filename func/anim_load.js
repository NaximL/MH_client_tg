const anim_load = (id, dotnet_use, dotnet_use_anim, bot, wait) => {
    const inter = setInterval(() => {
      let d = dotnet_use.find(o => o.id === id);
      d.data += 1;
        const text = `Завантаження${dotnet_use_anim[d.data-1]}`

        bot.editMessageText(text, {
          chat_id: id,
          message_id: wait.message_id
        });
        
        if (d.data ===4 ){d.data = 0;}
      
  
    }, 400);
  
    return inter;
  };
  
module.exports = anim_load;