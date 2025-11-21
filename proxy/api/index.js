const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();

// Configuração de CORS: Permite acesso de qualquer origem (seu HTML)
app.use(cors());

// URL base do Addon de destino (Stremio)
const TARGET_ADDON_URL = 'https://7a82163c306e-stremio-netflix-catalog-addon.baby-beamup.club'; 
// URL da API Superflix
const SUPERFLIX_URL = 'https://superflixapi.asia/lista?category=anime&type=tmdb&format=json&order=asc';

// Rota de saúde
app.get('/', (req, res) => {
    res.send('Proxy AniStream Ativo!');
});

// --- ROTAS SUPERFLIX (NOVO) ---

app.get('/superflix', async (req, res) => {
    console.log(`[PROXY] Buscando lista Superflix: ${SUPERFLIX_URL}`);
    try {
        const response = await fetch(SUPERFLIX_URL);
        
        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
        
        const data = await response.json();
        res.json(data); // Retorna o JSON da Superflix

    } catch (error) {
        console.error('Erro Superflix:', error);
        res.status(500).json({ error: 'Falha ao buscar na Superflix via Proxy.' });
    }
});


// --- ROTAS STREMIO (MANTIDAS) ---

app.get('/manifest', async (req, res) => {
    try {
        const response = await fetch(TARGET_ADDON_URL + '/manifest.json');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Erro no Manifest' });
    }
});

app.get('/catalog/:type/:id.json', async (req, res) => {
    const { type, id } = req.params;
    try {
        const response = await fetch(`${TARGET_ADDON_URL}/catalog/${type}/${id}.json`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Erro no Catálogo' });
    }
});

app.get('/streams/:type/:id.json', async (req, res) => {
    const { type, id } = req.params;
    try {
        const response = await fetch(`${TARGET_ADDON_URL}/stream/${type}/${id}.json`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Erro nos Streams' });
    }
});

module.exports = app;
