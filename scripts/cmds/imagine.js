const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
	config: {
		name: "imagine",
		aliases: ["gen", "aiimg"],
		version: "1.0",
		author: "Rocky",
		countDown: 10,
		role: 0,
		shortDescription: {
			en: "Generate an image from text using AI"
		},
		longDescription: {
			en: "Generate an image from a text prompt using Rocky's AI API"
		},
		category: "image",
		guide: {
			en: "{pn} <prompt>\nExample: {pn} a cat wearing sunglasses"
		}
	},

	onStart: async function ({ api, event, args, message }) {
		const prompt = args.join(" ");

		if (!prompt) {
			return message.reply("❌ Please give me a prompt.\nExample: imagine a cat wearing sunglasses");
		}

		const cacheDir = path.join(__dirname, "cache");
		const imgPath = path.join(cacheDir, `${Date.now()}_gen.jpg`);
		await fs.ensureDir(cacheDir);

		const waitMsg = await message.reply("🔄 Generating your image, please wait...");

		try {
			const baseURL = "https://rocky-image-api-two.vercel.app";

			const res = await axios.get(
				`${baseURL}/api/generate`,
				{
					params: { prompt },
					responseType: "arraybuffer"
				}
			);

			await fs.writeFile(imgPath, Buffer.from(res.data, "binary"));

			await message.reply({
				body: `✅ Here's your generated image\nPrompt: "${prompt}"`,
				attachment: fs.createReadStream(imgPath)
			});

		} catch (err) {
			console.error("Rocky Generate Command Error:", err);
			return message.reply(`❌ Failed to generate image: ${err.message}`);
		} finally {
			if (waitMsg?.messageID) api.unsendMessage(waitMsg.messageID);
			setTimeout(() => {
				if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
			}, 10000);
		}
	}
};
