import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import API_BASE_URL from './ApiConifg';
import { SpecialZoomLevel } from '@react-pdf-viewer/core';

export default function SecurePdfViewer({ syllabusFilePath, studentName }) {
  const [pdfData, setPdfData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [fileName, setFileName] = useState('');
  const viewerRef = useRef(null);
  const [debugInfo, setDebugInfo] = useState(null);

  // Check if the device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Listen for window resize events
    window.addEventListener('resize', checkIfMobile);

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // PDF Viewer Plugin with completely disabled download, print, and related options
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    toolbarPlugin: {
      fullScreenPlugin: {
        onEnterFullScreen: (zoom) => {
          zoom(isMobile ? 1 : 1.5);
        },
        onExitFullScreen: (zoom) => {
          zoom(isMobile ? 1 : 1.5);
        },
      },
    },
    sidebarPlugin: {
      thumbnailPlugin: {
        enableDragAndDrop: false,
      },
    },
  });

  // Completely remove all unwanted buttons from toolbar
  const { renderDefaultToolbar } = defaultLayoutPluginInstance.toolbarPluginInstance;
  defaultLayoutPluginInstance.toolbarPluginInstance.renderToolbar = (Toolbar) => (
    <Toolbar>
      {(slots) => {
        const {
          Download,
          Print,
          Open,
          Save,
          SwitchTheme,
          ...otherSlots
        } = slots;
        
        const filteredSlots = {};
        Object.keys(otherSlots).forEach(slotKey => {
          if (!['download', 'print', 'save', 'open', 'upload'].some(term => 
            slotKey.toLowerCase().includes(term)
          )) {
            filteredSlots[slotKey] = otherSlots[slotKey];
          }
        });

        return renderDefaultToolbar({
          ...filteredSlots,
          Download: () => <></>,
          Print: () => <></>,
          Open: () => <></>,
          Save: () => <></>,
        });
      }}
    </Toolbar>
  );

  // Helper function to check if the blob is a valid PDF
  const isPdfValid = async (blob) => {
    try {
      // Check if the blob has content
      if (!blob || blob.size === 0) {
        setDebugInfo('Blob is empty or null');
        return false;
      }
      
      // Attempt to read the first few bytes to check for PDF signature
      const arrayBuffer = await blob.slice(0, 5).arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const header = String.fromCharCode(...bytes);
      
      // PDF files start with %PDF-
      if (header !== '%PDF-') {
        setDebugInfo(`Invalid PDF header: ${JSON.stringify(Array.from(bytes))}`);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Error validating PDF:', err);
      setDebugInfo(`Validation error: ${err.message}`);
      return false;
    }
  };

  useEffect(() => {
    const fetchPdfContent = async () => {
      try {
        setLoading(true);
        setError('');
        setPdfData(null);
        setDebugInfo(null);

        if (!syllabusFilePath) {
          throw new Error('No syllabus path provided');
        }

        // Encode the file path for use in URL
        const encodedPath = encodeURIComponent(syllabusFilePath);
        
        // Default filename
        let fileName = 'syllabus.pdf';
        
        try {
          const metadataResponse = await fetch(`${API_BASE_URL}/get-syllabus-url/${encodedPath}`);
          
          if (metadataResponse.ok) {
            const contentType = metadataResponse.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const metadata = await metadataResponse.json();
              if (metadata.fileName) {
                fileName = metadata.fileName;
                setFileName(fileName);
              }
            }
          }
        } catch (metadataError) {
          console.warn('Error fetching metadata:', metadataError);
        }
        
        // Try direct PDF fetch with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        try {
          const pdfResponse = await fetch(`${API_BASE_URL}/proxy-pdf-content/${encodedPath}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/pdf',
              'Cache-Control': 'no-cache'
            },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (!pdfResponse.ok) {
            const contentType = pdfResponse.headers.get('content-type');
            setDebugInfo(`Response not OK: ${pdfResponse.status}, Content-Type: ${contentType}`);
            
            if (contentType && contentType.includes('application/json')) {
              const errorData = await pdfResponse.json();
              throw new Error(errorData.message || `Server error: ${pdfResponse.status}`);
            } else {
              throw new Error(`Failed to retrieve PDF: ${pdfResponse.status} ${pdfResponse.statusText}`);
            }
          }
          
          // Get content type and log it for debugging
          const contentType = pdfResponse.headers.get('content-type');
          setDebugInfo(`Content-Type: ${contentType}`);
          
          // Get the response as a blob
          const pdfBlob = await pdfResponse.blob();
          
          // Log blob size for debugging
          setDebugInfo(prev => `${prev || ''}, Blob size: ${pdfBlob.size} bytes`);
          
          // Validate the PDF structure
          const isValid = await isPdfValid(pdfBlob);
          if (!isValid) {
            throw new Error('Invalid PDF structure. The file may be corrupted or not a PDF.');
          }
          
          // Create a blob URL from the validated blob
          const pdfBlobUrl = URL.createObjectURL(pdfBlob);
          
          // Set the blob URL as our PDF data source
          setPdfData(pdfBlobUrl);
        } catch (fetchError) {
          clearTimeout(timeoutId);
          
          if (fetchError.name === 'AbortError') {
            throw new Error('Request timed out. Please try again.');
          }
          
          throw fetchError;
        }
        
        setLoading(false);
      } catch (err) {
        console.error('PDF fetching error:', err);
        setError(err.message || 'Failed to load syllabus. Please try again.');
        setLoading(false);
      }
    };

    fetchPdfContent();

    // Security event handlers and CSS
    const handleContextMenu = (e) => {
      if (e && e.preventDefault) {
        e.preventDefault();
      }
      return false;
    };

    const handleKeyDown = (e) => {
      if (!e) return;
      
      if ((e.ctrlKey || e.metaKey) && e.preventDefault) {
        e.preventDefault();
      }
      
      if ([112, 123, 44].includes(e.keyCode) && e.preventDefault) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    const removeButtonsByCSS = () => {
      setTimeout(() => {
        const downloadButtons = document.querySelectorAll('[data-testid*="download"], [aria-label*="download"], [title*="download"], [aria-label*="print"], [title*="print"], [aria-label*="save"], [title*="save"]');
        downloadButtons.forEach(button => {
          if (button && button.style) {
            button.style.display = 'none';
          }
        });
      }, 500);
    };

    removeButtonsByCSS();
    
    const observer = new MutationObserver(removeButtonsByCSS);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      observer.disconnect();
      
      if (pdfData) {
        URL.revokeObjectURL(pdfData);
      }
    };
  }, [syllabusFilePath]);

  // Custom CSS to inject for hiding buttons
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      [data-testid*="download"], [aria-label*="download"], [title*="download"],
      [data-testid*="print"], [aria-label*="print"], [title*="print"],
      [data-testid*="save"], [aria-label*="save"], [title*="save"],
      [data-testid*="open"], [aria-label*="open"], [title*="open"],
      [data-testid*="upload"], [aria-label*="upload"], [title*="upload"] {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleError = (error) => {
    console.error('PDF viewer error:', error);
    setError(`Error displaying PDF: ${error.message || 'Unknown error'}`);
  };

  // More informative fallback component
  const renderFallback = () => {
    if (loading) {
      return (
        <div className="d-flex flex-column align-items-center justify-content-center p-5">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <div>Loading syllabus...</div>
        </div>
      );
    } 
    
    if (error) {
      return (
        <div className="alert alert-danger">
          <h4>Unable to load syllabus</h4>
          <p>{error}</p>
          {debugInfo && (
            <div className="mt-2 p-2 bg-light text-dark text-start" style={{fontSize: '0.8rem'}}>
              <strong>Debug Info:</strong> {debugInfo}
            </div>
          )}
          <button 
            className="btn btn-primary mt-2" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      );
    }
    
    return (
      <div className="alert alert-warning">
        <h4>No PDF Available</h4>
        <p>The requested syllabus could not be found.</p>
      </div>
    );
  };

  // Custom watermark component
  const Watermark = () => {
    const watermarkText = `ARN Private Exam Conduct${studentName ? ` - ${studentName}` : ''}`;
    
    return (
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.12,
        transform: 'rotate(-20deg)',
        fontSize: isMobile ? '24px' : '48px',
        color: '#000000',
        fontWeight: 'bold'
      }}>
        {watermarkText}
      </div>
    );
  };

  // Try a different approach to render the PDF if we have data
  const renderPdfViewer = () => {
    if (!pdfData) return null;
    
    return (
      <div 
        style={{ 
          height: isMobile ? '70vh' : '80vh',
          position: 'relative',
          overflow: 'hidden',
          width: '100%'
        }}
        ref={viewerRef}
        className="rpv-core__viewer"
      >
        <Watermark />
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Viewer
            fileUrl={pdfData}
            plugins={[defaultLayoutPluginInstance]}
            onError={handleError}
            defaultScale={isMobile ? SpecialZoomLevel.PageFit : 1.5}
            initialPage={0}
            textSelectionEnabled={false}
          />
        </Worker>
      </div>
    );
  };

  return (
    <div className="container-fluid mt-2 mt-md-4">
      <div className="card shadow">
        <div className="card-header bg-dark text-white text-center d-flex justify-content-center align-items-center">
          <h2 className={isMobile ? "fs-4 mb-0" : "fs-2 mb-0"}>
            {fileName ? fileName : 'Syllabus Viewer'}
          </h2>
        </div>

        <div className="card-body p-1 p-md-3 text-center">
          {loading || error || !pdfData ? (
            renderFallback()
          ) : (
            renderPdfViewer()
          )}
        </div>

        <div className="card-footer text-center">
          <small className="text-muted">
            © {new Date().getFullYear()} ARN Education - All rights reserved.
          </small>
        </div>
      </div>
    </div>
  );
}