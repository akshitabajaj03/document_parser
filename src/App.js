import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import UploadFile from "./UploadFile";
import Form from "./Form";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UploadFile />} />
        <Route path="/form" element={<Form />} />
      </Routes>
    </Router>
  );
}

export default App;
