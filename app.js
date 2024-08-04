const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect('mongodb://127.0.0.1:27017/loginDB')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define a schema and model for user
const userSchema = new mongoose.Schema({
    username: String,
    password: String
});
const User = mongoose.model('User', userSchema);

// Serve the HTML page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle form submission
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        let user = await User.findOne({ username });
        if (user) {
            // User exists, check password
            if (user.password === password) {
                // Respond with success
                res.json({ success: true });
            } else {
                // Respond with error
                res.json({ error: 'Invalid Password' });
            }
        } else {
            // Create new user
            user = new User({ username, password });
            await user.save();
            // Respond with success
            res.json({ success: true });
        }
    } catch (error) {
        console.error('Error handling login:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = app;
