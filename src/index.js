const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const moment = require("moment-timezone");
const colors = require("colors");

const client = new Client({
  restartOnAuthFail: true,
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--unhandled-rejections=strict",
    ],
  },
  ffmpeg: "../ffmpeg.exe",
  authStrategy: new LocalAuth({ clientId: "client" }),
});
const config = {
  name: "Jomok Sticker Bot v2",
  author: "Hanzou",
  prefix: ".",
  timezone: "Asia/Jakarta",
  groups: true,
};

client.on("qr", (qr) => {
  console.log(
    `[${moment().tz(config.timezone).format("HH:mm:ss")}] Scan the QR below : `
  );
  qrcode.generate(qr, { small: true });
});

client.on("ready", async () => {
  console.clear();

  console.log(
    `[${moment().tz(config.timezone).format("HH:mm:ss")}] ${
      config.name
    } is Already!`.green
  );
});

client.on("message", async (message) => {
  const isGroups = message.from.endsWith("@g.us") ? true : false;
  if ((isGroups && config.groups) || !isGroups) {
    const isStickerCommand = message.body.startsWith(`${config.prefix}sticker`);

    const isReimgCommand = message.body.startsWith(`${config.prefix}image`);

    const hasMedia = message.hasMedia;
    const hasCaptionStickerCommand =
      message._data.caption == `${config.prefix}sticker`;

    if ((hasMedia || hasCaptionStickerCommand) && !isStickerCommand) {
      return;
    }

    if (isStickerCommand || hasCaptionStickerCommand) {
      if (
        message.type == "image" ||
        message.type == "video" ||
        message.type == "gif" ||
        message._data.caption == `${config.prefix}sticker`
      ) {
        try {
          const media = await message.downloadMedia();
          client.sendMessage(message.from, "*[⏳]* Wait..");
          client
            .sendMessage(message.from, media, {
              sendMediaAsSticker: true,
              stickerName: config.name,
              stickerAuthor: config.author,
            })
            .then(() => {
              client.sendMessage(message.from, "*[✅]* Your Sticker!");
            });
        } catch {
          client.sendMessage(message.from, "*[🔴]* Error!");
        }
      } else if (message.body == `${config.prefix}sticker`) {
        const quotedMsg = await message.getQuotedMessage();
        if (message.hasQuotedMsg && quotedMsg.hasMedia) {
          client.sendMessage(message.from, "*[⏳]* Wait..");
          try {
            const media = await quotedMsg.downloadMedia();
            client
              .sendMessage(message.from, media, {
                sendMediaAsSticker: true,
                stickerName: config.name,
                stickerAuthor: config.author,
              })
              .then(() => {
                client.sendMessage(message.from, "*[✅]* Your Sticker!");
              });
          } catch {
            client.sendMessage(message.from, "*[🔴]* Error!");
          }
        } else {
          client.sendMessage(message.from, "*[❎]* Where's your media?!");
        }
      } else if (message.type == "sticker") {
        client.sendMessage(message.from, "*[⏳]* Wait..");
        try {
          const media = await message.downloadMedia();
          client.sendMessage(message.from, media).then(() => {
            client.sendMessage(message.from, "*[✅]* Your Sticker!");
          });
        } catch {
          client.sendMessage(message.from, "*[🔴]* Error!");
        }
      } } else if (isReimgCommand) {
  const quotedMsg = await message.getQuotedMessage();
  if (quotedMsg && quotedMsg.type === "sticker" || quotedMsg.type === "image" || quotedMsg.type === "video" || quotedMsg.type === "gif") {
    client.sendMessage(message.from, "*[⏳]* Wait..");
    try {
      const media = await quotedMsg.downloadMedia();
      await client.sendMessage(message.from, media, {
        caption: "Bingo!",
        //sendMediaAsDocument: true,
        //sendMediaAsImage: true,
        //sendMediaAsVideo: true,
      });
      client.sendMessage(message.from, "*[✅]* Your Image!");
    } catch (error) {
      console.error(error);
      client.sendMessage(message.from, "*[🔴]* Error!");
    }
  } else {
    client.sendMessage(message.from, "*[❎]* Where's your sticker?!");
  }
}
    } else {
      client.getChatById(message.id.remote).then(async (chat) => {
        await chat.sendSeen();
      });
    }
});

client.initialize();
