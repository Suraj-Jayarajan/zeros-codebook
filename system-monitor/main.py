from fastapi import FastAPI, WebSocket
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
import psutil
import asyncio
import json
from datetime import datetime
import platform

app = FastAPI()

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def get():
    with open('static/index.html') as f:
        return HTMLResponse(f.read())

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Collect system metrics
            metrics = {
                "timestamp": datetime.now().strftime("%H:%M:%S"),
                "cpu": {
                    "percent": psutil.cpu_percent(interval=1),
                    "count": psutil.cpu_count(),
                    "freq": psutil.cpu_freq().current if hasattr(psutil.cpu_freq(), 'current') else 0
                },
                "memory": {
                    "total": psutil.virtual_memory().total / (1024 ** 3),  # GB
                    "available": psutil.virtual_memory().available / (1024 ** 3),  # GB
                    "percent": psutil.virtual_memory().percent
                },
                "disk": {
                    "total": psutil.disk_usage('/').total / (1024 ** 3),  # GB
                    "used": psutil.disk_usage('/').used / (1024 ** 3),  # GB
                    "percent": psutil.disk_usage('/').percent
                },
                "network": {
                    "bytes_sent": psutil.net_io_counters().bytes_sent / (1024 ** 2),  # MB
                    "bytes_recv": psutil.net_io_counters().bytes_recv / (1024 ** 2)  # MB
                },
                "system": {
                    "boot_time": datetime.fromtimestamp(psutil.boot_time()).strftime("%Y-%m-%d %H:%M:%S"),
                    "platform": platform.system(),
                    "platform_release": platform.release(),
                    "platform_version": platform.version()
                }
            }
            
            await websocket.send_json(metrics)
            await asyncio.sleep(1)  # Update every second
            
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await websocket.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
