const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// 替换为您的 Bot Token
const BOT_TOKEN = 'YOUR_BOT_TOKEN';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

// 处理 Telegram Webhook
app.post('/webhook', async (req, res) => {
    const { message } = req.body;

    if (message && message.text) {
        const chatId = message.chat.id;
        const text = message.text;

        // 解析链接（这里假设用户发送的消息是转发链接）
        if (text.startsWith('https://t.me/')) {
            // 模拟获取内容（根据实际需求替换为您的逻辑）
            const content = `您发送的链接是：${text}\n内容已处理！`;
            await sendMessage(chatId, content);
        } else {
            await sendMessage(chatId, '请发送有效的 Telegram 链接！');
        }
    }

    res.sendStatus(200);
});

// 发送消息的函数
async function sendMessage(chatId, text) {
    await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
        chat_id: chatId,
        text,
    });
}

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
