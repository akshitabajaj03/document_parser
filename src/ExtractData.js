function extractDataFromAadhar(text) {
  let regexGender = null;
  let regexName = null;
  let regexDOB = null;
  let regexMobileNumber = null;
  let regexAadhaarNumber = null;
  let regexYear = null;

  const nameMatches = text.match(/[A-Z][a-z]+/g);
  if (nameMatches && nameMatches.length > 0) {
    regexName = nameMatches.join(" ");
  }

  const genderMatches = text.match(/MALE|FEMALE|male|female|Male|Female/);
  if (genderMatches) {
    regexGender = genderMatches[0].toLowerCase();
  }

  const dobMatches = text.match(/\d{2}\/\d{2}\/\d{4}/);
  if (dobMatches) {
    regexDOB = dobMatches[0];
  }

  const yearMatches = text.match(/\d{4}/);
  if (yearMatches) {
    regexYear = yearMatches[0];
  }

  const mobileMatches = text.match(/\d{10}/);
  if (mobileMatches) {
    regexMobileNumber = mobileMatches[0];
  }

  const aadhaarMatches = text.match(/\d{4} \d{4} \d{4}/);
  if (aadhaarMatches) {
    regexAadhaarNumber = aadhaarMatches[0];
  }

  return {
    year: regexYear,
    name: regexName,
    gender: regexGender,
    dob: regexDOB,
    mobileNumber: regexMobileNumber,
    aadhaarNumber: regexAadhaarNumber,
  };
}

const extractPassportData = (text) => {
  let passportNumber = null;
  let passportName = null;
  let passportDOB = null;

  const passportNumberMatch = text.match(/[A-Z]{1}\d{7}/);
  if (passportNumberMatch) {
    passportNumber = passportNumberMatch[0];
  }

  const dobMatch = text?.match(/\b(\d{2}\/\d{2}\/\d{4})\b/);
  passportDOB = dobMatch ? dobMatch[1] : null;

  const nameMatch = text.match(/<<([A-Z<\s]+)(?=\s|$)/);
  if (nameMatch) {
    passportName = nameMatch[1].replace(/<+/g, " ").trim();
  }

  return {
    passportNumber: passportNumber,
    passportName: passportName,
    passportDOB: passportDOB,
  };
};

const extractSubjectsAndMarks = (text) => {
  const subjectRegex = /\s*([A-Za-z\s]+)\s+(\d{2})\s+[A-Za-z\s]+/g;
  let subjectsAndMarks = [];
  let match;

  while ((match = subjectRegex.exec(text)) !== null) {
    subjectsAndMarks.push({
      subject:
        match[1].trim().slice(1).charAt(0).toUpperCase() +
        match[1].trim().slice(2).toLowerCase(),
      marks: match[2],
    });
  }

  while (subjectsAndMarks.length < 5) {
    subjectsAndMarks.push({ subject: "________________", marks: "____" });
  }

  return subjectsAndMarks.slice(0, 5);
};

export { extractDataFromAadhar, extractPassportData, extractSubjectsAndMarks };
