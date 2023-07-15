const { Client, Events, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
require('dotenv').config();

const channelId = process.env.CHANNEL_ID;
const token = process.env.TOKEN;
const dataFile = 'data.json';

let eggStreak = 0;
let lastUser = '';
let lastContent = '';

// Load data from data.json
const loadData = () => {
  try {
    const data = fs.readFileSync(dataFile);
    const { streak, user } = JSON.parse(data);
    eggStreak = streak;
    lastUser = user;
  } catch (error) {
    console.error('Failed to load data:', error);
  }
};

// Save data to the JSON file
const saveData = () => {
  const data = JSON.stringify({ streak: eggStreak, user: lastUser });
  fs.writeFile(dataFile, data, (error) => {
    if (error) {
      console.error('Failed to save data:', error);
    }
  });
};

// Logs current user to console
client.on(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}`);
  loadData();
});

// main stuff
client.on(Events.MessageCreate, (message) => {
  if (message.channel.id === channelId && !message.author.bot) {
    const content = message.content.toLowerCase();
    const isEgg = content.includes('egg');

    if (isEgg && (lastUser !== message.author.id || lastContent !== content)) {
      eggStreak++;
    } else if (!isEgg) {
      eggStreak = 0;
      message.channel.send(`${message.author} just broke the egg streak :/`);
    } else if (lastUser === message.author.id) {
      message.channel.send(`${message.author} just broke the egg streak :/. You cannot say 'egg' 2 times in a row.`);
      eggStreak = 0;
    }

    lastUser = message.author.id;
    lastContent = content;

    saveData();

    message.channel.setTopic(`Current egg streak: ${eggStreak}`)
    console.log(`Current egg count: ${eggStreak}\nLast egger: ${lastUser}`)
    console.log(`Data Saved!`)
  }
});

client.login(token);
