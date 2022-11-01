//require dependencies


const express = require('express');
const path =require("path");
const { v4: uuidv4} = require("uuid");
const fs = require("fs");
const util = require("util");


//create express app PORT variables
const app = express();
const PORT = process.env.PORT || 3001;
let db = require("./app/data/db.json")

// util functions 
const readUtil = util.promisify(fs.readFile);
const writeUtil = util.promisify(fs.writeFile);

//set up express to handle data parsing

app.use(express.urlencoded({ extended: true}));

app.use(express.json());
app.use(express.static(path.join(__dirname + '/app/public')));

// inlcude html-routes.js and api-routes.js in server

app.get("/api/notes",(req,res) =>
readUtil("./app/data/db.json")
.then ((data)=> res.json(JSON.parse(data))),
);
// Handle API POST calls
app.post('/api/notes', (req, res) => {
    const { title, text } = req.body;

    if (title && text) {
        const newNote = {
            title,
            text,
            id: uuidv4(),
        };

        readUtil('./app/data/db.json')
            .then((data) => {
                const existingNotes = JSON.parse(data);
                existingNotes.push(newNote);
                writeUtil('./app/data/db.json', JSON.stringify(existingNotes));
            });

        const response = {
            status: 'success',
            body: newNote,
        };

        res.status(201).json(response);

    } else {
        res.status(500).json('Error in saving Note');
    }
});

// Handle Delete calls
app.delete('/api/notes/:id', (req, res) => {
    readUtil('./app/data/db.json')
        .then((data) => {
            let notes = JSON.parse(data);

            for (let i = 0; i < notes.length; i++) {
                let currentNote = notes[i];
                if (currentNote.id === req.params.id) {
                    notes.splice(i, 1);
                    writeUtil('./app/data/db.json', JSON.stringify(notes))
                    return res.status(200).json(`${currentNote} was removed successfully!`);
                }
            }

            return res.status(500).json('Error in deleting Note');

        })
});


app.get("/notes",(req,res) =>
res.sendFile(path.join(__dirname, "/app/public/notes.html"))
);

app.get("/*",(req,res) =>
res.sendFile(path.join(__dirname, "/app/public/index.html"))
);

app.listen(PORT, ()=>
    console.log( "Listening on PORT:" + PORT),
);

