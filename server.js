const express = require('express');
const cors = require('cors');
const si = require('systeminformation');

const app = express();
// Default to 3333, but allow override
const PORT = process.env.PORT || 3333;

app.use(cors());

app.get('/api/stats', async (req, res) => {
    try {
        const [temp, load, mem, time] = await Promise.all([
            si.cpuTemperature(),
            si.currentLoad(),
            si.mem(),
            si.time()
        ]);

        res.json({
            temperature: temp,
            load: load,
            memory: mem,
            uptime: time.uptime,
            timestamp: Date.now()
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch server stats' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
