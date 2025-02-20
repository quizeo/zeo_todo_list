import express from 'express';
import bodyParser from 'body-parser';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
});



app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

let items = [];

async function getTask() {
 try {
    console.log('getTask');
    const result = await db.query('SELECT * FROM action_task ORDER BY id');
    items = result.rows;
 } catch (error) {
    console.log(error);
 }
}

app.get('/', async (req, res) => {
    await  getTask();
    res.render('index.ejs', {listItems: items});

});

app.post('/add',  async(req, res) => {
    try {
        const result = await db.query("INSERT INTO action_task (task) VALUES ($1) RETURNING *", [req.body.newItemTitle]);
        console.log(result);
        res.redirect('/');
    } catch (error) {
        console.log(error); 
        
    }
});


app.post('/edit', async(req, res ) => {
    const id = req.body.updatedItemId;
    const newTitle = req.body.updatedItemTitle;
    try {
        const result =  await db.query("UPDATE action_task SET task = $1 WHERE id = $2", [newTitle, id]);
        res.redirect('/');
    } catch (error) {
        console.log(error); 
    }
});

app.post('/delete', async(req, res) => {
    let ids = req.body.deleteItemId;
    if (!Array.isArray(ids)) {
        ids = [ids]; // Convert to array if it's a single value
    }
    try {
        console.log('ids to delete: ' + ids);
        const result = await db.query("DELETE FROM action_task WHERE id = ANY($1::int[])", [ids]);
        res.redirect('/');
    } catch (error) {
        console.log(error); 
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});