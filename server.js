const express = require('express');
const cors = require('cors');
const si = require('systeminformation');

const app = express();
// Default to 3333, but allow override
const PORT = process.env.PORT || 3333;

app.use(cors());

app.get('/api/stats', async (req, res) => {
    try {
        const [temp, load, mem, fsSize, networkInterfaces] = await Promise.all([
            si.cpuTemperature(),
            si.currentLoad(),
            si.mem(),
            si.fsSize(),
            si.networkInterfaces()
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

        // 4. IPv4 Address (First non-internal)
        // networkInterfaces can be an array or object depending on version/call, 
        // systeminformation.networkInterfaces() usually returns an array of objects.
        const interfaces = Array.isArray(networkInterfaces) ? networkInterfaces : [networkInterfaces];
        const mainInterface = interfaces[0].ip4 || 'Unknown';

        res.json({
            load: Number(systemLoad),
            disk_usage: diskUsageStr,
            memory: memoryStr,
            temperature: temp.main,
            ip: mainInterface
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch server stats' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
