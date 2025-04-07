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
          zoom(isMobile ? 1 : 1.5); // Adjust zoom based on device type
        },
        onExitFullScreen: (zoom) => {
          zoom(isMobile ? 1 : 1.5); // Maintain appropriate zoom when exiting full screen
        },
      },
    },
    // Disable all plugins that might allow downloading or printing
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
          // Include additional button slots that should be removed
          ...otherSlots
        } = slots;
        
        // Filter out any upload/download related buttons that might be in otherSlots
        const filteredSlots = {};
        Object.keys(otherSlots).forEach(slotKey => {
          // Skip any slots with names containing these terms
          if (!['download', 'print', 'save', 'open', 'upload'].some(term => 
            slotKey.toLowerCase().includes(term)
          )) {
            filteredSlots[slotKey] = otherSlots[slotKey];
          }
        });

        return renderDefaultToolbar({
          ...filteredSlots,
          // Explicitly empty these slots
          Download: () => <></>,
          Print: () => <></>,
          Open: () => <></>,
          Save: () => <></>,
          // Any other slots we want to remove but weren't caught above
        });
      }}
    </Toolbar>
  );

  useEffect(() => {
    const fetchPdfContent = async () => {
      try {
        setLoading(true);

        if (!syllabusFilePath) {
          throw new Error('No syllabus path provided');
        }

        // Encode the file path for use in URL
        const encodedPath = encodeURIComponent(syllabusFilePath);
        
        // First, try to get the file metadata
        let fileName = 'syllabus.pdf'; // Default filename
        
        try {
          // Fetch metadata separately with robust error handling
          const metadataResponse = await fetch(`${API_BASE_URL}/get-syllabus-url/${encodedPath}`);
          
          if (metadataResponse.ok) {
            // Check if the response is JSON
            const contentType = metadataResponse.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const metadata = await metadataResponse.json();
              if (metadata.fileName) {
                fileName = metadata.fileName;
                setFileName(fileName);
              }
            } else {
              console.warn('Metadata response was not JSON:', contentType);
            }
          } else {
            console.warn('Failed to get metadata, using default filename');
          }
        } catch (metadataError) {
          console.warn('Error fetching metadata:', metadataError);
          // Continue with default filename
        }
        
        // Direct approach - fetch the PDF content directly with proper error handling
        const pdfResponse = await fetch(`${API_BASE_URL}/proxy-pdf-content/${encodedPath}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/pdf',
          },
        });
        
        // Check for HTTP errors
        if (!pdfResponse.ok) {
          // Try to parse error response
          const contentType = pdfResponse.headers.get('content-type');
          
          if (contentType && contentType.includes('application/json')) {
            const errorData = await pdfResponse.json();
            throw new Error(errorData.message || `Server error: ${pdfResponse.status}`);
          } else {
            throw new Error(`Failed to retrieve PDF content: ${pdfResponse.status} ${pdfResponse.statusText}`);
          }
        }
        
        // Check that we actually got a PDF
        const contentType = pdfResponse.headers.get('content-type');
        if (!contentType || !contentType.includes('application/pdf')) {
          console.warn('Invalid content type received:', contentType);
          // Try to handle the response anyway
        }
        
        // Convert the response to a blob
        const pdfBlob = await pdfResponse.blob();
        
        // Verify we have actual content
        if (pdfBlob.size === 0) {
          throw new Error('Received empty PDF content');
        }
        
        // Create a blob URL from the blob
        const pdfBlobUrl = URL.createObjectURL(pdfBlob);
        
        // Set the blob URL as our PDF data source
        setPdfData(pdfBlobUrl);
        setLoading(false);
      } catch (err) {
        console.error('PDF fetching error:', err);
        setError(err.message || 'Failed to load syllabus. Please try again.');
        setLoading(false);
      }
    };

    fetchPdfContent();

    // More robust context menu handler
    const handleContextMenu = (e) => {
      if (e && e.preventDefault) {
        e.preventDefault();
      }
      return false;
    };

    // More robust keydown handler
    const handleKeyDown = (e) => {
      if (!e) return;
      
      // Disable Ctrl+C, Ctrl+A, Ctrl+S, Ctrl+P, etc.
      if ((e.ctrlKey || e.metaKey) && e.preventDefault) {
        e.preventDefault();
      }
      
      // Disable F12 (dev tools), Print Screen, etc.
      if ([112, 123, 44].includes(e.keyCode) && e.preventDefault) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    // Additional security: Remove buttons by CSS after render
    const removeButtonsByCSS = () => {
      setTimeout(() => {
        // Target buttons by their common attributes
        const downloadButtons = document.querySelectorAll('[data-testid*="download"], [aria-label*="download"], [title*="download"], [aria-label*="print"], [title*="print"], [aria-label*="save"], [title*="save"]');
        downloadButtons.forEach(button => {
          if (button && button.style) {
            button.style.display = 'none';
          }
        });
      }, 500);
    };

    // Call initially and whenever the component updates
    removeButtonsByCSS();
    
    // Add a MutationObserver to handle dynamically added buttons
    const observer = new MutationObserver(removeButtonsByCSS);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      observer.disconnect();
      
      // Clean up the blob URL to avoid memory leaks
      if (pdfData) {
        URL.revokeObjectURL(pdfData);
      }
    };
  }, [syllabusFilePath]);

  // Custom CSS to inject for hiding buttons
  useEffect(() => {
    // Create a style element
    const style = document.createElement('style');
    // Define CSS to hide download/print buttons
    style.textContent = `
      [data-testid*="download"], [aria-label*="download"], [title*="download"],
      [data-testid*="print"], [aria-label*="print"], [title*="print"],
      [data-testid*="save"], [aria-label*="save"], [title*="save"],
      [data-testid*="open"], [aria-label*="open"], [title*="open"],
      [data-testid*="upload"], [aria-label*="upload"], [title*="upload"] {
        display: none !important;
      }
    `;
    // Append to document head
    document.head.appendChild(style);
    
    // Cleanup
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleError = (error) => {
    console.error('PDF viewer error:', error);
    setError('Error displaying PDF. Please try again later.');
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
    // Include student name in watermark if available
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
        fontSize: isMobile ? '24px' : '48px', // Smaller font on mobile
        color: '#000000',
        fontWeight: 'bold'
      }}>
        {watermarkText}
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
                  defaultScale={isMobile ? SpecialZoomLevel.PageFit : 1.5} // PageFit for mobile, 150% for desktop
                  initialPage={0}
                  textSelectionEnabled={false}
                />
              </Worker>
            </div>
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