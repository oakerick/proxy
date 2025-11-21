const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();

// Configuração de CORS: Permite acesso de qualquer origem (seu HTML)
app.use(cors());

// URL base do Addon de destino (O Addon real que você quer acessar)
// 🚨 SUBSTITUA ESTE ENDEREÇO PELO SEU ADDON REAL 🚨
const TARGET_ADDON_URL = 'https://7a82163c306e-stremio-netflix-catalog-addon.baby-beamup.club/manifest.json'; 

// Endpoint Proxy: Recebe requisições no formato /streams/:type/:id.json
// Ex: /streams/movie/tt1234.json
app.get('/streams/:type/:id.json', async (req, res) => {
    const { type, id } = req.params;
    
    // Constrói o caminho completo da API do Addon (Padrão Stremio)
    const addonPath = `/stream/${type}/${id}.json`;
    const fullTargetUrl = TARGET_ADDON_URL + addonPath;

    console.log(`[PROXY] Requisitando Addon: ${fullTargetUrl}`);

    try {
        // Faz a requisição ao servidor do Addon real (sem bloqueio CORS)
        const response = await fetch(fullTargetUrl);
        
        // Define o status e os cabeçalhos recebidos
        res.status(response.status);
        res.set('Content-Type', response.headers.get('content-type'));

        // Envia o JSON do Addon diretamente de volta para o cliente
        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error('Erro no Proxy ao buscar Addon:', error);
        res.status(500).json({ 
            streams: [],
            error: 'Falha ao buscar Addon através do Proxy. Verifique TARGET_ADDON_URL.' 
        });
    }
});

// Rota de saúde para checar se o proxy está no ar
app.get('/', (req, res) => {
    res.send(`Proxy Addon Stremio ativo! Target: ${TARGET_ADDON_URL}`);
});

// Exporta o aplicativo Express para ser usado pelo Vercel
module.exports = app;