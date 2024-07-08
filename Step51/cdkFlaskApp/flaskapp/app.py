from flask import Flask, request, render_template
import pickle
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences
import numpy as np

# Load the model and tokenizer
model = load_model('sentiment_model.h5')
# Load tokenizer
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
    print("Prediction:", prediction)
    sentiment_label = 'Negative' if prediction < 0.5 else 'Positive'
    return sentiment_label


if __name__ == "__main__":
    app.run(debug=True)

