const express = require('express');
const axios = require('axios');
const app = express();

const WOWZA_BASE = 'http://185.202.128.1:1935/TvSeiHBBTV/tvseiWebPresenter';
const PORT = process.env.PORT || 3001;

const MIME_TYPES = {
  'mpd': 'application/dash+xml',
  'm3u8': 'application/x-mpegURL',
};

app.get('/api/live/:stream', async (req, res) => {
  try {
    const { stream } = req.params;
    const extension = stream.split('.').pop();
    const url = `${WOWZA_BASE}/${stream}`;

    const response = await axios.get(url, { responseType: 'stream' });

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', MIME_TYPES[extension] || 'application/octet-stream');

    response.data.pipe(res);
  } catch (err) {
    console.error('Errore nel proxy:', err.message);
    res.status(500).send('Errore nel caricamento del flusso');
  }
});

app.listen(PORT, () => {
  console.log(`Proxy attivo su http://localhost:${PORT}`);
});
