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

  const addressRegex = /Address:\s*(.*?)(?=\s*आधार|$)/s;
  const address = text.match(addressRegex)?.[1]?.trim();

  return {
    year: regexYear,
    name: regexName,
    gender: regexGender,
    dob: regexDOB,
    mobileNumber: regexMobileNumber,
    aadhaarNumber: regexAadhaarNumber,
    address:address,
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

  const pattern = /Given\s+Name\(s\):\s*(.*)/;
  passportName = (text.match(pattern))[1].replace(/\*\*/g, '').trim();;

  return {
    passportNumber: passportNumber,
    passportName: passportName,
    passportDOB: passportDOB,
  };
};

const extractSubjectsAndMarks = (text) => {
  const dobPattern = /Date of Birth (\d{2}-\d{2}-\d{4})/;
    const dobMatch = text.match(dobPattern);
    const dateOfBirth = dobMatch ? dobMatch[1] : "Not Found";

    // Extract Subject and Total Marks
    const subjectPattern = /\|\s+(\d{3})\s+\|\s+([\w\s&.\-]+)\s+\|\s+\d+\s+\|\s+\d+\s+\|\s+(\d+)\s+\|/g;
    const subjects = [];
    let match;

    while ((match = subjectPattern.exec(text)) !== null) {
        const subjectName = match[2].trim();
        const totalMarks = parseInt(match[3], 10);

        subjects.push({
            subjectName,
            totalMarks,
        });
    }

    // Ensure there are at least 5 subjects by adding placeholders
    while (subjects.length < 5) {
        subjects.push({ subjectName: "________________", totalMarks: "____" });
    }

    return { dateOfBirth, subjects: subjects.slice(0, 5) };
};

export { extractDataFromAadhar, extractPassportData, extractSubjectsAndMarks };
