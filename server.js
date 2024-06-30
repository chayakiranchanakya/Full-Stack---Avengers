const express = require('express');
const path = require('path');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const serviceAccount = require("./cha.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); 
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "log.html"));
});

app.get("/ave.html", function(req, res) {
  res.sendFile(path.join(__dirname, "ave.html"));
});

app.post("/login", async function(req, res) {
  const { email, password } = req.body;
  try {
    const usersRef = db.collection('signup_s');
    const snapshot = await usersRef.where('email', '==', email).where('password', '==', password).get();
    
    if (snapshot.empty) {
      res.status(401).json({ message: "Authentication failed. Incorrect email or password." });
    } else {
      await db.collection('login_s').add({ email, timestamp: admin.firestore.FieldValue.serverTimestamp() });
      res.status(200).json({ message: "Login successful" });
    }
  } catch (error) {
    console.error('Error checking document: ', error);
    res.status(500).json({ message: "Error checking login data" });
  }
});

app.post("/signup", async function(req, res) {
  try {
    await db.collection('signup_s').add(req.body);
    res.status(201).json({ message: "Signup successful" });
  } catch (error) {
    console.error('Error adding document: ', error);
    res.status(500).json({ message: "Error saving signup data" });
  }
});

const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}/`);
});
