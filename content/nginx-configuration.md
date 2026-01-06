---
title: "Setting Up Nginx with systemd Service Files on Linux"
author: "Nihesh Rachakonda"
date: "2026-01-06"
tags: ["nginx", "linux", "systemd", "reverse-proxy", "deployment"]
excerpt: "A complete guide to installing Nginx, configuring reverse proxy, and managing it using systemd service files."
---

Nginx is a high-performance web server and reverse proxy widely used in production systems. This guide walks through **installing Nginx**, **configuring it**, and **understanding its systemd service files**.

## What is Nginx?

Nginx is:

- A web server
- A reverse proxy
- A load balancer
- An SSL termination layer

It is commonly used to expose backend applications running on ports like `3000`, `4000`, etc.

## Prerequisites

- Ubuntu / Debian based Linux
- Root or sudo access
- A running backend/frontend/DB service (Node.js, Next.js, API, etc.)
- Optional: Domain name

## Step 1: Install Nginx

Update the system and install Nginx:

```bash
sudo apt update
sudo apt install nginx -y
```

Check if it's running:

```bash
sudo systemctl status nginx
```

Open your server IP in the browser — you should see the Nginx welcome page.

## Step 2: Understanding Nginx File Structure

Important paths:

```bash
/etc/nginx/
├── nginx.conf
├── sites-available/
├── sites-enabled/
├── conf.d/
└── modules-enabled/
```

- **sites-available** → All virtual host configs
- **sites-enabled** → Active configs (symlinks)
- **nginx.conf** → Main configuration file

## Step 3: Create a Reverse Proxy Config

Create a new site config:

```bash
sudo nano /etc/nginx/sites-available/myapp
```

Paste this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;

        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Replace:

- `your-domain.com` with your actual domain
- `3000` with your service port

## Step 4: Enable the Site

Create a symlink:

```bash
sudo ln -s /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/
```

Test configuration:

```bash
sudo nginx -t
```

Reload Nginx:

```bash
sudo systemctl reload nginx
```

## Step 5: Common systemctl Commands

```bash
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx
sudo systemctl reload nginx
sudo systemctl enable nginx
sudo systemctl disable nginx
```

Check logs:

```bash
journalctl -u nginx -f
```

## Step 6: Custom Error Pages (Optional)

Create an error page:

```bash
sudo nano /var/www/html/50x.html
```

Example HTML content:

```html
<h1>Service Temporarily Unavailable</h1>
<p>Please try again later.</p>
```

Add to your server block:

```nginx
error_page 502 503 504 /50x.html;

location = /50x.html {
    root /var/www/html;
}
```

Reload Nginx:

```bash
sudo systemctl reload nginx
```

## Step 7: Firewall Configuration

```bash
sudo ufw allow 'Nginx Full'
sudo ufw reload
```

**Important:** Be careful not to lose your SSH access when configuring firewall rules!

## Common Issues & Fixes

### Bad Gateway (502)

Common causes:

- Backend service not running
- Wrong port in `proxy_pass`
- App bound to localhost incorrectly

### Config Not Loading

Always test your configuration before reloading:

```bash
sudo nginx -t
```

This will check for syntax errors in your Nginx configuration files.

## Conclusion

Nginx is a powerful tool that transforms your application from a localhost project into a production-ready service. With reverse proxy configuration and systemd management, you can serve your apps securely, scale efficiently, and handle failures gracefully.

Whether you're deploying a Next.js app, a Node.js API, or any web service — mastering Nginx is essential for modern deployment workflows. Keep experimenting, monitor your logs, and your deployments will become second nature!
