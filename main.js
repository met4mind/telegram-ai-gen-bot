const { Telegraf } = require("telegraf");
const axios = require("axios");
const FormData = require("form-data");

const BOT_TOKEN = "8581325832:AAHnTefrJH4Z0hCbttsNXWA7tyXFkX_AMK8";
const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply("سلام! یه عکس بفرست تا برات پردازش کنم.");
});

bot.on("photo", async (ctx) => {
  try {
    const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
    const fileUrl = await ctx.telegram.getFileLink(fileId);

    const imageResponse = await axios.get(fileUrl.href, {
      responseType: "arraybuffer",
    });
    const base64Image = Buffer.from(imageResponse.data).toString("base64");

    const form = new FormData();
    form.append(
      "prompt",
      "Describe this image and create a similar artistic version",
    );
    form.append("output_format", "bytes");
    form.append("user_profile_id", "null");
    form.append("anonymous_user_id", "a9ae6908-77d4-4d34-9d17-dc72afc59b94");
    form.append("request_timestamp", (Date.now() / 1000).toString());
    form.append("user_is_subscribed", "false");
    form.append("client_id", "pSgX7WgjukXCBoYwDM8G8GLnRRkvAoJlqa5eAVvj95o");
    form.append("image", Buffer.from(base64Image, "base64"), "image.jpg");

    const apiResponse = await axios.post(
      "https://ai-api.magicstudio.com/api/ai-art-generator",
      form,
      {
        headers: form.getHeaders(),
        responseType: "arraybuffer",
      },
    );

    await ctx.replyWithPhoto({ source: Buffer.from(apiResponse.data) });
  } catch (error) {
    await ctx.reply("مشکلی پیش اومد: " + error.message);
  }
});

bot.launch();
