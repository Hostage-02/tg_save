import logging
import os
from telegram import Update, Bot
from telegram.ext import Application, CommandHandler, MessageHandler, ContextTypes, filters

# 日志配置
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Telegram Bot Token
BOT_TOKEN = os.getenv("BOT_TOKEN")

# 初始化机器人
bot = Bot(token=BOT_TOKEN)
application = Application.builder().token(BOT_TOKEN).build()

# 处理 /start 命令
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("你好！请发送一个 Telegram 消息链接，我会解析内容并返回可转发消息。")

# 处理消息链接
async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_message = update.message.text

    if "https://t.me/" not in user_message:
        await update.message.reply_text("请发送有效的 Telegram 消息链接！")
        return

    # 此处可扩展为实际解析链接内容的功能
    await update.message.reply_text(f"收到链接：{user_message}")

# 添加命令和消息处理器
application.add_handler(CommandHandler("start", start))
application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

# Vercel 函数处理入口
async def handler(event, context):
    """Vercel 的入口函数"""
    try:
        # 从请求中获取更新
        update = Update.de_json(event["body"], bot)
        await application.update_queue.put(update)
        return {"statusCode": 200, "body": "OK"}
    except Exception as e:
        logger.error(f"错误: {e}")
        return {"statusCode": 500, "body": str(e)}
