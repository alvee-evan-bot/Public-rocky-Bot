const axios = require("axios");
const { getStreamFromURL } = global.utils;

const LANG_CODES = ["en", "vi", "ja", "ko", "zh-CN", "fr", "de", "es", "pt", "ru", "th", "id", "hi", "ar"];

module.exports = {
	config: {
		name: "say",
		aliases: ["tts", "speak"],
		version: "1.0",
		author: "Neoaz 🐊",
		countDown: 5,
		role: 0,
		description: {
			en: "convert text to speech and send it as a voice message"
		},
		category: "fun",
		guide: {
			en: "{pn} <text>"
				+ "\n   {pn} -<lang> <text> (lang: %1)"
		}
	},

	langs: {
		en: {
			noText: "❌ Please enter the text you want me to say.",
			tooLong: "❌ Text is too long (max %1 characters).",
			loading: "🐊 Generating voice...",
			error: "❌ Could not generate the voice message:\n%1"
		}
	},

	onStart: async function ({ args, message, event, getLang, api }) {
		if (!args.length)
			return message.reply(getLang("noText"));

		let lang = "en";
		if (args[0].startsWith("-")) {
			const code = args.shift().slice(1);
			if (LANG_CODES.some(c => c.toLowerCase() === code.toLowerCase()))
				lang = LANG_CODES.find(c => c.toLowerCase() === code.toLowerCase());
		}

		let text = args.join(" ").trim();
		if (!text)
			return message.reply(getLang("noText"));
		if (text.length > 200)
			return message.reply(getLang("tooLong", 200));

		const msg = await message.reply(getLang("loading"));
		try {
			const url = "https://translate.google.com/translate_tts"
				+ `?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${encodeURIComponent(lang)}&client=tw-ob`;
			const stream = await getStreamFromURL(url, { headers: { "User-Agent": "Mozilla/5.0" } });
			const body = `🔊 "${text}"`;
			if (msg && msg.messageID && typeof api.editMessage == "function") {
				await api.editMessage(body, msg.messageID);
				return message.send({ attachment: stream });
			}
			return message.send({ body, attachment: stream });
		}
		catch (err) {
			if (msg && msg.messageID && typeof api.editMessage == "function")
				await api.editMessage(getLang("error", err.message), msg.messageID);
			else
				return message.reply(getLang("error", err.message));
		}
	}
};
