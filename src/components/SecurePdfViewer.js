import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import API_BASE_URL from './ApiConifg';
import { SpecialZoomLevel } from '@react-pdf-viewer/core';

export default function SecurePdfViewer({ syllabusFilePath }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);
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

  // Completely remove all unwanted buttons from toolbar (more comprehensive approach)
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

  // In your React component's useEffect where you set the PDF URL:
  useEffect(() => {
    const setPdfProxyUrl = async () => {
      try {
        setLoading(true);

        if (!syllabusFilePath) {
          throw new Error('No syllabus path provided');
        }

        const encodedPath = encodeURIComponent(syllabusFilePath);
        const proxyUrl = `${API_BASE_URL}/proxy-pdf/${encodedPath}`;

        console.log('Using proxy URL for PDF:', proxyUrl);

        // Use arraybuffer to get binary data exactly as sent
        const response = await fetch(proxyUrl, {
          method: 'GET',
          cache: 'no-cache', // Force fresh request
          credentials: 'include', // Include cookies if needed
          headers: {
            'Accept': 'application/pdf',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Get the data as ArrayBuffer to prevent text encoding issues
        const arrayBuffer = await response.arrayBuffer();

        // Convert to blob with explicit PDF mime type
        const blob = new Blob([arrayBuffer], { type: 'application/pdf' });

        // Create object URL from blob
        const blobUrl = URL.createObjectURL(blob);
        setPdfUrl(blobUrl);
        setLoading(false);
      } catch (err) {
        console.error('PDF setup error:', err);
        setError(`Failed to load syllabus: ${err.message}`);
        setLoading(false);
      }
    };

    setPdfProxyUrl();

    // Clean up blob URL when component unmounts
    return () => {
      if (pdfUrl && pdfUrl.startsWith('blob:')) {
        URL.revokeObjectURL(pdfUrl);
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

  // Custom watermark component
  const Watermark = () => (
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
      ARN Private Exam Conduct
    </div>
  );

  // Custom toolbar component to completely replace the default one
  const CustomToolbar = () => (
    <div className="toolbar bg-light border-bottom p-1 d-flex justify-content-center align-items-center">
      <div className="d-flex gap-2">
        {/* Zoom controls */}
        <button className="btn btn-sm btn-outline-secondary">-</button>
        <div className="d-flex align-items-center">
          <span className="px-2">{isMobile ? 'Fit' : '150%'}</span>
        </div>
        <button className="btn btn-sm btn-outline-secondary">+</button>

        {/* Page navigation */}
        <div className="d-flex align-items-center mx-3">
          <button className="btn btn-sm btn-outline-secondary me-2">&lt;</button>
          <span>Page <input type="text" className="form-control form-control-sm" style={{ width: '40px' }} /> of </span>
          <button className="btn btn-sm btn-outline-secondary ms-2">&gt;</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid mt-2 mt-md-4">
      <div className="card shadow">
        <div className="card-header bg-dark text-white text-center">
          <h2 className={isMobile ? "fs-4" : "fs-2"}>Syllabus Viewer</h2>
        </div>

        <div className="card-body p-1 p-md-3 text-center">
          {loading ? (
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : pdfUrl ? (
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
                  fileUrl={pdfUrl}
                  plugins={[defaultLayoutPluginInstance]}
                  onError={(error) => {
                    console.error('PDF loading error:', error);
                    setError('Error displaying PDF. Please try refreshing the page.');
                  }}
                  withCredentials={true}
                  defaultScale={isMobile ? SpecialZoomLevel.PageFit : 1.5}
                  initialPage={0}
                  renderError={(renderError) => {
                    console.error('PDF render error:', renderError);
                    return (
                      <div className="alert alert-danger">
                        Error rendering PDF. Please try again with a different browser.
                      </div>
                    );
                  }}
                  textSelectionEnabled={false}
                  workerParams={{
                    isEvalSupported: true,
                    isOffscreenCanvasSupported: true
                  }}
                />
              </Worker>
            </div>
          ) : (
            <div className="alert alert-warning">No PDF available</div>
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