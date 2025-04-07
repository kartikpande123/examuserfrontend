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
  const [debugInfo, setDebugInfo] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const viewerRef = useRef(null);

  // Check if the device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // PDF Viewer Plugin
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

  // Remove unwanted buttons from toolbar
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

  const fetchPdfContent = async (tryDirectFetch = false) => {
    try {
      setLoading(true);
      setError('');
      setPdfData(null);
      setDebugInfo(null);

      if (!syllabusFilePath) {
        throw new Error('No syllabus path provided');
      }

      // Encode the file path for URL
      const encodedPath = encodeURIComponent(syllabusFilePath);
      
      // Try to get metadata first
      let fileName = 'syllabus.pdf'; // Default name
      
      try {
        const metadataUrl = `${API_BASE_URL}/get-syllabus-url/${encodedPath}`;
        console.log('Fetching metadata from:', metadataUrl);
        
        const metadataResponse = await fetch(metadataUrl, {
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (metadataResponse.ok) {
          const contentType = metadataResponse.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const metadata = await metadataResponse.json();
            if (metadata.fileName) {
              fileName = metadata.fileName;
              setFileName(fileName);
            }
            
            // If there's a direct URL in the metadata, try using that
            if (metadata.url && !tryDirectFetch) {
              console.log('Using direct URL from metadata:', metadata.url);
              const directResponse = await fetch(metadata.url, {
                method: 'GET',
                headers: {
                  'Accept': 'application/pdf',
                  'Cache-Control': 'no-cache'
                }
              });
              
              if (directResponse.ok) {
                const contentType = directResponse.headers.get('content-type');
                if (contentType && contentType.includes('application/pdf')) {
                  const pdfBlob = await directResponse.blob();
                  if (pdfBlob.size > 0) {
                    const pdfBlobUrl = URL.createObjectURL(pdfBlob);
                    setPdfData(pdfBlobUrl);
                    setLoading(false);
                    return;
                  }
                }
              }
            }
          }
        }
      } catch (metadataError) {
        console.warn('Error fetching metadata:', metadataError);
      }
      
      // If we get here, try the proxy endpoint with bypass parameter
      const bypassCache = new Date().getTime(); // Cache buster
      const pdfUrl = `${API_BASE_URL}/proxy-pdf-content/${encodedPath}?bypass=${bypassCache}`;
      console.log('Fetching PDF from:', pdfUrl);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      try {
        const pdfResponse = await fetch(pdfUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/pdf',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        const contentType = pdfResponse.headers.get('content-type');
        console.log('Response content type:', contentType);
        
        // Check if we got an error response
        if (!pdfResponse.ok) {
          setDebugInfo(`Response not OK: ${pdfResponse.status}, Content-Type: ${contentType}`);
          
          if (contentType && contentType.includes('application/json')) {
            const errorData = await pdfResponse.json();
            throw new Error(errorData.message || `Server error: ${pdfResponse.status}`);
          } else {
            throw new Error(`Server error: ${pdfResponse.status} ${pdfResponse.statusText}`);
          }
        }
        
        // Check if we got a PDF
        if (!contentType || !contentType.includes('application/pdf')) {
          // We might have received HTML or another format instead of PDF
          setDebugInfo(`Unexpected content type: ${contentType}`);
          
          // Try to detect HTML
          const text = await pdfResponse.text();
          if (text.includes('<!DOCTYPE html>') || text.includes('<html') || text.startsWith('<!doc')) {
            setDebugInfo(`Received HTML instead of PDF: ${text.substring(0, 100)}...`);
            throw new Error('Server returned HTML instead of PDF. The server might be experiencing issues.');
          } else {
            throw new Error(`Invalid response content type: ${contentType || 'unknown'}`);
          }
        }
        
        // Get the response as a blob
        const pdfBlob = await pdfResponse.blob();
        console.log(`Received blob of size: ${pdfBlob.size} bytes`);
        
        // Validate blob size
        if (pdfBlob.size === 0) {
          throw new Error('Received empty PDF content');
        }
        
        // Check PDF header
        const arrayBuffer = await pdfBlob.slice(0, 5).arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        const header = String.fromCharCode(...bytes);
        
        if (header !== '%PDF-') {
          const bytesArray = Array.from(bytes);
          setDebugInfo(`Invalid PDF header: [${bytesArray.join(',')}]`);
          throw new Error('Invalid PDF structure. The file may be corrupted or not a PDF.');
        }
        
        // Create a blob URL from the validated blob
        const pdfBlobUrl = URL.createObjectURL(pdfBlob);
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

  // Initial fetch on component mount
  useEffect(() => {
    fetchPdfContent();
    
    // Security event handlers
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

    // Hide download buttons
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
  }, [syllabusFilePath, retryCount]);

  // Custom CSS to hide buttons
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

  // Handle retry with different approach
  const handleRetry = () => {
    setRetryCount(count => count + 1);
    // Try direct fetch if we already tried proxy
    fetchPdfContent(retryCount > 0);
  };

  // Fallback component
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
            className="btn btn-primary mt-3" 
            onClick={handleRetry}
          >
            {retryCount > 0 ? "Try Alternative Method" : "Try Again"}
          </button>
          <div className="mt-3">
            <a 
              href={`${API_BASE_URL}/direct-download/${encodeURIComponent(syllabusFilePath)}`} 
              className="btn btn-outline-secondary"
              target="_blank" 
              rel="noopener noreferrer"
            >
              Open in New Tab
            </a>
          </div>
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

  // PDF viewer component
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