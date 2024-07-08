#!/bin/bash

# ********************EXAMPLE TESTING APACHE SERVER TO EC2******************** 
# sudo yum update -y
# sudo yum upgrade -y
# sudo yum install -y httpd
# sudo systemctl start httpd
# sudo systemctl enable httpd
# echo "<html><body><h1>Hello from CDK and hasansattar Apache</h1></body></html>"  | sudo tee /var/www/html/index.html
# # sudo chown apache:apache /var/www/html/index.html
# # sudo chmod 644 /var/www/html/index.html
# # sudo systemctl restart httpd
# # echo "Apache has been installed and started." | sudo tee /var/www/html/installation_log.txt

# ********************EXAMPLE TESTING APACHE SERVER TO EC2******************** 



# ********************MAIN SHELL-SCRIPT TO DEPLOY FLASK APP INTO EC2******************** 
# ********************MAIN SHELL-SCRIPT TO DEPLOY FLASK APP INTO EC2******************** 

# Update and upgrade packages
sudo yum update -y
sudo yum upgrade -y

# Install Python 3.10 and venv
sudo yum install amazon-linux-extras -y

sudo amazon-linux-extras install epel -y

sudo amazon-linux-extras enable python3.8
sudo amazon-linux-extras install python3.8 -y

# install python virtual environment for amazon linux os
sudo pip3 install virtualenv 

# installl git 
sudo yum install  git -y 

# sudo yum install python3.8 python3.8-venv -y

# # Verify installation
# python3.10 --version

# Create directory and navigate into it
mkdir helloworld
cd helloworld

# Clone GitHub repository
git clone https://github.com/Hasansattar/Flaskapp_Amazon_Sentiment_Reviews.git .

# virtualenv your_project_name
# create a virtual environment (will create folder)
# virtualenv helloworld
virtualenv -p python3.8 helloworld

#Active your virtual environment:
#source your_project_name/bin/activate
#To deactivate deactivate
source helloworld/bin/activate

# Set up Python virtual environment
# python3.10 -m venv venv
# source venv/bin/activate

# Install Flask and TensorFlow
pip install Flask
pip install tensorflow==2.11.0 --no-cache-dir
pip install numpy>=1.19.5
pip install scikit-learn>=0.24.2
pip install pickle-mixin==1.0.2
pip install gunicorn==20.1.0


# pip freeze | grep Flask
# pip freeze | grep Werkzeug
pip install urllib3==1.25.11
# pip cache purge
pip install Werkzeug

# Run Gunicorn to serve Flask application
helloworld/helloworld/bin/gunicorn -b 0.0.0.0:8000 app:app

# Create systemd service file
# sudo bash -c 'cat > /etc/systemd/system/helloworld.service <<EOF
# [Unit]
# Description=Gunicorn instance for a Flask application
# After=network.target

# [Service]
# User=ec2-user
# Group=www-data
# WorkingDirectory=/home/ec2-user/helloworld
# ExecStart=/home/ec2-user/helloworld/helloworld/bin/gunicorn -b localhost:8000 app:app
# Restart=always

# [Install]
# WantedBy=multi-user.target
# EOF'


sudo bash -c 'cat > /etc/systemd/system/helloworld.service <<EOF
[Unit]
Description=Gunicorn instance for a Flask application
After=network.target

[Service]
User=ec2-user
WorkingDirectory=/home/ec2-user/helloworld
ExecStart=/home/ec2-user/helloworld/helloworld/bin/gunicorn -b 0.0.0.0:8000 app:app
Restart=always

[Install]
WantedBy=multi-user.target
EOF'






# Reload systemd to read the new service file
sudo systemctl daemon-reload

# Start and enable the service
sudo systemctl restart helloworld
sudo systemctl status helloworld



# Install Nginx
sudo yum install -y nginx




# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
sudo systemctl status nginx


# Add upstream configuration to Nginx default file
# sudo bash -c 'cat <<EOF > /etc/nginx/sites-available/default
# server {
#     listen 80 default_server;
#     server_name _;
    
#     location / {
#         proxy_pass http://flaskhelloworld;
#         proxy_set_header Host \$host;
#         proxy_set_header X-Real-IP \$remote_addr;
#         proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto \$scheme;
#     }
# }

# upstream flaskhelloworld {
#     server 127.0.0.1:8000;
# }
# EOF'

sudo bash -c 'cat <<EOF > /etc/nginx/conf.d/default.conf
server {
    listen 80 default_server;
    server_name _;

    location / {
        proxy_pass http://flaskhelloworld;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

upstream flaskhelloworld {
    server 127.0.0.1:8000;
}
EOF'


sudo systemctl restart nginx
