# Linux Server Stats API

This is a simple Express.js API that provides server statistics (CPU temperature, load, memory, uptime) for consumption by external devices like an ESP32.

## Production Setup (Step-by-Step)

These instructions assume you have **Docker** and **Docker Compose** installed on your server.

### 1. Upload/Clone the Project
Copy this entire project folder to your server. 
`e:\Projects\linux-server-stats\` -> `/opt/linux-server-stats/` (or any directory you prefer).

### 2. Navigate to the Directory
Open your terminal and `cd` into the project location:
```bash
cd /path/to/linux-server-stats
```

### 3. Start the Service
Run the following command to build the image and start the container in the background (detached mode):
```bash
docker-compose up -d --build
```
*The `--build` flag ensures it rebuilds the image if you made changes.*

### 4. Verify it's Running
Check the status of your container:
```bash
docker-compose ps
```
You should see `server-stats` running on port `3333`.

### 5. Access the API
The API will be available at:
`http://<YOUR_SERVER_IP>:3333/api/stats`

**Example Response:**
```json
{
  "temperature": { "main": 45.5, ... },
  "load": { "currentLoad": 12.5 },
  "memory": { "total": 16000000000, "used": 8000000000, ... },
  "uptime": 12345
}
```

## Management

### Stopping the Service
To stop the containers and remove the network:
```bash
docker-compose down
```
*If you just want to stop it without removing containers, usage `docker-compose stop`.*

### Viewing Logs
To see the live logs of the server:
```bash
docker-compose logs -f
```

### Updating the Application
If you modify the code (e.g. change `server.js`), run this to rebuild and restart:
```bash
docker-compose up -d --build
```

## For ESP32 Developers
Make sure your ESP32 is connected to the same Wi-Fi/Network as this server. Use `HTTPClient` to make a GET request to the IP and Port defined above.
