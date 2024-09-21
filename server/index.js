require('dotenv').config();
const path = require('path');
const express = require("express");
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const sharp = require('sharp');
const ExifReader = require('exif-reader');
const url = require('url');
const uuidv4 = require("uuid").v4;
const http = require('http');
const {WebSocketServer} = require('ws');
const pool = require('./db');

const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.json());
app.use(express.static(path.resolve(__dirname, '../client/build')));

// Websockets

const server = http.createServer(app);
const wsServer = new WebSocketServer({server});
const connections = {};
const users = {};

const handleMessage = (bytes) => {
  const message = JSON.parse(bytes.toString());
  sendMessage(message);
  console.log(message);
}

const sendMessage = (message) => {
  Object.keys(connections).forEach(uuid => {
    const connection = connections[uuid];
    const user = users[uuid];
    if (!message.to || message.to == user.username){
      connection.send(JSON.stringify(message));
    }
  });
}

const handleClose = uuid => {
  console.log(`${users[uuid].username} disconnected`);
  delete connections[uuid];
  delete users[uuid];
}

wsServer.on("connection", (connection, request) => {
  const { username } = url.parse(request.url, true).query;
  const uuid = uuidv4();
  console.log(`${username} (${uuid}) connected`);

  connections[uuid] = connection;
  users[uuid] = {
    username: username,
    state: {}
  }
  if (username=='home') gestionUuid = uuid;

  connection.on("message", message => handleMessage(message,uuid));
  connection.on("close", () => handleClose(uuid));
})

// Photos upload

const upload = multer();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

app.post('/upload', upload.single('photo'), async (req, res) => {
  try {
    const file = req.file;
    const authorId = req.body.authorId;

    const imageBuffer = file.buffer;
    const metadata = await sharp(imageBuffer).metadata();
    let resizedImage = sharp(imageBuffer);
    if (metadata.orientation) resizedImage = resizedImage.rotate();
    resizedImage = await resizedImage
      .resize({ width: 1920, height: 1920, fit: 'inside' })
      .toBuffer();

    const now = new Date();
    const formattedDate = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
    const formattedTime = `${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}`;
    const randomNum = Math.floor(Math.random() * 100);
    const fileName = `IMG_BD_${formattedDate}_${formattedTime}_${randomNum}`;
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileName,
        Body: resizedImage,
        ContentType: file.mimetype
    };

    const command = new PutObjectCommand(params);
    await s3.send(command);

    const s3Url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    const newPhoto = await pool.query('INSERT INTO photo (filename,author,url) VALUES ($1,$2,$3) RETURNING *',[fileName,authorId,s3Url]);

    sendMessage({msg:"PHOTO",to:"gestion",url:s3Url,authorId:authorId,photoId:newPhoto.rows[0].id});
    res.json({ message: 'Upload successful', photo:newPhoto.rows[0] });
  } catch (err) {
    console.error('Error uploading to S3 or saving to DB:', err.message);
    res.status(500).send('Server Error');
  }
});

// Database

app.get('/players', async (req, res) => {
  try {
    const players = await pool.query('SELECT * FROM player');
    res.json(players.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.get('/player/:id', async (req, res) => {
  const playerId = parseInt(req.params.id);

  try {
    const currentPlayer = (await pool.query(`SELECT p.id,name,step,score,place as stepplace,title as steptitle,enigm as stepenigm
                                            FROM player p JOIN gamestep g ON p.step=g.id
                                            WHERE p.id = $1`,[playerId])).rows[0];
    res.json(currentPlayer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.post('/playerscore', async (req, res) => {
  const { playerId, score } = req.body;
  if (!playerId || !score) return res.status(400).json({ error: 'PlayerId and score are required' });
  try {
    const result = await pool.query('UPDATE player SET score = $1 WHERE id = $2 RETURNING *',[score,playerId]);
    sendMessage({msg:"SCORE",to:"gestion"});
    sendMessage({msg:"SCORE",to:"admin"});
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error updating player score:', err);
    res.status(500).json({ error: 'An error occurred while updating the player score' });
  }
});

app.get('/params', async (req, res) => {
  try {
    const params = await pool.query('SELECT * FROM params');
    res.json(params.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.post('/params', async (req, res) => {
  const { param, value } = req.body;
  if (!param || value===undefined) return res.status(400).json({ error: 'Param and value are required' });
  try {
    const result = await pool.query(`UPDATE params SET ${param} = $1`,[value]);
    sendMessage({msg:"PARAMS"});
    res.status(201).json({ message: 'ok' });
  } catch (err) {
    console.error('Error updating parameter:', err);
    res.status(500).json({ error: 'An error occurred while updating the parameter' });
  }
});

app.post('/code', async (req, res) => {
  const { code, playerId } = req.body;
  if (!code || !playerId) return res.status(400).json({ error: 'Code and playerId are required' });

  try {
    const gamestep = (await pool.query(`SELECT * FROM gamestep g WHERE g.code = $1`,[code])).rows;
    const currentPlayer = (await pool.query(`SELECT * FROM player p WHERE p.id = $1`,[playerId])).rows;
    
    if (currentPlayer.length>0) {
      if (gamestep.length>0 && gamestep[0].id === (currentPlayer[0].step+1)) {
        await pool.query(`UPDATE player SET step = $1 WHERE id = $2`,[gamestep[0].id,currentPlayer[0].id]);

        const newScore = currentPlayer[0].score+10+gamestep[0].id*10;
        await pool.query(`UPDATE player SET score = $1 WHERE id = $2`,[newScore,currentPlayer[0].id]);

        sendMessage({msg:"SCORE",to:"gestion"});
        sendMessage({msg:"SCORE",to:"admin"});
        res.status(200).json({ message: 'SUCCESS' });

      } else if ((gamestep.length>0 && gamestep[0].id <= currentPlayer[0].step)) {
        res.status(200).json({ message: 'VISITED' });

      } else if (currentPlayer[0].step==10) {
        res.status(200).json({ message: 'END' });

      } else {
        const newScore = currentPlayer[0].score-30;
        await pool.query(`UPDATE player SET score = $1 WHERE id = $2`,[newScore,currentPlayer[0].id]);
        sendMessage({msg:"SCORE",to:"gestion"});
        sendMessage({msg:"SCORE",to:"admin"});
        res.status(200).json({ message: 'ACCIDENT' });
      }
    } else {
      res.status(404).json({ message: 'Player not found' });
    }

  } catch (error) {
    console.error('Error fetching gamestep details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/karaoke', async (req, res) => {
  try {
    const songs = await pool.query('SELECT * FROM karaoke');
    res.json(songs.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.post('/karaoke', async (req, res) => {
  const { song, submitter } = req.body;
  if (!song || !submitter) return res.status(400).json({ error: 'Song and submitter are required' });

  try {
    const result = await pool.query('INSERT INTO karaoke (song,submitter) VALUES ($1,$2) RETURNING *',[song,submitter]);
    sendMessage({msg:"KARAOKE"});
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error inserting karaoke song:', err);
    res.status(500).json({ error: 'An error occurred while adding the karaoke song' });
  }
});

// General

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

server.listen(PORT,() => {
  console.log(`Server listening on ${PORT}`)
})