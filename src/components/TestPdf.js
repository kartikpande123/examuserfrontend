import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { Viewer, SpecialZoomLevel } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import API_BASE_URL from './ApiConifg';

const SyllabiViewer = () => {
  const [syllabi, setSyllabi] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [pdfLoadingState, setPdfLoadingState] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  
  // Create the plugin instance
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  useEffect(() => {
    fetchSyllabi();
  }, []);

  const fetchSyllabi = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/pdf-syllabi`);
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      setSyllabi(data);
      setLoading(false);
    } catch (err) {
      setError(`Failed to fetch syllabi: ${err.message}`);
      setLoading(false);
      console.error("Error fetching syllabi:", err);
    }
  };

  const handlePdfClick = (syllabus, title) => {
    // Check if fileUrl exists and is valid
    if (syllabus && syllabus.fileUrl && typeof syllabus.fileUrl === 'string' && syllabus.fileUrl.trim() !== '') {
      try {
        setPdfLoadingState('loading');
        setError(null);
        
        // Using the signed URL directly now - no proxy needed
        setSelectedPdf({
          url: syllabus.fileUrl, // This is already a signed URL from the backend
          title: title,
          duration: syllabus.duration,
          fees: syllabus.fees,
          category: syllabus.category,
          hasError: syllabus.fileError
        });
        
        setShowPdfViewer(true);
        setPdfLoadingState('success');
      } catch (err) {
        console.error("Error setting up PDF viewer:", err);
        setError(`Failed to load PDF: ${err.message}`);
        setPdfLoadingState('error');
      }
    } else {
      console.error("Invalid PDF URL for syllabus:", syllabus);
      setError('Invalid PDF URL - The URL appears to be missing or malformed');
    }
  };

  const closePdfViewer = () => {
    setShowPdfViewer(false);
    setSelectedPdf(null);
    setPdfLoadingState('idle');
  };

  // Error boundary for PDF viewer errors
  const renderPdfViewer = () => {
    try {
      if (!selectedPdf || !selectedPdf.url) {
        return (
          <div className="text-center p-5">
            <p>No PDF selected or invalid PDF URL</p>
          </div>
        );
      }
      
      if (selectedPdf.hasError) {
        return (
          <div className="text-center p-5">
            <div className="alert alert-warning">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              This PDF file may be unavailable or has access restrictions.
              <button 
                className="btn btn-sm btn-outline-primary ms-3"
                onClick={fetchSyllabi}
              >
                Refresh Data
              </button>
            </div>
          </div>
        );
      }
      
      if (pdfLoadingState === 'loading') {
        return (
          <div className="text-center p-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading PDF...</span>
            </div>
            <p className="mt-2">Loading PDF document...</p>
          </div>
        );
      }
      
      return (
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <div className="pdf-viewer-container">
            <Viewer
              fileUrl={selectedPdf.url}
              plugins={[defaultLayoutPluginInstance]}
              defaultScale={SpecialZoomLevel.PageFit}
              onDocumentLoad={() => setPdfLoadingState('success')}
              onError={(error) => {
                console.error("PDF viewer error:", error);
                setError(`Error rendering PDF: ${error.message}`);
                setPdfLoadingState('error');
              }}
            />
          </div>
        </Worker>
      );
    } catch (err) {
      console.error("Error rendering PDF:", err);
      return (
        <div className="alert alert-danger">
          Error loading PDF viewer: {err.message}
        </div>
      );
    }
  };

  if (loading && !showPdfViewer) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading content...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">PDF Syllabi</h2>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
          <button 
            className="btn btn-outline-primary ms-3"
            onClick={() => {
              setError(null);
              if (!showPdfViewer) {
                fetchSyllabi();
              } else {
                closePdfViewer();
              }
            }}
          >
            {showPdfViewer ? 'Go Back' : 'Try Again'}
          </button>
        </div>
      )}
      
      {/* Display categories and PDFs */}
      <div className="row">
        <div className="col-md-4">
          <div className="list-group mb-4">
            {Object.keys(syllabi).length > 0 ? (
              Object.keys(syllabi).map((category) => (
                <div key={category} className="mb-3">
                  <h5 className="mb-2">{category}</h5>
                  {Object.keys(syllabi[category]).map((title) => {
                    const syllabus = syllabi[category][title];
                    return (
                      <button
                        key={title}
                        className="list-group-item list-group-item-action"
                        onClick={() => handlePdfClick(syllabus, title)}
                        disabled={syllabus.fileError}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <span>
                            {title}
                            {syllabus.fileError && 
                              <span className="badge bg-warning text-dark ms-2">
                                <i className="bi bi-exclamation-circle me-1"></i>
                                Unavailable
                              </span>
                            }
                          </span>
                          <span className="badge rounded-pill bg-primary">
                            {syllabus.fees > 0 ? `₹${syllabus.fees}` : 'Free'}
                          </span>
                        </div>
                        <small className="text-muted">Duration: {syllabus.duration}</small>
                      </button>
                    );
                  })}
                </div>
              ))
            ) : (
              <div className="alert alert-info">No syllabi available.</div>
            )}
          </div>
        </div>
        
        {/* PDF Viewer */}
        <div className="col-md-8">
          {showPdfViewer && selectedPdf ? (
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-0">{selectedPdf.title}</h5>
                  <div className="small text-muted">
                    Category: {selectedPdf.category} | Duration: {selectedPdf.duration} | 
                    Fees: {selectedPdf.fees > 0 ? `₹${selectedPdf.fees}` : 'Free'}
                  </div>
                </div>
                <button 
                  className="btn-close" 
                  aria-label="Close"
                  onClick={closePdfViewer}
                ></button>
              </div>
              <div className="card-body p-0" style={{ height: '70vh' }}>
                {renderPdfViewer()}
              </div>
              <div className="card-footer d-flex justify-content-between">
                <a 
                  href={selectedPdf.url}
                  className="btn btn-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open PDF in New Tab
                </a>
                {pdfLoadingState === 'error' && (
                  <button
                    className="btn btn-warning"
                    onClick={() => {
                      // Refresh the syllabi data to get new signed URLs
                      fetchSyllabi().then(() => {
                        // Close the current PDF viewer
                        closePdfViewer();
                      });
                    }}
                  >
                    Refresh PDF Data
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="card h-100 d-flex justify-content-center align-items-center">
              <p className="text-muted">Select a PDF to view</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SyllabiViewer;