require('dotenv').config();
const express = require('express');
const path = require('path');
const { CloudantV1 } = require('@ibm-cloud/cloudant');
const { IamAuthenticator } = require('ibm-cloud-sdk-core');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// IBM Cloudant Setup
const cloudant = CloudantV1.newInstance({
  authenticator: new IamAuthenticator({ apikey: process.env.CLOUDANT_APIKEY }),
  serviceUrl: process.env.CLOUDANT_URL
});

const dbName = process.env.DB_NAME;

// Home Page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 🔹 Create
app.post('/api/add', async (req, res) => {
  try {
    const response = await cloudant.postDocument({
      db: dbName,
      document: req.body
    });
    res.json(response.result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Read
app.get('/api/data', async (req, res) => {
  try {
    const docs = await cloudant.postAllDocs({ db: dbName, includeDocs: true });
    const data = docs.result.rows.map(row => row.doc);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Update
app.put('/api/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { _rev, ...doc } = req.body;
    const response = await cloudant.putDocument({
      db: dbName,
      docId: id,
      document: { ...doc, _rev }
    });
    res.json(response.result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Delete
app.delete('/api/delete/:id', async (req, res) => {
  try {
    const { id, rev } = req.query;
    const response = await cloudant.deleteDocument({
      db: dbName,
      docId: id,
      rev
    });
    res.json(response.result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
