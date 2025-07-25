// server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // For generating unique IDs

const app = express();
const PORT = process.env.PORT || 3000;
const SONGS_FILE = path.join(__dirname, 'songs.json');

// Middleware
app.use(cors()); // Allows your frontend to make requests to this server
app.use(express.json()); // Parses JSON bodies of incoming requests

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Helper function to read songs from the JSON file
const readSongs = () => {
    try {
        if (!fs.existsSync(SONGS_FILE)) {
            fs.writeFileSync(SONGS_FILE, '[]', 'utf8'); // Create empty array if file doesn't exist
            return [];
        }
        const data = fs.readFileSync(SONGS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading songs.json:', error);
        return [];
    }
};

// Helper function to write songs to the JSON file
const writeSongs = (songs) => {
    try {
        fs.writeFileSync(SONGS_FILE, JSON.stringify(songs, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing songs.json:', error);
    }
};

// API Endpoints

// GET all songs
app.get('/api/songs', (req, res) => {
    const songs = readSongs();
    res.json(songs);
});

// POST a new song
app.post('/api/songs', (req, res) => {
    const { title, url } = req.body;

    if (!title || !url) {
        return res.status(400).json({ message: 'Title and URL are required.' });
    }

    const songs = readSongs();
    const newSong = { id: uuidv4(), title, url }; // Assign a unique ID
    songs.push(newSong);
    writeSongs(songs);
    res.status(201).json(newSong);
});

// DELETE a song by ID
app.delete('/api/songs/:id', (req, res) => {
    const songId = req.params.id;
    let songs = readSongs();
    const initialLength = songs.length;

    songs = songs.filter(song => song.id !== songId);

    if (songs.length === initialLength) {
        return res.status(404).json({ message: 'Song not found.' });
    }

    writeSongs(songs);
    res.status(200).json({ message: 'Song deleted successfully.' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Access frontend at http://localhost:${PORT}`);
    console.log(`Songs API at http://localhost:${PORT}/api/songs`);
});

