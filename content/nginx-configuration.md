
---
title: "Setting Up Nginx with systemd Service Files on Linux"
author: "Nihesh Rachakonda"
date: "2026-01-06"
tags: ["nginx", "linux", "systemd", "reverse-proxy", "deployment"]
excerpt: "A complete guide to installing Nginx, configuring reverse proxy, and managing it using systemd service files."
---

Nginx is a high-performance web server and reverse proxy widely used in production systems.  
This guide walks through **installing Nginx**, **configuring it**, and **understanding its systemd service files**.

---

## What is Nginx?

Nginx is:
- A web server
- A reverse proxy
- A load balancer
- An SSL termination layer

It is commonly used to expose backend applications running on ports like `3000`, `4000`, etc.

---

## Prerequisites

- Ubuntu / Debian based Linux
- Root or sudo access
- A running backend/frontend/DB service (Node.js, Next.js, API, etc.)
- Optional: Domain name

---

## Step 1: Install Nginx

Update the system and install Nginx:

```bash
sudo apt update
sudo apt install nginx -y

Check if it’s running:

sudo systemctl status nginx

Open your server IP in the browser — you should see the Nginx welcome page.

⸻

Step 2: Understanding Nginx File Structure

Important paths:

/etc/nginx/
├── nginx.conf
├── sites-available/
├── sites-enabled/
├── conf.d/
└── modules-enabled/

	•	sites-available → All virtual host configs
	•	sites-enabled → Active configs (symlinks)
	•	nginx.conf → Main configuration file

⸻

Step 3: Create a Reverse Proxy Config

Create a new site config:

sudo nano /etc/nginx/sites-available/myapp

Paste this:

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

Replace:
	•	your-domain.com
	•	3000 with your service port

⸻

Step 4: Enable the Site

Create a symlink:

sudo ln -s /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/

Test configuration:

sudo nginx -t

Reload Nginx:

sudo systemctl reload nginx

⸻

Step 5: Common systemctl Commands

sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx
sudo systemctl reload nginx
sudo systemctl enable nginx
sudo systemctl disable nginx

Check logs:

journalctl -u nginx -f


⸻

Step 6: Custom Error Pages (Optional)

Create an error page:

sudo nano /var/www/html/50x.html

Example:

<h1>Service Temporarily Unavailable</h1>
<p>Please try again later.</p>

Add to your server block:

error_page 502 503 504 /50x.html;

location = /50x.html {
    root /var/www/html;
}

Reload Nginx:

sudo systemctl reload nginx


⸻

Step 8: Firewall Configuration

sudo ufw allow 'Nginx Full'
sudo ufw reload

beware you don't lose your ssh access

⸻

Common Issues & Fixes

Bad Gateway (502)
	•	Backend not running
	•	Wrong port in proxy_pass
	•	App bound to localhost incorrectly

Config Not Loading

sudo nginx -t

Always test before reload.

⸻


Conclusion

Nginx combined with systemd provides a robust and scalable deployment setup for backend and frontend applications.
Understanding service files gives you deeper control over production systems.

Once you learn this, deploying becomes predictable and repeatable.

⸻