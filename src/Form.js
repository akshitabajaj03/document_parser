import React, { useState, useEffect } from "react";
import { ToastContainer,toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    mobileNumber: "",
    aadhaarNumber: "",
    passportNumber: "",
    dob: "",
    gender: "",
    address: "",
  });
  const [academicInfo, setAcademicInfo] = useState([]);

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

  const handlePersonalInfoChange = (field, value) => {
    setPersonalInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleAcademicInfoChange = (index, field, value) => {
    setAcademicInfo((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item
      )
    );
  };

  useEffect(() => {
    document.body.style.fontFamily = 'Poppins, sans-serif';
    const ans = [];
    ans[0] = extractDataFromAadhar(extractedTexts?.[0]?.text || "");
    ans[1] = extractPassportData(JSON.stringify(extractedTexts?.[1] || {}));
    ans[2] = extractSubjectsAndMarks(JSON.stringify(extractedTexts?.[2] || {}));

    setPersonalInfo((prev) => ({
      ...prev,
      name: formatName(ans[1].passportName) || extractName(ans[0].name) || "",
      mobileNumber: ans[0].mobileNumber || "",
      aadhaarNumber: ans[0].aadhaarNumber || "",
      dob:
        ans[0]?.dob?.length === 10
          ? ans[0].dob
          : ans[1].passportDOB || ans[0]?.year || "",
      gender: ans[0].gender
        ? ans[0].gender.charAt(0).toUpperCase() + ans[0].gender.slice(1)
        : "",
      address: ans[0].address || "",
      passportNumber: ans[1].passportNumber || "",
    }));
    setAcademicInfo(ans[2]);
  }, [extractedTexts]);

  const generatePDF = () => {
    if (
      !email ||
      !personalInfo.name ||
      !personalInfo.mobileNumber ||
      !personalInfo.dob ||
      !personalInfo.address ||
      !personalInfo.gender ||
      !academicInfo.length
    ) {
      toast.error("Please fill all the fields.");
      return;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      toast.error("Please enter a valid email address.");
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
    doc.text(`1. Full Name: ${personalInfo.name}`, 10, 45);
    doc.text(`2. Phone Number: ${personalInfo.mobileNumber}`, 10, 55);
    doc.text(`3. Email Address: ${email}`, 10, 65);
    doc.text(`4. Address: ${personalInfo.address}`, 10, 75);
    doc.text(`5. Date of Birth: ${personalInfo.dob}`, 10, 90);
    doc.text(`6. Gender: ${personalInfo.gender}`, 10, 100);
    doc.text(`7. Passport Number: ${personalInfo.passportNumber}`, 10, 110);

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
      body: academicInfo.map((item) => [item.subject, item.marks]),
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
                <input
                  type="text"
                  value={personalInfo.name}
                  onChange={(e) =>
                    handlePersonalInfoChange("name", e.target.value)
                  }
                  placeholder="Enter Name"
                  style={inputStyle}
                />
              </p>
              <p>
                <strong>Date of Birth:</strong>{" "}
                <input
                  type="text"
                  value={personalInfo.dob}
                  onChange={(e) =>
                    handlePersonalInfoChange("dob", e.target.value)
                  }
                  placeholder="Enter Date of Birth"
                  style={inputStyle}
                />
              </p>
              <p>
                <strong>Mobile Number:</strong>{" "}
                <input
                  type="text"
                  value={personalInfo.mobileNumber}
                  onChange={(e) =>
                    handlePersonalInfoChange("mobileNumber", e.target.value)
                  }
                  placeholder="Enter Mobile Number"
                  style={inputStyle}
                />
              </p>
              <p>
                <strong>Aadhaar Number:</strong>{" "}
                <input
                  type="text"
                  value={personalInfo.aadhaarNumber}
                  onChange={(e) =>
                    handlePersonalInfoChange("aadhaarNumber", e.target.value)
                  }
                  placeholder="Enter Aadhaar Number"
                  style={inputStyle}
                />
              </p>
              <p>
                <strong>Passport Number:</strong>{" "}
                <input
                  type="text"
                  value={personalInfo.passportNumber}
                  onChange={(e) =>
                    handlePersonalInfoChange("passportNumber", e.target.value)
                  }
                  placeholder="Enter Passport Number"
                  style={inputStyle}
                />
              </p>
              <div>
                <strong>Gender:</strong>
                <div style={{ marginTop: "10px" }}>
                  <label>
                    <input
                      type="radio"
                      checked={personalInfo.gender === "Male"}
                      onChange={() =>
                        handlePersonalInfoChange("gender", "Male")
                      }
                    />
                    Male
                  </label>
                  <label style={{ marginLeft: "20px" }}>
                    <input
                      type="radio"
                      checked={personalInfo.gender === "Female"}
                      onChange={() =>
                        handlePersonalInfoChange("gender", "Female")
                      }
                    />
                    Female
                  </label>
                  <label style={{ marginLeft: "20px" }}>
                    <input
                      type="radio"
                      checked={personalInfo.gender === "Other"}
                      onChange={() =>
                        handlePersonalInfoChange("gender", "Other")
                      }
                    />
                    Other
                  </label>
                </div>
              </div>
              <p>
                <strong>Address:</strong>{" "}
                <textarea
                  value={personalInfo.address}
                  onChange={(e) =>
                    handlePersonalInfoChange("address", e.target.value)
                  }
                  placeholder="Enter Address"
                  style={{ ...inputStyle, height: "60px" }}
                />
              </p>
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
                  {academicInfo.map((item, index) => (
                    <tr key={index}>
                      <td style={tableDataStyle}>
                        <input
                          type="text"
                          value={item.subject}
                          onChange={(e) =>
                            handleAcademicInfoChange(
                              index,
                              "subject",
                              e.target.value
                            )
                          }
                          placeholder="Enter Subject"
                          style={inputStyle}
                        />
                      </td>
                      <td style={tableDataStyle}>
                        <input
                          type="number"
                          value={item.marks}
                          onChange={(e) =>
                            handleAcademicInfoChange(
                              index,
                              "marks",
                              e.target.value
                            )
                          }
                          placeholder="Enter Marks"
                          style={inputStyle}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <h3>Loading...</h3>
      )}
      <ToastContainer />
    </div>
  );
};

export default Form;
