import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from "discord.js";
const TOKEN = "MTQ4MzIyMTA0NDAzNzY4MTE4Mw.GrV0O9.7M6NCKvr_egbvI1ytprbc7VemJujhNt7S8J3Us";
const CHANNEL_ID = "1483141875115495485";
const CLIENT_ID = Buffer.from(TOKEN.split(".")[0], "base64").toString("utf-8");
const EMOJI_NAMES = { v1: ["spirit","portal","mammouth","buhdah","pain","gravity","celebration_bombe"], v2: "t_rex", v3: "dought", v4: "venom" };
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildEmojisAndStickers] });
let lastMessageId = null;
const toK = v => `${v/1000}k`;
const generateValue = (min,max) => { const s=10000,a=Math.ceil(min/s),b=Math.floor(max/s); return (Math.floor(Math.random()*(b-a+1))+a)*s; };
const formatEmoji = (name,guild) => { const e=guild.emojis.cache.find(e=>e.name===name); if(!e) return `:${name}:`; return e.animated?`<a:${e.name}:${e.id}>`:`<:${e.name}:${e.id}>`; };
async function updateMessage() {
  try {
    const ch = await client.channels.fetch(CHANNEL_ID);
    if (!ch?.isTextBased()) return;
    const guild = ch.guild;
    await guild.emojis.fetch();
    const e1=EMOJI_NAMES.v1.map(n=>formatEmoji(n,guild)).join(" / "),e2=formatEmoji(EMOJI_NAMES.v2,guild),e3=formatEmoji(EMOJI_NAMES.v3,guild),e4=formatEmoji(EMOJI_NAMES.v4,guild);
    const msg=`📊 Mise à jour des valeurs\n\n${toK(generateValue(40000,150000))} bounty = ${e1}\n${toK(generateValue(150000,250000))} bounty = ${e2}\n${toK(generateValue(200000,400000))} bounty = ${e3}\n${toK(generateValue(450000,650000))} bounty = ${e4}`;
    if (lastMessageId) { try { await (await ch.messages.fetch(lastMessageId)).delete(); } catch {} }
    else { try { const r=await ch.messages.fetch({limit:20}); const o=r.find(m=>m.author.id===client.user?.id); if(o) await o.delete(); } catch {} }
    lastMessageId = (await ch.send(msg)).id;
    console.log("Message envoyé !");
  } catch(err) { console.error(err); }
}
function scheduleNextMessage() {
  const now=new Date(), next=new Date();
  next.setHours(6,0,0,0);
  while(next<=now) next.setDate(next.getDate()+3);
  console.log(`Prochain message : ${next.toLocaleString()}`);
  setTimeout(async()=>{ await updateMessage(); scheduleNextMessage(); }, next-now);
}
client.once("clientReady", async () => {
  console.log(`Connecté : ${client.user.tag}`);
  const ch = await client.channels.fetch(CHANNEL_ID);
  if (ch?.isTextBased()) {
    const rest=new REST().setToken(TOKEN);
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID,ch.guild.id),{body:[new SlashCommandBuilder().setName("forceuptd").setDescription("Force la mise à jour").toJSON()]});
  }
  scheduleNextMessage();
});
client.on("interactionCreate", async i => {
  if (!i.isChatInputCommand()||i.commandName!=="forceuptd") return;
  await i.deferReply({ephemeral:true});
  await updateMessage();
  await i.editReply("✅ Valeurs mises à jour !");
});
client.on("error", console.error);
client.login(TOKEN);
