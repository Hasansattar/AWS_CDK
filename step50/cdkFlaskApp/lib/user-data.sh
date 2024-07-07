#!/bin/bash

sudo apt-get install nginx
sudo systemctl start nginx
sudo systemctl enable nginx

echo "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'><title>Hello World</title></head><body><h1>Hello from EC2 Instance!</h1><p>This is a sample HTML page served from an EC2 instance using Nginx.</p></body></html>" > /usr/share/nginx/html/index.html

systemctl restart nginx