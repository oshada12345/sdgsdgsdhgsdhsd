const { WAConnection, MessageType } = require('wa-automate');
const fs = require('fs');
const ytdl = require('ytdl-core');

// Create a new WhatsApp connection
const conn = new WAConnection();

// Event listener for when the connection is ready
conn.on('open', () => {
  console.log('Connected to WhatsApp');
});

// Event listener for incoming messages
conn.on('message-new', async (message) => {
  try {
    const { from, body } = message;

    // Check if the received message is "Hi"
    if (body.toLowerCase() === 'hi') {
      // Send a reply saying "Hello"
      await conn.sendMessage(from, 'Hello', MessageType.text);
    } else if (body.toLowerCase() === 'download song') {
      // Download a song from YouTube
      const videoUrl = 'https://www.youtube.com/watch?v=1wfeqDyMUx4';
      const info = await ytdl.getInfo(videoUrl);
      const audioFormat = ytdl.chooseFormat(info.formats, { filter: 'audioonly' });

      if (audioFormat) {
        // Download the audio
        const audioStream = ytdl.downloadFromInfo(info, { format: audioFormat });

        // Save the audio to a file
        const audioPath = './song.mp3';
        audioStream.pipe(fs.createWriteStream(audioPath));

        // Send a reply with the download link
        await conn.sendMessage(from, `Song downloaded! You can listen to it here: ${audioPath}`, MessageType.text);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
});

// Load the session data if it exists
const sessionFile = './session.json';
if (fs.existsSync(sessionFile)) {
  conn.loadAuthInfo(sessionFile);
}

// Save the session data on successful connection
conn.on('open', () => {
  const authInfo = conn.base64EncodedAuthInfo();
  fs.writeFileSync(sessionFile, JSON.stringify(authInfo, null, 2));
});

// Start the bot
conn.connect();
