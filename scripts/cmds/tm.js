const axios = require("axios");

const API = "https://tempmail-api-rose.vercel.app";
const P = {
  g: "gmail.com", gmail: "gmail.com",
  o: "outlook.com", outlook: "outlook.com",
  h: "hotmail.com", hotmail: "hotmail.com",
  e: "high.edu.pl", edu: "high.edu.pl", student: "high.edu.pl", s: "high.edu.pl"
};

module.exports = {
  config: {
    name: "tempmail",
    aliases: ["tm", "mail"],
    version: "4.0",
    author: "Rafix4x",
    countDown: 5,
    role: 0,
    shortDescription: "Auto Temp Mail",
    longDescription: "Generate a temp email (pick provider) and auto-fetch inbox.",
    category: "utility",
    guide: "{pn} [gmail|outlook|hotmail|edu]\n{pn} g / o / h / e"
  },

  onStart: async function ({ event, message }) {
    try {
      const arg = (event.body || "").trim().split(/\s+/)[1]?.toLowerCase();
      const provider = arg ? P[arg] : null;
      if (arg && !provider) {
        return message.reply("❌ Provider: gmail(g) | outlook(o) | hotmail(h) | edu(e)");
      }

      const genUrl = provider
        ? `${API}/api/address?providers=${provider}`
        : `${API}/api/address`;
      const { data: gen } = await axios.get(genUrl);
      const email = gen.email;
      if (!email) return message.reply("❌ Failed to generate email.");

      message.reply(
        `📧 𝐓𝐞𝐦𝐩 𝐌𝐚𝐢𝐥\n━━━━━━━━━━━━━━━━━━\n📬 ${email}\n\n⏳ Waiting for messages...`
      );

      const start = Date.now();
      const timeout = 10 * 60 * 1000;
      const interval = setInterval(async () => {
        if (Date.now() - start > timeout) return clearInterval(interval);
        try {
          const { data: inbox } = await axios.get(
            `${API}/api/inbox?email=${encodeURIComponent(email)}`
          );
          const list = inbox?.data;
          if (Array.isArray(list) && list.length > 0) {
            clearInterval(interval);
            const m = list[0];
            const body = (m.body || m.text || "No content.")
              .replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
            message.reply(
              `📬 𝐍𝐞𝐰 𝐄𝐦𝐚𝐢𝐥\n━━━━━━━━━━━━━━━━━━\n` +
              `👤 ${m.from || "?"}\n` +
              `📌 ${m.subject || "(No subject)"}\n` +
              `📅 ${m.date ? new Date(m.date).toLocaleString() : "?"}\n` +
              `━━━━━━━━━━━━━━━━━━\n📝 ${body}`
            );
          }
        } catch {}
      }, 5000);
    } catch {
      return message.reply("❎ Error processing request.");
    }
  }
};
