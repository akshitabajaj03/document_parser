import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Tesseract from "tesseract.js";
import { ToastContainer, toast } from "react-toastify";
import {
  Button,
  Card,
  CardContent,
  CircularProgress,
  Box,
  Typography,
  Grid,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import * as pdfjsLib from "pdfjs-dist/webpack";

const UploadFile = () => {
  const [files, setFiles] = useState({
    aadhar: null,
    passport: null,
    marksheet12th: null,
    marksheet10th: null,
  });
  const [imagePreviews, setImagePreviews] = useState({
    aadhar: null,
    passport: null,
    marksheet12th: null,
    marksheet10th: null,
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const steps = ["aadhar", "passport", "marksheet12th", "marksheet10th"];

  const handleFileChange = async (e, type) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
      const maxSize = 5 * 1024 * 1024;

      if (!allowedTypes.includes(file.type)) {
        toast.warning("Please upload a valid image or PDF file.", { position: "top-right" });
        return;
      }

      if (file.size > maxSize) {
        toast.warning("File size exceeds 5MB. Please upload a smaller file.", { position: "top-right" });
        return;
      }

      setFiles({ ...files, [type]: file });

      if (file.type === "application/pdf") {
        const firstPageImage = await renderPdfToImage(file);
        setFiles((prevFiles) => ({
          ...prevFiles,
          [type]: firstPageImage,
        }));
        setImagePreviews({
          ...imagePreviews,
          [type]: firstPageImage,
        });
      } else {
        setImagePreviews({
          ...imagePreviews,
          [type]: URL.createObjectURL(file),
        });
      }
    }
  };

  const renderPdfToImage = (pdfFile) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const loadingTask = pdfjsLib.getDocument(reader.result);
          const pdf = await loadingTask.promise;
          const page = await pdf.getPage(1);
          const viewport = page.getViewport({ scale: 1 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
  
          canvas.height = viewport.height;
          canvas.width = viewport.width;
  
          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;
          const imageDataUrl = canvas.toDataURL();
          resolve(imageDataUrl);
        } catch (error) {
          reject("Error rendering PDF page to image");
        }
      };
  
      reader.onerror = () => reject("Error reading PDF file");
  
      reader.readAsArrayBuffer(pdfFile);
    });
  };
  
  const extractTextFromImage = async (file) => {
    if (!file) return "";
    try {
      const {
        data: { text },
      } = await Tesseract.recognize(file, "eng");
      return text;
    } catch (error) {
      console.error("Error extracting text:", error);
      return "Error extracting text";
    }
  };

  const handleGenerateForm = async () => {
    setLoading(true);

    const extractedTexts = [];

    for (const key of Object.keys(files)) {
      
      const extractedText = await extractTextFromImage(files[key]);
      extractedTexts.push({ type: key, text: extractedText });
    }

    setLoading(false);
    navigate("/form", { state: { extractedTexts } });
  };

  const theme = createTheme({
    typography: {
      fontFamily: '"Poppins", sans-serif',
      h4: {
        fontFamily: '"Poppins", sans-serif',
        fontWeight: 700,
        fontSize: "30px",
        color: "#2c3e50",
        letterSpacing: "0.5px",
        textAlign: "center",
      },
      h6: {
        fontFamily: '"Poppins", sans-serif',
        fontWeight: 600,
        fontSize: "18px",
        color: "#34495e",
      },
    },
    palette: {
      primary: {
        main: "#1E2A47", // Blue
      },
      secondary: {
        main: "#4A90E2", // Purple
      },
      background: {
        default: "#f4f6f9", // Light grey background
        paper: "#ffffff", // White paper background
      },
      text: {
        primary: "#2c3e50",
        secondary: "#7f8c8d",
      },
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            borderRadius: 12,
            fontWeight: 600,
            transition: "all 0.3s ease",
          },
          contained: {
            padding: "14px 28px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          },
          outlined: {
            padding: "14px 28px",
            border: "2px solid",
          },
        },
      },
    },
  });

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Box
          sx={{
            maxWidth: "900px",
            width: "100%",
            padding: "40px",
            backgroundColor: theme.palette.background.paper,
            borderRadius: "16px",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
            border: "1px solid #ecf0f1",
          }}
        >
          <Typography variant="h4" gutterBottom>
            Your Files, Ready to Upload
          </Typography>

          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} sm={6} key={steps[currentStep]}>
              <Card
                variant="outlined"
                sx={{ padding: 3, borderRadius: "16px", boxShadow: 3 }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Upload{" "}
                    {steps[currentStep].charAt(0).toUpperCase() +
                      steps[currentStep].slice(1)}
                  </Typography>

                  {imagePreviews[steps[currentStep]] && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        marginBottom: "15px",
                      }}
                    >
                      <img
                        src={imagePreviews[steps[currentStep]]}
                        alt={`${steps[currentStep]} Preview`}
                        style={{
                          width: "100%",
                          maxHeight: "250px",
                          objectFit: "contain",
                          borderRadius: "12px",
                          transition: "transform 0.3s ease",
                        }}
                      />
                    </Box>
                  )}

                  <Button
                    variant="contained"
                    component="label"
                    color="primary"
                    fullWidth
                    sx={{
                      fontSize: "16px",
                      fontWeight: 600,
                      textTransform: "none",
                      padding: "14px 0",
                      borderRadius: "12px",
                      backgroundColor: theme.palette.primary.main,
                      "&:hover": {
                        backgroundColor: "#2980b9",
                      },
                    }}
                  >
                    Upload{" "}
                    {steps[currentStep].charAt(0).toUpperCase() +
                      steps[currentStep].slice(1)}
                    <input
                      type="file"
                      accept="image/*, application/pdf"
                      onChange={(e) => handleFileChange(e, steps[currentStep])}
                      hidden
                    />
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "30px",
            }}
          >
            {currentStep < steps.length - 1 && (
              <>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handlePrevStep}
                  disabled={currentStep === 0}
                  sx={{
                    fontSize: "16px",
                    padding: "12px 24px",
                    borderRadius: "12px",
                    "&:hover": {
                      backgroundColor: "#ecf0f1",
                    },
                  }}
                >
                  Previous
                </Button>

                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleNextStep}
                  disabled={!files[steps[currentStep]]}
                  sx={{
                    fontSize: "16px",
                    padding: "12px 24px",
                    borderRadius: "12px",
                    backgroundColor: theme.palette.secondary.main,
                    "&:hover": {
                      backgroundColor: "#9b59b6",
                    },
                  }}
                >
                  Next
                </Button>
              </>
            )}
          </Box>

          {currentStep === steps.length - 1 && (
            <Box sx={{ textAlign: "center", marginTop: "30px" }}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                sx={{
                  padding: "14px 28px",
                  fontSize: "16px",
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: "12px",
                  backgroundColor: theme.palette.secondary.main,
                  "&:hover": {
                    backgroundColor: "#9b59b6",
                  },
                }}
                onClick={handleGenerateForm}
                disabled={loading || Object.values(files).some((file) => !file)}
              >
                {loading ? (
                  <CircularProgress
                    size={24}
                    color="secondary"
                    sx={{ marginRight: "10px" }}
                  />
                ) : (
                  "Generate Form"
                )}
              </Button>
            </Box>
          )}
        </Box>
      </Box>
      <ToastContainer />
    </ThemeProvider>
  );
};

export default UploadFile;
