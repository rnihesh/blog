---
title: "Setting Up Headscale: Self-Hosted Tailscale Control Server"
author: "Nihesh Rachakonda"
date: "2026-02-02"
tags: ["headscale", "tailscale", "vpn", "wireguard", "self-hosted", "networking", "mesh"]
excerpt: "Complete guide to setting up Headscale, an open-source self-hosted implementation of the Tailscale control server, and connecting clients."
---

Headscale is an open-source, self-hosted implementation of the Tailscale control server. It allows you to create your own private mesh VPN network without relying on Tailscale's cloud infrastructure. This guide walks through setting up Headscale and connecting Tailscale clients.

## What is Headscale?

Headscale provides:

- A self-hosted alternative to Tailscale's coordination server
- Full control over your mesh network infrastructure
- WireGuard-based secure networking
- No dependency on third-party cloud services
- Support for all major Tailscale clients

If you want the benefits of Tailscale's mesh VPN but need to keep everything on your own infrastructure, Headscale is the solution.

## Prerequisites

- Ubuntu/Debian server (or similar Linux distribution)
- Root or sudo access
- Domain name pointing to your server
- SSL certificate (we'll use Let's Encrypt)
- Open ports: 443 (HTTPS), 3478 (STUN)

## Step 1: Install Headscale

Download and install the latest Headscale release:

```bash
HEADSCALE_VERSION="" # See above URL for latest version, e.g. "X.Y.Z" (NOTE: do not add the "v" prefix!)
HEADSCALE_ARCH="" # Your system architecture, e.g. "amd64"
wget --output-document=headscale.deb \
 "https://github.com/juanfont/headscale/releases/download/v${HEADSCALE_VERSION}/headscale_${HEADSCALE_VERSION}_linux_${HEADSCALE_ARCH}.deb"
```

Verify the installation:

```bash
headscale version
```

## Step 2: Configure Nginx with SSL

Install Nginx and Certbot:

```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx -y
```

Create an Nginx config for Headscale:

```bash
sudo nano /etc/nginx/sites-available/headscale
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name headscale.your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
        proxy_read_timeout 86400;
    }
}
```

Enable the site and obtain SSL certificate:

```bash
sudo ln -s /etc/nginx/sites-available/headscale /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d headscale.your-domain.com
```

Certbot will automatically configure SSL and set up auto-renewal.

## Step 3: Configure Headscale

Edit the configuration file:

```bash
sudo nano /etc/headscale/config.yaml
```

Here's a recommended configuration:

```yaml
# Server configuration
server_url: https://headscale.your-domain.com
listen_addr: 127.0.0.1:8080
metrics_listen_addr: 127.0.0.1:9090

# gRPC settings
grpc_listen_addr: 127.0.0.1:50443
grpc_allow_insecure: false

# Database configuration
database:
  type: sqlite
  sqlite:
    path: /var/lib/headscale/db.sqlite

# TLS handled by Nginx reverse proxy
tls_cert_path: ""
tls_key_path: ""

# Noise protocol (required for newer clients)
noise:
  private_key_path: /var/lib/headscale/noise_private.key

# IP prefixes for your network
prefixes:
  v4: 100.64.0.0/10
  v6: fd7a:115c:a1e0::/48

# DERP configuration
derp:
  server:
    enabled: true
    region_id: 999
    region_code: "headscale"
    region_name: "Headscale Embedded DERP"
    stun_listen_addr: "0.0.0.0:3478"
    private_key_path: /var/lib/headscale/derp_server_private.key
    automatically_add_embedded_derp_region: true
    ipv4: YOUR_PUBLIC_IP
    ipv6: ""
  urls: []
  paths: []
  auto_update_enabled: true
  update_frequency: 24h

# Disable external DERP servers (optional, for full self-hosting)
# derp:
#   urls: []

# DNS configuration
dns:
  magic_dns: true
  base_domain: tailnet.your-domain.com
  nameservers:
    global:
      - 1.1.1.1
      - 8.8.8.8

# Log settings
log:
  format: text
  level: info

# Policy (ACLs) - optional
policy:
  mode: file
  path: ""

# Unix socket for CLI
unix_socket: /var/run/headscale/headscale.sock
unix_socket_permission: "0770"
```

Replace the following values:

- `headscale.your-domain.com` with your actual domain
- `YOUR_PUBLIC_IP` with your server's public IP address
- `tailnet.your-domain.com` with your preferred MagicDNS base domain

## Step 4: Create Required Directories

```bash
sudo mkdir -p /var/lib/headscale
sudo mkdir -p /var/run/headscale
sudo chown -R headscale:headscale /var/lib/headscale
sudo chown -R headscale:headscale /var/run/headscale
```

## Step 5: Configure Firewall

Allow the necessary ports:

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow 3478/udp
sudo ufw reload
```

For cloud providers, ensure your security groups allow:

- **TCP:** 80, 443 (HTTP/HTTPS via Nginx)
- **UDP:** 3478 (STUN for DERP)

## Step 6: Start Headscale

Enable and start the service:

```bash
sudo systemctl enable headscale
sudo systemctl start headscale
sudo systemctl status headscale
```

Check the logs for any errors:

```bash
sudo journalctl -u headscale -f
```

## Step 7: Create a User

Headscale organizes devices by users. Create your first user:

```bash
sudo headscale users create myuser
```

List users:

```bash
sudo headscale users list
```

## Step 8: Generate Pre-Authentication Keys

Pre-auth keys allow devices to join without manual approval:

```bash
# Create a reusable key (expires in 24 hours by default)
sudo headscale preauthkeys create --user myuser --reusable --expiration 24h
```

For a one-time use key:

```bash
sudo headscale preauthkeys create --user myuser --expiration 1h
```

List existing keys:

```bash
sudo headscale preauthkeys list --user myuser
```

## Step 9: Connect Tailscale Clients

### Linux Client

Install Tailscale:

```bash
curl -fsSL https://tailscale.com/install.sh | sh
```

Connect to your Headscale server:

```bash
sudo tailscale up --login-server https://headscale.your-domain.com --authkey YOUR_PREAUTH_KEY
```

Or without a pre-auth key (requires manual approval):

```bash
sudo tailscale up --login-server https://headscale.your-domain.com
```

Then approve the node on the server:

```bash
sudo headscale nodes register --user myuser --key nodekey:XXXXX
```

### macOS Client

Install Tailscale from the App Store or via Homebrew:

```bash
brew install tailscale
```

Connect using the CLI:

```bash
tailscale up --login-server https://headscale.your-domain.com --authkey YOUR_PREAUTH_KEY
```

### Windows Client

1. Download Tailscale from [tailscale.com/download](https://tailscale.com/download)
2. Open PowerShell as Administrator
3. Run:

```powershell
tailscale up --login-server https://headscale.your-domain.com --authkey YOUR_PREAUTH_KEY
```

### iOS and Android

For mobile devices, you'll need to use the web-based registration flow:

1. Install Tailscale from the App Store or Play Store
2. On your server, generate a registration URL:

```bash
sudo headscale nodes register --user myuser --key nodekey:XXXXX
```

3. Open the Tailscale app and use the custom login server option

## Step 10: Managing Nodes

List all connected nodes:

```bash
sudo headscale nodes list
```

Delete a node:

```bash
sudo headscale nodes delete --identifier NODE_ID
```

Rename a node:

```bash
sudo headscale nodes rename --identifier NODE_ID "new-hostname"
```

Move a node to a different user:

```bash
sudo headscale nodes move --identifier NODE_ID --user newuser
```

## Step 11: Enable Exit Nodes (Optional)

To use a node as an exit node for routing all traffic:

On the exit node:

```bash
sudo tailscale up --login-server https://headscale.your-domain.com --advertise-exit-node
```

Approve the exit node on the server:

```bash
sudo headscale routes enable --route "0.0.0.0/0" --identifier NODE_ID
sudo headscale routes enable --route "::/0" --identifier NODE_ID
```

On client devices, use the exit node:

```bash
tailscale up --exit-node=EXIT_NODE_IP
```

## Step 12: Configure Access Control (ACLs)

Create an ACL policy file:

```bash
sudo nano /etc/headscale/acl.json
```

Example policy allowing all users to communicate:

```json
{
  "acls": [
    {
      "action": "accept",
      "src": ["*"],
      "dst": ["*:*"]
    }
  ],
  "tagOwners": {},
  "hosts": {}
}
```

Update the config to use the ACL file:

```yaml
policy:
  mode: file
  path: /etc/headscale/acl.json
```

Restart Headscale:

```bash
sudo systemctl restart headscale
```

## Troubleshooting

### Connection Issues

Check if the server is reachable:

```bash
curl -I https://headscale.your-domain.com/health
```

### Certificate Errors

Verify certificate validity:

```bash
openssl s_client -connect headscale.your-domain.com:443 -servername headscale.your-domain.com
```

### Client Not Connecting

Check client logs:

```bash
# Linux
sudo journalctl -u tailscaled -f

# macOS
log stream --predicate 'subsystem == "com.tailscale.ipn.macos"'
```

### DERP Connectivity

Test if DERP is working:

```bash
# On the server, check if STUN port is listening
sudo ss -tulpn | grep 3478
```

### View Server Logs

```bash
sudo journalctl -u headscale -f --no-pager
```

## Security Considerations

- Keep Headscale updated to the latest version
- Use strong, unique pre-auth keys
- Set appropriate expiration times for pre-auth keys
- Implement ACLs to restrict network access
- Regularly audit connected nodes
- Enable automatic certificate renewal
- Consider running Headscale behind a reverse proxy for additional security


## Conclusion

Headscale provides a powerful self-hosted alternative to Tailscale's coordination server. With this setup, you have complete control over your mesh VPN infrastructure while still benefiting from Tailscale's excellent client software and WireGuard's security.

The combination of Headscale's simplicity and Tailscale's cross-platform clients makes it an excellent choice for homelab enthusiasts, small teams, or organizations that need to keep their network infrastructure fully self-hosted.

Remember to keep your server updated, monitor your logs, and regularly backup your configuration and database!
