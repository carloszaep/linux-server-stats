const express = require('express');
const cors = require('cors');
const si = require('systeminformation');
const os = require('os');

const app = express();
// Default to 3333, but allow override
const PORT = process.env.PORT || 3333;

app.use(cors());

app.get('/api/stats', async (req, res) => {
    try {
        const [temp, load, mem, fsSize] = await Promise.all([
            si.cpuTemperature(),
            si.currentLoad(),
            si.mem(),
            si.fsSize()
        ]);

        // 1. System Load
        const systemLoad = load.currentLoad.toFixed(1);

        // 2. Disk Usage (Find root '/' or first available)
        const disk = fsSize.find(d => d.mount === '/') || fsSize[0];
        const diskTotalGb = (disk.size / (1024 * 1024 * 1024)).toFixed(0);
        const diskUsageStr = `${disk.use.toFixed(1)}% of ${diskTotalGb}GB`;

        // 3. Memory Usage
        const memUsedGb = (mem.active / (1024 * 1024 * 1024)).toFixed(2);
        const memTotalGb = (mem.total / (1024 * 1024 * 1024)).toFixed(2);
        const memoryStr = `${memUsedGb}GB / ${memTotalGb}GB`;

        // 4. IPv4 Address (Using Node's os module for reliability)
        const interfaces = os.networkInterfaces();
        let localIP = 'Unknown';

        // Loop through all interfaces to find the first non-internal IPv4
        for (const name of Object.keys(interfaces)) {
            for (const iface of interfaces[name]) {
                // Skip loopback (127.0.0.1) and non-IPv4 addresses
                if (iface.family === 'IPv4' && !iface.internal) {
                    localIP = iface.address;
                    break;
                }
            }
            if (localIP !== 'Unknown') break;
        }



        res.json({
            load: Number(systemLoad),
            disk_usage: diskUsageStr,
            memory: memoryStr,
            temperature: temp.main,
            ip: localIP
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch server stats' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
