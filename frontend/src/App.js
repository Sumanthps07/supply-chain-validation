import React, { useState } from "react";
import axios from "axios";
import { Container, Button, Table, Form, Alert } from "react-bootstrap";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("❌ Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://127.0.0.1:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setData(response.data);
      setError("");
    } catch (err) {
      setError("❌ Error uploading file. Please check the format.");
    }
  };

  return (
    <Container className="mt-5">
      <div className="card-box">
        <h2 className="title">📊 AI-Powered CSV Validator</h2>

        <Form.Group controlId="formFile">
          <Form.Control type="file" onChange={handleFileChange} className="file-input" />
        </Form.Group>

        <Button onClick={handleUpload} className="upload-btn">Upload & Process</Button>

        {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

        {data && data.columns && (
          <>
            <h4 className="section-title">📌 Detected Columns</h4>
            <ul className="column-list">
              {data.columns.map((col, index) => <li key={index}>{col}</li>)}
            </ul>

            <h4 className="section-title">📄 Data Preview</h4>
            <Table striped bordered hover className="data-table">
              <thead>
                <tr>
                  {data.columns.map((col, index) => <th key={index}>{col}</th>)}
                </tr>
              </thead>
              <tbody>
                {data.preview && data.preview.length > 0 ? (
                  data.preview.map((row, i) => (
                    <tr key={i}>
                      {data.columns.map((col, j) => <td key={j}>{row[col] || "N/A"}</td>)}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={data.columns.length}>No data available</td>
                  </tr>
                )}
              </tbody>
            </Table>

            <h4 className="section-title">⚠️ Data Anomalies</h4>
            {data.anomalies ? (
              <ul className="anomaly-list">
                {Object.entries(data.anomalies).map(([col, values]) => (
                  <li key={col}>
                    {col}: {values.length > 0 ? values.join(", ") : "No anomalies"}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No anomalies detected</p>
            )}

            <h4 className="section-title">📉 Missing Values</h4>
            {data.missing_values ? (
              <ul className="missing-list">
                {Object.entries(data.missing_values).map(([col, count]) => (
                  <li key={col}>{col}: {count} missing values</li>
                ))}
              </ul>
            ) : (
              <p>No missing values</p>
            )}
          </>
        )}
      </div>
    </Container>
  );
}

export default App;