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

        const newScore = currentPlayer[0].score+Math.floor(5+gamestep[0].id*10);
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

/*
app.post('/cocktailmake', async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      const { cocktailId, cocktailNb } = req.body;

      await client.query('BEGIN');

      await client.query(`UPDATE cocktail SET nbmade = nbmade - $1 WHERE id = $2`,[cocktailNb,cocktailId]);

      const {rows: recipes} = await client.query(`
        SELECT r.ingredient_id as ingredient_id, sum(r.quantity) as quantity, i.name, i.stock
        FROM recipe r JOIN ingredient i ON r.ingredient_id = i.id
        WHERE r.cocktail_id = $1 GROUP BY r.ingredient_id, i.name, i.stock;`,
        [cocktailId]);

      for (const recipe of recipes) {
        const newStock = Math.max(recipe.stock+(recipe.quantity*cocktailNb),0);
        await client.query(`UPDATE ingredient SET stock = $1 WHERE id = $2`,[newStock,recipe.ingredient_id]);
      }

      const {rows: glass} = await client.query(`
        SELECT g.id,g.stock
        FROM glass g
        JOIN cocktail c ON g.id = c.glass
        WHERE c.id = $1`,
        [cocktailId]);
      
      if (glass.length === 0) {throw new Error('No glass found for the provided cocktail ID.');}

      const newGlassStock = Math.max(glass[0].stock+cocktailNb,0);
      await client.query(`UPDATE glass SET stock = $1 WHERE id = $2`,[newGlassStock,glass[0].id]);

      await client.query('COMMIT');
      res.json({ success: true, message: 'Cocktail made successfully!' });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    // if (newStock < 0) {
    //   await client.query('ROLLBACK');
    //   return res.status(400).json({ success: false, message: `Plus assez de ${recipe.name} en stock.` });
    // }
  } catch (error) {
    console.error('Error making cocktail:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});
*/

// General

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});