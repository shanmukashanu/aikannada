# AI Kannada — Backend Starter (Node.js + Express)

## Run (Windows PowerShell)
1. Open PowerShell in the `backend` folder
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Start in dev mode:
   ```powershell
   npm run dev
   ```
   Or start normally:
   ```powershell
   npm start
   ```

The server runs on http://localhost:5000

## Test Endpoints
- GET http://localhost:5000/api/health
- GET http://localhost:5000/api/message
- POST http://localhost:5000/api/echo

## Connect from Frontend
```html
<div id="backendMessage">Loading...</div>
<button id="sendTest">Send Test POST</button>

<script>
  async function loadMessage() {
    const res = await fetch("http://localhost:5000/api/message");
    const data = await res.json();
    document.getElementById("backendMessage").innerText = data.message;
  }

  async function sendTest() {
    const res = await fetch("http://localhost:5000/api/echo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Manoj", text: "Hello from frontend" }),
    });
    const data = await res.json();
    alert("POST response: " + JSON.stringify(data));
  }

  window.addEventListener("DOMContentLoaded", () => {
    loadMessage();
    document.getElementById("sendTest").addEventListener("click", sendTest);
  });
</script>
```
