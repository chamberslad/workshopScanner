# Workshop Scanner

A web-based inventory scanning app for tracking parcels and items in a workshop. Supports handheld barcode scanners, camera-based scanning, and pre-printed QR box labels.

---

## Features

- **Barcode scanning** — works with any USB handheld scanner (acts as a keyboard)
- **Camera scanning** — use a phone or webcam to scan barcodes via the browser
- **Manual entry** — type a barcode directly if no scanner is available
- **Per-item details** — capture customer, address, make, and model for each scan
- **Pre-printed box labels** — generate QR labels before items arrive; scan the box later to assign it
- **Workshop lookup** — scanning a printed QR label highlights the matching entry in the inventory
- **Export to CSV** — download all entries as a spreadsheet
- **Runs offline** — data stored in browser localStorage, no backend required
- **Docker ready** — ships as a container with Caddy for automatic HTTPS

---

## Getting Started

### Run locally (development)

Requires [Node.js 20+](https://nodejs.org).

```bash
git clone https://github.com/chamberslad/workshopScanner.git
cd workshopScanner
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### Run with Docker

```bash
docker compose up -d
```

Open `http://localhost` in your browser.

For HTTPS (required for camera scanning on a network), edit `Caddyfile` with your domain before starting — see [HTTPS setup](#https-setup) below.

---

## How to Use

### Scanning an incoming item

1. Focus the browser window (click anywhere on the page)
2. Scan the item's barcode with a handheld scanner — a details form will pop up
3. Fill in **Customer**, **Address**, **Make**, and **Model**, then click **Save**
4. The entry appears in the inventory table
5. Click the **print icon** (⎙) on the row to print a QR label and stick it on the item

### Pre-printing box labels

Use this when you want to label boxes before items arrive.

1. Click **New box label** in the header
2. Fill in the customer and vehicle details
3. Click **Generate & Print** — a QR label prints immediately and the entry is saved
4. Stick the label on the box

### Finding an item in the workshop

Scan any printed QR label — the app will scroll to and highlight that item's row in green.

### Manual entry (no scanner)

Use the **Enter barcode** bar at the top of the page. Type the barcode value and press Enter.

### Camera scanning

Click **Use camera** in the header. Grant camera permission when prompted. Hold a barcode in front of the camera — it detects and logs the scan automatically.

> **Note:** Camera access requires HTTPS when running on a network (not localhost). See [HTTPS setup](#https-setup).

### Editing entries

Click any cell in the **Customer**, **Address**, **Make**, or **Model** columns to edit it inline.

### Exporting data

Click **Export CSV** to download all entries as a `.csv` file.

---

## Microsoft Entra SSO (this branch)

This branch adds Microsoft Entra ID (Azure AD) single sign-on. Users must sign in with their Microsoft account before accessing the app. Access is managed entirely in Entra — add or remove users there, no app changes needed.

### Azure portal setup (~5 minutes)

1. Go to [portal.azure.com](https://portal.azure.com) → **Microsoft Entra ID** → **App registrations** → **New registration**

2. Fill in:
   - **Name:** Workshop Scanner
   - **Supported account types:** Accounts in this organizational directory only (single tenant)
   - **Redirect URI:** Select **Single-page application (SPA)** and enter your app URL, e.g. `https://scanner.yourdomain.com`

3. Click **Register**. Copy the **Application (client) ID** and **Directory (tenant) ID** from the overview page.

4. Under **Authentication**, add `http://localhost` as an additional redirect URI for local testing.

5. Under **API permissions**, confirm `openid`, `profile`, and `email` are present (they are by default).

### Add credentials to your `.env`

```bash
cp .env.example .env
```

Edit `.env`:
```
ENTRA_TENANT_ID=your-tenant-id
ENTRA_CLIENT_ID=your-client-id
DB_PASSWORD=something-strong
```

### Start the stack

```bash
docker compose up -d
```

Visit your app URL — you'll be redirected to the Microsoft login page. After signing in, the app loads as normal. The signed-in user's name appears in the header and a **Sign out** button is available.

### Restricting access to specific users or groups

By default anyone in your Entra tenant can sign in. To restrict access:

1. In the Azure portal, go to **Enterprise applications** → find **Workshop Scanner**
2. Under **Properties**, set **Assignment required** to **Yes**
3. Under **Users and groups**, add only the users or groups who should have access

---

## HTTPS Setup

Camera scanning requires a secure context (`https://`). The Docker setup includes [Caddy](https://caddyserver.com) which handles certificates automatically.

### With a domain

Edit `Caddyfile` and replace the placeholder with your domain:

```
scanner.yourdomain.com {
    reverse_proxy scanner:80
}
```

Point your domain's DNS A record at your server's IP, then run:

```bash
docker compose up -d
```

Caddy fetches a Let's Encrypt certificate automatically.

### Local network (no domain)

Uncomment the `tls internal` block in `Caddyfile`:

```
:443 {
    tls internal
    reverse_proxy scanner:80
}
```

Caddy generates a self-signed certificate. Accept the browser warning once per device.

---

## Raspberry Pi

The Docker setup runs on Raspberry Pi 4/5 (arm64) without any changes.

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Run the app
docker compose up -d
```

For faster deploys, build the image on a desktop and push to Docker Hub rather than building on the Pi itself.

---

## Project Structure

```
src/
  components/
    CameraScanner.jsx     # Camera-based barcode scanning (ZXing)
    NewLabelModal.jsx     # Pre-register a box and print its QR label
    PrintLabel.jsx        # QR label preview and print
    ScanFeed.jsx          # Inventory table with inline editing
    ScanModal.jsx         # Details form shown after each scan
  hooks/
    useBarcodeScanner.js  # Keyboard listener for handheld scanners
    useInventory.js       # localStorage CRUD and CSV export
  App.jsx
  index.css
Dockerfile
docker-compose.yml
Caddyfile
nginx.conf
```

---

## Tech Stack

| | |
|---|---|
| Frontend | React 18 + Vite |
| Barcode decoding | [@zxing/browser](https://github.com/zxing-js/browser) |
| QR generation | [qrcode](https://github.com/soldair/node-qrcode) |
| Storage | Browser localStorage |
| Container | nginx (app) + Caddy (HTTPS proxy) |
