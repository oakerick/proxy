const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();

// Configuração de CORS: Permite acesso de qualquer origem (seu HTML)
app.use(cors());

// URL base do Addon de destino (O Addon real que você quer acessar)
// AJUSTADO: A URL base NÃO deve incluir o /manifest.json
const TARGET_ADDON_URL = 'https://torrentio.strem.fun/manifest.json'; 

// 1. Endpoint Proxy para buscar STREAMS
// Recebe requisições no formato /streams/:type/:id.json
app.get('/streams/:type/:id.json', async (req, res) => {
    const { type, id } = req.params;
    
    // Constrói o caminho completo da API do Addon (Padrão Stremio)
    const addonPath = `/stream/${type}/${id}.json`;
    const fullTargetUrl = TARGET_ADDON_URL + addonPath;

    console.log(`[PROXY] Requisitando Streams: ${fullTargetUrl}`);

    try {
        const response = await fetch(fullTargetUrl);
        
        res.status(response.status);
        res.set('Content-Type', response.headers.get('content-type'));

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error('Erro no Proxy ao buscar Streams:', error);
        res.status(500).json({ 
            streams: [],
            error: 'Falha ao buscar Streams através do Proxy. Verifique TARGET_ADDON_URL e a rota.' 
        });
    }
});

// 2. Endpoint Proxy para buscar o MANIFEST/CATÁLOGO
// Recebe requisições no formato /manifest
app.get('/manifest', async (req, res) => {
    // A URL do manifest é sempre o TARGET_ADDON_URL + /manifest.json
    const fullTargetUrl = TARGET_ADDON_URL + '/manifest.json';

    console.log(`[PROXY] Requisitando Manifest: ${fullTargetUrl}`);

    try {
        const response = await fetch(fullTargetUrl);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}.`);
        }
        
        const data = await response.json();
        
        res.status(response.status);
        res.set('Content-Type', response.headers.get('content-type'));
        
        // Retorna apenas a lista de catálogos do manifest (ou o manifest completo, se preferir)
        res.json({ catalogs: data.catalogs || [] });

    } catch (error) {
        console.error('Erro no Proxy ao buscar Manifest:', error);
        res.status(500).json({ 
            catalogs: [],
            error: 'Falha ao buscar Manifest através do Proxy.' 
        });
    }
});

// Rota de saúde simples para checar se o proxy está no ar
app.get('/', (req, res) => {
    res.send(`Proxy Addon Stremio ativo! Target: ${TARGET_ADDON_URL}`);
});

// Exporta o aplicativo Express para ser usado pelo Vercel
module.exports = app;
