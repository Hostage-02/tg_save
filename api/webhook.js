// api/webhook.js
const TelegramBot = require('node-telegram-bot-api');

// 初始化 bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
bot.setWebHook(process.env.WEBHOOK_URL);

// 处理消息的主函数
async function handleMessage(message) {
  try {
    const chatId = message.chat.id;
    const text = message.text;

    // 检查消息是否包含 Telegram 链接
    if (!text || !isTelegramLink(text)) {
      return bot.sendMessage(chatId, "请发送一个有效的 Telegram 消息链接。");
    }

    // 从链接中提取消息内容
    const messageContent = await extractMessageContent(text);
    if (!messageContent) {
      return bot.sendMessage(chatId, "无法获取消息内容，请确认链接是否正确。");
    }

    // 发送处理后的消息
    await bot.sendMessage(chatId, messageContent, { parse_mode: 'HTML' });
  } catch (error) {
    console.error('Error handling message:', error);
    await bot.sendMessage(message.chat.id, "处理消息时出现错误，请稍后重试。");
  }
}

// 验证 Telegram 链接
function isTelegramLink(text) {
  return text.match(/t\.me\/[a-zA-Z0-9_]+\/\d+/);
}

// 提取消息内容
async function extractMessageContent(link) {
  try {
    // 解析链接获取 channel 和 message_id
    const [, channelName, messageId] = link.match(/t\.me\/([^/]+)\/(\d+)/);
    
    // 使用 Telegram API 获取消息内容
    const result = await bot.forwardMessage(
      process.env.TEMP_CHANNEL_ID, // 临时存储频道
      `@${channelName}`,
      messageId
    );

    // 格式化消息内容
    let content = result.text || '';
    if (result.caption) {
      content = result.caption;
    }

    // 添加媒体内容处理（如果需要）
    if (result.photo) {
      content = `[图片]\n${content}`;
    }
    if (result.video) {
      content = `[视频]\n${content}`;
    }
    
    return content;
  } catch (error) {
    console.error('Error extracting message:', error);
    return null;
  }
}

// Vercel 处理函数
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const update = req.body;
    if (update.message) {
      await handleMessage(update.message);
    }
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
