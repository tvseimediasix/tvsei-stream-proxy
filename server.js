// File: server.js - versione aggiornata per riscrittura URL nel manifest.mpd
const express = require('express');
const axios = require('axios');
const app = express();

const WOWZA_BASE = 'http://185.202.128.1:1935/TvSeiHBBTV/tvseiWebPresenter';
const PROXY_BASE = 'https://tvsei-stream-proxy.onrender.com/api/live';
const PORT = process.env.PORT || 3001;

const MIME_TYPES = {
  'mpd': 'application/dash+xml',
  'm3u8': 'application/x-mpegURL',
  'm4s': 'video/iso.segment',
  'mp4': 'video/mp4',
};

app.get('/api/live/:stream', async (req, res) => {
  try {
    const { stream } = req.params;
    const extension = stream.split('.').pop();
    const url = `${WOWZA_BASE}/${stream}`;

    const response = await axios.get(url, {
      responseType: extension === 'mpd' ? 'text' : 'stream',
    });

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', MIME_TYPES[extension] || 'application/octet-stream');

    if (extension === 'mpd') {
      let manifest = response.data;
      // riscrive ogni URL HTTP wowza nel manifest con chiamata proxy
      manifest = manifest.replaceAll(WOWZA_BASE, PROXY_BASE);
      res.send(manifest);
    } else {
      response.data.pipe(res);
    }
  } catch (err) {
    console.error('Errore nel proxy streaming:', err.message);
    res.status(500).send('Errore nel caricamento del flusso');
  }
});

app.listen(PORT, () => {
  console.log(`Proxy attivo su http://localhost:${PORT}`);
});
