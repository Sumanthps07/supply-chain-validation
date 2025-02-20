from flask import Flask, request, jsonify
import pandas as pd
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

def is_valid_date(date_str):
    """Check if a date is valid (assumes DD-MM-YYYY format)."""
    try:
        pd.to_datetime(date_str, format="%d-%m-%Y", errors="raise")
        return True
    except:
        return False

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']

    try:
        # Read the CSV file, skipping the first row (header)
        df = pd.read_csv(file, header=None, skiprows=1)

        # Rename columns to match expected format
        df.columns = ["product_name", "quantity", "delivery_date"]

        # Convert quantity to numeric, handling errors (e.g., NaN)
        df["quantity"] = pd.to_numeric(df["quantity"], errors="coerce")

        # Identify missing values
        missing_values = df.isnull().sum().to_dict()

        # Identify invalid numerical values (e.g., negative quantity)
        anomalies = {}

        for col in df.columns:
            if df[col].dtype == "int64" or df[col].dtype == "float64":
                anomalies[col] = df[df[col] < 0][col].tolist()  # Store negative values

            if "date" in col.lower():  # Check if column name suggests a date
                anomalies[col] = df[~df[col].apply(is_valid_date)][col].tolist()  # Invalid dates

        # Prepare response
        response = {
            "columns": df.columns.tolist(),
            "preview": df.head(5).to_dict(orient="records"),
            "missing_values": missing_values,
            "anomalies": anomalies,
        }

        return jsonify(response)

    except Exception as e:
        return jsonify({'error': f'Error processing file: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))