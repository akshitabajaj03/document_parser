import React, { useState } from "react";
import {
  outerStyle,
  buttonStyle,
  emailStyle,
  inputStyle,
  gridStyle,
  innerGridStyle,
  tableDataStyle,
  tableHeadStyle,
  tableStyle,
} from "./Style";
import {
  extractDataFromAadhar,
  extractPassportData,
  extractSubjectsAndMarks,
} from "./ExtractData";
import { useLocation } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";

const Form = () => {
  const location = useLocation();
  const { extractedTexts } = location.state || {};
  const [email, setEmail] = useState("");

  const formatName = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const extractName = (name) => {
    const match = name?.match(/To\s+(\S+\s+\S+)/i);
    return match ? match[1] : null;
  };

  const ans = [];
  ans[0] = extractDataFromAadhar(extractedTexts[0]?.text || "");
  ans[1] = extractPassportData(JSON.stringify(extractedTexts[1]));
  ans[2] = extractSubjectsAndMarks(JSON.stringify(extractedTexts[2]));

  const generatePDF = () => {
    if (!email) {
      alert("Please enter a valid email address.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(0, 51, 102);
    doc.text("Input Details Form", 105, 20, null, null, "center");

    doc.setDrawColor(0, 51, 102);
    doc.setLineWidth(0.5);
    doc.line(10, 25, 200, 25);

    // Personal Information Section
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Personal Information", 10, 35);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50);
    doc.text(
      `1. Full Name: ${
        formatName(ans[1]?.passportName) ||
        extractName(ans[0]?.name) ||
        "Missing Value"
      }`,
      10,
      45
    );
    doc.text(
      `2. Phone Number: ${ans[0].mobileNumber || "Missing Value"}`,
      10,
      55
    );
    doc.text(`3. Email Address: ${email}`, 10, 65);
    doc.text(`4. Address: ${ans[0].address || "Missing Value"}`, 10, 75);
    doc.text(
      `5. Date of Birth: ${
        ans[0]?.dob?.length === 10
          ? ans[0].dob
          : ans[1].passportDOB || ans[0]?.year || "Missing Value"
      }`,
      10,
      90
    );
    doc.text(
      `6. Gender: ${
        ans[0].gender
          ? ans[0].gender.charAt(0).toUpperCase() + ans[0].gender.slice(1)
          : "Missing Value"
      }`,
      10,
      100
    );
    doc.text(
      `7. Passport Number: ${ans[1].passportNumber || "Missing Value"}`,
      10,
      110
    );

    // Academic Information Section
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Academic Information", 10, 125);

    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 51, 102);
    doc.line(10, 128, 200, 128);

    // Academic Table
    doc.autoTable({
      startY: 135,
      theme: "grid",
      styles: { font: "helvetica", fontSize: 10, textColor: [0, 0, 0] },
      headStyles: { fillColor: [0, 51, 102], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      head: [["Subject", "Marks"]],
      body: ans[2].map((item) => [item.subject, item.marks]),
    });

    doc.save("Input_Details_Form.pdf");
  };

  return (
    <div style={outerStyle}>
      {extractedTexts ? (
        <div>
          {/* Download PDF Button */}
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <button onClick={generatePDF} style={buttonStyle}>
              Download PDF
            </button>
          </div>
          {/* Enter Email Address Section */}
          <div style={emailStyle}>
            <h3 style={{ color: "#003366" }}>Enter Email Address</h3>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={inputStyle}
            />
          </div>
          {/* Personal and Academic Information Sections */}
          <div style={gridStyle}>
            <div style={innerGridStyle}>
              <h3 style={{ color: "#003366" }}>Personal Information</h3>
              <p>
                <strong>Name:</strong>{" "}
                {formatName(ans[1].passportName) ||
                  extractName(ans[0].name) ||
                  "Missing Value"}
              </p>
              <p>
                <strong>Date of Birth:</strong>{" "}
                {ans[0]?.dob?.length === 10
                  ? ans[0].dob
                  : ans[1].passportDOB || ans[0]?.year || "Missing Value"}
              </p>
              <p>
                <strong>Mobile Number:</strong>{" "}
                {ans[0].mobileNumber || "Missing Value"}
              </p>
              <p>
                <strong>Aadhaar Number:</strong>{" "}
                {ans[0].aadhaarNumber || "Missing Value"}
              </p>
              <p>
                <strong>Passport Number:</strong>{" "}
                {ans[1].passportNumber || "Missing Value"}
              </p>
              <div>
                <strong>Gender:</strong>
                <div style={{ marginTop: "10px" }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={ans[0].gender === "male"}
                      readOnly
                    />{" "}
                    Male
                  </label>
                  <label style={{ marginLeft: "20px" }}>
                    <input
                      type="checkbox"
                      checked={ans[0].gender === "female"}
                      readOnly
                    />{" "}
                    Female
                  </label>
                </div>
              </div>
            </div>
            <div style={innerGridStyle}>
              <h3 style={{ color: "#003366" }}>Academic Information</h3>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={tableHeadStyle}>Subject</th>
                    <th style={tableHeadStyle}>Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {ans[2].map((item, index) => (
                    <tr key={index}>
                      <td style={tableDataStyle}>{item.subject}</td>
                      <td style={tableDataStyle}>{item.marks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <p>No extracted data available</p>
      )}
    </div>
  );
};

export default Form;
