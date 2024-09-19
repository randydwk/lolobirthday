require('dotenv').config();

const path = require('path');
const express = require("express");
const pool = require('./db');

const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.json());
app.use(express.static(path.resolve(__dirname, '../client/build')));

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

app.post('/code', async (req, res) => {
  const { code, playerId } = req.body;

  try {
    const gamestep = (await pool.query(`SELECT * FROM gamestep g WHERE g.code = $1`,[code])).rows;
    const currentPlayer = (await pool.query(`SELECT * FROM player p WHERE p.id = $1`,[playerId])).rows;

    
    if (currentPlayer.length>0) {
      if (gamestep.length>0 && gamestep[0].id === (currentPlayer[0].step+1)) {
        await pool.query(`UPDATE player SET step = $1 WHERE id = $2`,[gamestep[0].id,currentPlayer[0].id]);

        const newScore = currentPlayer[0].score+10+gamestep[0].id*10;
        await pool.query(`UPDATE player SET score = $1 WHERE id = $2`,[newScore,currentPlayer[0].id]);

        res.status(200).json({ message: 'SUCCESS' });
      } else if ((gamestep.length>0 && gamestep[0].id <= currentPlayer[0].step)) {
        res.status(200).json({ message: 'VISITED' });
      } else if (currentPlayer[0].step==10) {
        res.status(200).json({ message: 'END' });
      } else {
        const newScore = currentPlayer[0].score-30;
        await pool.query(`UPDATE player SET score = $1 WHERE id = $2`,[newScore,currentPlayer[0].id]);

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

// General

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});

// Websockets

const WS_PORT = 3002;
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: WS_PORT }, () => {
  console.log(`WebSocket server listening on ${WS_PORT}`);
});

wss.on('connection', ws => {
  console.log('New client connected');

  ws.on('message', message => {
    console.log(`Received message => ${message}`);
    ws.send(`Echo: ${message}`);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', error => {
    console.error('WebSocket error:', error);
  });
});