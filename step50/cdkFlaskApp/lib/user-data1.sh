#!/bin/bash
# Update and install required packages
# Install Python Virtualenv
sudo apt-get update 
sudo apt-get upgrade

sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt update

sudo apt-get install python3.10-venv

# Activate the new virtual environment in a new directory


mkdir helloworld
cd helloworld


#Create the virtual environment
python3.10 -m venv venv
#Activate the virtual environment
source venv/bin/activate

#Install Flask

# Install Flask and other dependencies
pip install Flask 
pip install tensorflow==2.12.0 --no-cache-dir


# Setup Flask application

echo "from flask import Flask, request, render_template
import pickle
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences
import numpy as np

model = load_model('sentiment_model.h5')
with open('tokenizer.pkl', 'rb') as f:
    tokenizer = pickle.load(f)

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def home():
    if request.method == 'POST':
        new_review = request.form['review']    
        sentiment = predict_sentiment(new_review, model, tokenizer)
        return render_template('index.html', sentiment=sentiment , new_review=new_review )
    return render_template('index.html')

def preprocess_text(text, tokenizer, max_length=250):
    sequence = tokenizer.texts_to_sequences([text])
    padded_sequence = pad_sequences(sequence, maxlen=max_length, padding='post')
    return padded_sequence

def predict_sentiment(text, model, tokenizer):
    preprocessed_text = preprocess_text(text, tokenizer)
    prediction = model.predict(preprocessed_text)[0]
    print('Prediction:', prediction)
    sentiment_label = 'Negative' if prediction < 0.5 else 'Positive'
    return sentiment_label

if __name__ == '__main__':
    app.run(debug=True)" > app.py

mkdir templates
echo "<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Sentiment Analysis</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f0f0f0; }
        h1 { text-align: center; margin-top: 50px; color: #333; }
        form { text-align: center; margin-top: 30px; }
        input[type='text'] { width: 300px; padding: 10px; border: 2px solid #ccc; border-radius: 5px; font-size: 16px; outline: none; }
        button { padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; }
        button:hover { background-color: #45a049; }
        h2 { text-align: center; margin-top: 20px; color: #333; }
    </style>
</head>
<body>
    <h1>Sentiment Analysis of User Reviews</h1>
    <form action='/' method='post'>
        <input type='text' name='review' placeholder='Enter a review' required>
        <button type='submit'>Analyze Sentiment</button>
    </form>
    {% if sentiment %}
        <h2>Review: {{ new_review }}</h2>
        <h2>Sentiment: {{ sentiment }}</h2>
    {% endif %}
</body>
</html>" > templates/index.html


#Transfer the "sentiment_model.h5" and tokenizer.pkl file to the EC2 instance using SCP.Transfer the file from your local PC to the EC2 instance

# Clone your Flask app from a repository or transfer files (assumed to be in S3)
aws s3 cp s3://BUCKET_NAME_PLACEHOLDER/sentiment_model.h5 /home/ubuntu/helloworld
aws s3 cp s3://BUCKET_NAME_PLACEHOLDER/tokenizer.pkl /home/ubuntu/helloworld


# Install Gunicorn using the below command:
pip install gunicorn

# Run the Flask app
gunicorn -b 0.0.0.0:8000 app:app 

# sudo nano /etc/systemd/system/helloworld.service

echo "[Unit]
Description=Gunicorn instance for a simple hello world app
After=network.target
[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/home/ubuntu/helloworld
ExecStart=/home/ubuntu/helloworld/venv/bin/gunicorn -b localhost:8000 app:app
Restart=always
[Install]
WantedBy=multi-user.target" > /etc/systemd/system/helloworld.service

#Then enable the service:
sudo systemctl daemon-reload
sudo systemctl start helloworld
sudo systemctl enable helloworld

# Install and configure Nginx
sudo apt-get install nginx
sudo systemctl start nginx
sudo systemctl enable nginx



#Edit the default file in the sites-available folder.

# sudo nano /etc/nginx/sites-available/default

echo "upstream flaskhelloworld {
    server 127.0.0.1:8000;
}" > /etc/nginx/sites-available/default



#Add a proxy_pass to flaskhelloworld atlocation /

echo "location / {
    proxy_pass http://flaskhelloworld;
}" > /etc/nginx/sites-available/default

# Configure Nginx to proxy requests to Gunicorn



sudo systemctl restart nginx
