from fastapi import FastAPI, Request
from telegram import Update, Bot
from telegram.ext import Application, CommandHandler, MessageHandler, ContextTypes, filters
import os
import logging

# 设置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 初始化 FastAPI 应用
app = FastAPI()

# Telegram Bot Token
BOT_TOKEN = os.getenv("BOT_TOKEN")
if not BOT_TOKEN:
    raise ValueError("环境变量 BOT_TOKEN 未设置")

# 初始化 Telegram Bot 和应用
bot = Bot(token=BOT_TOKEN)
application = Application.builder().token(BOT_TOKEN).build()

# /start 命令处理
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("你好！请发送一个 Telegram 消息链接，我会解析内容并返回。")

# 消息处理
async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_message = update.message.text
    if "https://t.me/" not in user_message:
        await update.message.reply_text("请发送有效的 Telegram 消息链接！")
        return
    await update.message.reply_text(f"收到链接：{user_message}")

# 注册命令和处理器
application.add_handler(CommandHandler("start", start))
application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

# Webhook 入口
@app.post("/")
async def webhook(request: Request):
    try:
        data = await request.json()
        update = Update.de_json(data, bot)
        await application.update_queue.put(update)
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Webhook 处理失败: {e}")
        return {"status": "error", "message": str(e)}
