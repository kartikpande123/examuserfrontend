import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Worker, Viewer, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import API_BASE_URL from './ApiConifg';

export default function SecurePdfViewer({ syllabusFilePath }) {
  const [pdfBlob, setPdfBlob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const viewerRef = useRef(null);

  // Detect mobile view
  useEffect(() => {
    const updateDevice = () => setIsMobile(window.innerWidth < 768);
    updateDevice();
    window.addEventListener('resize', updateDevice);
    return () => window.removeEventListener('resize', updateDevice);
  }, []);

  // Plugin config
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    toolbarPlugin: {
      fullScreenPlugin: {
        onEnterFullScreen: (zoom) => zoom(isMobile ? 1 : 1.5),
        onExitFullScreen: (zoom) => zoom(isMobile ? 1 : 1.5),
      },
    },
  });

  // Remove unwanted toolbar buttons
  const { renderDefaultToolbar } = defaultLayoutPluginInstance.toolbarPluginInstance;
  defaultLayoutPluginInstance.toolbarPluginInstance.renderToolbar = (Toolbar) => (
    <Toolbar>
      {(slots) => {
        const filteredSlots = {};
        Object.keys(slots).forEach((key) => {
          if (!['download', 'print', 'save', 'open', 'upload'].some(term =>
            key.toLowerCase().includes(term)
          )) {
            filteredSlots[key] = slots[key];
          }
        });

        return renderDefaultToolbar({
          ...filteredSlots,
          Download: () => <></>,
          Print: () => <></>,
          Save: () => <></>,
          Open: () => <></>,
        });
      }}
    </Toolbar>
  );

  // Fetch PDF as blob
  useEffect(() => {
    const fetchPdfBlob = async () => {
      setLoading(true);
      if (!syllabusFilePath) {
        setError('No file path provided');
        setLoading(false);
        return;
      }

      try {
        const encoded = encodeURIComponent(syllabusFilePath);
        const response = await fetch(`${API_BASE_URL}/proxy-pdf/${encoded}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        
        const blob = await response.blob();
        const pdfObjectUrl = URL.createObjectURL(blob);
        setPdfBlob(pdfObjectUrl);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching PDF:', err);
        setError('Failed to load the PDF file');
        setLoading(false);
      }
    };

    fetchPdfBlob();
    
    // Clean up object URL when component unmounts
    return () => {
      if (pdfBlob) {
        URL.revokeObjectURL(pdfBlob);
      }
    };
  }, [syllabusFilePath]);

  // Disable keyboard shortcuts & right-click
  useEffect(() => {
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
  }, []);

  // Inject custom CSS to hide download/print buttons
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
    return () => document.head.removeChild(style);
  }, []);

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
      opacity: 0.1,
      transform: 'rotate(-30deg)',
      fontSize: isMobile ? '20px' : '40px',
      color: '#000',
      fontWeight: 'bold',
    }}>
      ARN Private Exam Conduct
    </div>
  );

  const handleError = (e) => {
    console.error('PDF error:', e);
    setError('Unable to load PDF');
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
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : (
            <div
              ref={viewerRef}
              className="rpv-core__viewer"
              style={{
                height: isMobile ? '75vh' : '85vh',
                position: 'relative',
                overflow: 'hidden',
                width: '100%',
              }}
            >
              <Watermark />
              <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                <Viewer
                  fileUrl={pdfBlob}
                  plugins={[defaultLayoutPluginInstance]}
                  onError={handleError}
                  defaultScale={isMobile ? SpecialZoomLevel.PageFit : 1.5}
                  initialPage={0}
                  textSelectionEnabled={false}
                />
              </Worker>
            </div>
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