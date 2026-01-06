---
title: "Setting Up a TURN Server with Coturn"
author: "Nihesh Rachakonda"
date: "2026-01-05"
dateModified: "2026-01-05"
tags: ["turn-server", "webrtc", "coturn", "stun", "nat-traversal"]
excerpt: "Complete guide to setting up a TURN server using Coturn for WebRTC applications"
---

TURN (Traversal Using Relays around NAT) servers are essential for WebRTC applications to work reliably across different network configurations. This guide will walk you through installing and configuring a TURN server using Coturn.

## What is TURN?

TURN is a protocol that allows peers behind NATs or firewalls to communicate by relaying media through a server. It's often used alongside STUN servers for WebRTC applications.

## Prerequisites

- Ubuntu/Debian server (or similar Linux distribution)
- Root or sudo access
- Domain name with SSL certificate (Can get one using Let's Encrypt)
- Public IP address

## Step 1: Install Coturn

First, update your system and install Coturn:

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install coturn -y
```

## Step 2: Configure SSL Certificate

Install Certbot for Let's Encrypt certificates:

```bash
sudo apt install certbot -y
sudo certbot certonly --standalone -d your-domain.com
```

Replace `your-domain.com` with your actual domain name.

### Set Proper Permissions for SSL Certificates

Coturn needs to read the SSL certificates, so set the correct ownership:

```bash
sudo chown turnserver:turnserver /etc/letsencrypt/live/your-domain.com/
sudo chown turnserver:turnserver /etc/letsencrypt/live/your-domain.com/*
sudo chmod 644 /etc/letsencrypt/live/your-domain.com/*.pem
```

## Step 3: Configure Coturn

Create the configuration file:

```bash
sudo nano /etc/turnserver.conf
```

Add the following configuration (replace with your actual values):

```bash
# === REALM & AUTH ===
realm=your-domain.com
server-name=turn-server
lt-cred-mech
fingerprint

# === LISTENING CONFIGURATION ===
listening-port=3478
tls-listening-port=5349
listening-ip=0.0.0.0

# === CRITICAL FIX: RELAY & EXTERNAL IPs ===
relay-ip=YOUR_PRIVATE_IP
external-ip=YOUR_PUBLIC_IP/YOUR_PRIVATE_IP

# === CREDENTIALS ===
user=turnuser:securepassword123

# === CERTIFICATES ===
cert=/etc/letsencrypt/live/your-domain.com/fullchain.pem
pkey=/etc/letsencrypt/live/your-domain.com/privkey.pem

# === PORT RANGE ===
min-port=49152
max-port=65535

# === LOGGING ===
log-file=/var/log/turnserver/turn.log
verbose

# === SECURITY & BEHAVIOR ===
no-rfc5780
no-stun-backward-compatibility
response-origin-only-with-rfc5780
syslog
no-multicast-peers

# === CLI PASSWORD (IF REQUIRED) ===
cli-password=your-password

# === ALLOCATION TIMEOUT ===
stale-nonce=3600
bps-capacity=0

max-bps=3000000
user-quota=0
total-quota=0
```

### Key Configuration Options Explained:

- **realm**: Your domain name
- **relay-ip**: Your server's private IP address
- **external-ip**: Public IP followed by private IP (separated by slash)
- **user**: Username and password for TURN authentication
- **cert/pkey**: Paths to your SSL certificates

## Step 4: Set Up Logging Directory

Create the log directory and set permissions:

```bash
sudo mkdir -p /var/log/turnserver
sudo chown turnserver:turnserver /var/log/turnserver
```

## Step 5: Configure Firewall

Allow the necessary ports through your firewall:

```bash
sudo ufw allow 3478/tcp
sudo ufw allow 3478/udp
sudo ufw allow 5349/tcp
sudo ufw allow 5349/udp
sudo ufw allow 49152:65535/udp
```

## Step 6: Start and Enable Coturn Service

```bash
sudo systemctl enable coturn
sudo systemctl start coturn
sudo systemctl status coturn
```

## Step 7: Test Your TURN Server

You can test your TURN server using tools like [Trickle ICE](https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/) or command-line tools.

### Using turnutils

```bash
sudo apt install turnutils -y
turnutils_uclient -t -u turnuser -w securepassword123 your-domain.com
```

## Troubleshooting

### Common Issues:

1. **Port binding errors**: Check if ports are already in use
2. **Certificate errors**: Ensure certificate paths are correct
3. **Connection failures**: Verify firewall rules and IP configurations

### Check logs:

```bash
sudo tail -f /var/log/turnserver/turn.log
```

## Security Considerations

- Use strong passwords for TURN credentials
- Keep SSL certificates up to date
- Monitor server logs for suspicious activity
- Consider using a dedicated user for TURN operations

## Usage in WebRTC Applications

In your WebRTC application, configure the ICE servers like this:

```javascript
const iceServers = [
  {
    urls: "stun:stun.l.google.com:19302",
  },
  {
    urls: "turn:your-domain.com:5349",
    username: "turnuser",
    credential: "securepassword123",
  },
];

const peerConnection = new RTCPeerConnection({ iceServers });
```

## Conclusion

Setting up a TURN server ensures your WebRTC applications work reliably across all network configurations. Coturn is a robust, open-source solution that handles the complexities of NAT traversal for you.

Remember to replace all placeholder values with your actual domain, IPs, and secure passwords before deploying to production!
