import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import API_BASE_URL from './ApiConifg';

// PDF.js uses a global variable to find its worker
window.pdfjsLib = window.pdfjsLib || {};
window.pdfjsLib.GlobalWorkerOptions = window.pdfjsLib.GlobalWorkerOptions || {};
window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

export default function SecurePdfViewer({ syllabusFilePath }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const canvasRef = useRef(null);
  const [scale, setScale] = useState(1.5);
  const [isMobile, setIsMobile] = useState(false);
  const pdfDocRef = useRef(null);

  // Detect mobile view
  useEffect(() => {
    const updateDevice = () => setIsMobile(window.innerWidth < 768);
    updateDevice();
    window.addEventListener('resize', updateDevice);
    return () => window.removeEventListener('resize', updateDevice);
  }, []);

  // Load the PDF
  useEffect(() => {
    const loadPdf = async () => {
      try {
        setLoading(true);
        setError('');
        
        if (!syllabusFilePath) {
          setError('No file path provided');
          setLoading(false);
          return;
        }

        const encoded = encodeURIComponent(syllabusFilePath);
        const pdfUrl = `${API_BASE_URL}/proxy-pdf/${encoded}`;
        
        // Load the PDF.js script dynamically
        const pdfjsLib = await import('pdfjs-dist');
        
        // Load document
        const loadingTask = pdfjsLib.getDocument({
          url: pdfUrl,
          withCredentials: false
        });

        const pdf = await loadingTask.promise;
        pdfDocRef.current = pdf;
        setNumPages(pdf.numPages);
        
        // Render first page
        await renderPage(1, pdf);
        setLoading(false);
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError(`Failed to load the PDF: ${err.message}`);
        setLoading(false);
      }
    };

    loadPdf();
    
    // Disable keyboard shortcuts & right-click
    const disableContextMenu = (e) => e.preventDefault();
    const disableKeys = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.preventDefault) e.preventDefault();
      if ([112, 123, 44].includes(e.keyCode)) e.preventDefault(); // F1, F12, Print Screen
    };

    document.addEventListener('contextmenu', disableContextMenu);
    document.addEventListener('keydown', disableKeys);

    return () => {
      document.removeEventListener('contextmenu', disableContextMenu);
      document.removeEventListener('keydown', disableKeys);
    };
  }, [syllabusFilePath]);

  // Render a specific page
  const renderPage = async (pageNum, pdfDoc = null) => {
    try {
      const pdf = pdfDoc || pdfDocRef.current;
      if (!pdf) return;
      
      const page = await pdf.getPage(pageNum);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Calculate scale based on viewport to fit the width
      const viewport = page.getViewport({ scale });
      
      // Set canvas dimensions to match the viewport
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      // Render the PDF page
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      
      await page.render(renderContext).promise;
      
      // Add watermark
      drawWatermark(context, canvas.width, canvas.height);
      
      setCurrentPage(pageNum);
    } catch (err) {
      console.error('Error rendering page:', err);
      setError(`Failed to render page: ${err.message}`);
    }
  };
  
  // Draw watermark on the canvas
  const drawWatermark = (context, width, height) => {
    const text = "ARN Private Exam Conduct";
    context.save();
    context.globalAlpha = 0.1;
    context.font = isMobile ? '20px Arial' : '40px Arial';
    context.fillStyle = '#000';
    context.translate(width / 2, height / 2);
    context.rotate(-Math.PI / 6); // -30 degrees
    context.textAlign = 'center';
    context.fillText(text, 0, 0);
    context.restore();
  };
  
  // Change page handlers
  const prevPage = () => {
    if (currentPage > 1) {
      renderPage(currentPage - 1);
    }
  };
  
  const nextPage = () => {
    if (currentPage < numPages) {
      renderPage(currentPage + 1);
    }
  };
  
  // Zoom handlers
  const zoomIn = () => {
    setScale(prevScale => {
      const newScale = prevScale + 0.25;
      renderPage(currentPage);
      return newScale;
    });
  };
  
  const zoomOut = () => {
    setScale(prevScale => {
      const newScale = Math.max(0.5, prevScale - 0.25);
      renderPage(currentPage);
      return newScale;
    });
  };
  
  return (
    <div className="container-fluid mt-3">
      <div className="card shadow">
        <div className="card-header bg-dark text-white text-center">
          <h4 className="mb-0">Syllabus Viewer</h4>
        </div>

        <div className="card-body p-2">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
              <p className="mt-2">Loading PDF...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : (
            <>
              <div className="d-flex justify-content-between mb-2">
                <div>
                  <button 
                    className="btn btn-sm btn-outline-primary me-2" 
                    onClick={prevPage}
                    disabled={currentPage <= 1}
                  >
                    Previous
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-primary" 
                    onClick={nextPage}
                    disabled={currentPage >= numPages}
                  >
                    Next
                  </button>
                </div>
                <div>
                  <span className="me-2">Page {currentPage} of {numPages}</span>
                </div>
                <div>
                  <button 
                    className="btn btn-sm btn-outline-secondary me-2" 
                    onClick={zoomOut}
                  >
                    -
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-secondary" 
                    onClick={zoomIn}
                  >
                    +
                  </button>
                </div>
              </div>
              <div 
                className="d-flex justify-content-center align-items-center bg-light"
                style={{ 
                  height: isMobile ? '70vh' : '80vh',
                  overflow: 'auto'
                }}
              >
                <canvas 
                  ref={canvasRef} 
                  style={{ maxWidth: '100%' }}
                />
              </div>
            </>
          )}
        </div>

        <div className="card-footer text-center">
          <small className="text-muted">
            &copy; {new Date().getFullYear()} ARN Education - All rights reserved.
          </small>
        </div>
      </div>
    </div>
  );
}