import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import API_BASE_URL from './ApiConifg';
import { SpecialZoomLevel } from '@react-pdf-viewer/core';

export default function SecurePdfViewer({ selectedSyllabus, studentName }) {
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

  // Completely remove all unwanted buttons from toolbar including "Back to Syllabus" button
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
          GoBack, // Explicitly removing any GoBack or back button option
          GoTo,   // Sometimes used for navigation back
          // Include additional button slots that should be removed
          ...otherSlots
        } = slots;
        
        // Filter out any upload/download related buttons and back buttons
        const filteredSlots = {};
        Object.keys(otherSlots).forEach(slotKey => {
          // Skip any slots with these terms
          if (!['download', 'print', 'save', 'open', 'upload', 'back', 'previous', 'return'].some(term => 
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
          GoBack: () => <></>, // Empty the back button slot
          GoTo: () => <></>,   // Empty navigation slot that might be used for back functionality
          // Any other slots we want to remove but weren't caught above
        });
      }}
    </Toolbar>
  );

  useEffect(() => {
    const fetchSyllabus = async () => {
      try {
        setLoading(true);

        if (!selectedSyllabus) {
          throw new Error('No syllabus selected');
        }

        // Fetch all syllabi using the new API endpoint
        const response = await fetch(`${API_BASE_URL}/api/pdf-syllabi`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch syllabi: ${response.status}`);
        }
        
        const allSyllabi = await response.json();
        
        // Find the selected syllabus in the data
        let foundSyllabus = null;
        
        // Look through all categories to find the matching syllabus
        Object.keys(allSyllabi).forEach(category => {
          Object.keys(allSyllabi[category]).forEach(title => {
            // Match by title and category (adjust this based on how you identify syllabi)
            if (
              title === selectedSyllabus.syllabusTitle && 
              category === selectedSyllabus.syllabusCategory
            ) {
              foundSyllabus = allSyllabi[category][title];
            }
          });
        });
        
        if (!foundSyllabus) {
          throw new Error('Selected syllabus not found in available syllabi');
        }
        
        if (foundSyllabus.fileError) {
          throw new Error('This syllabus file is currently unavailable');
        }
        
        // Use the fileUrl from the found syllabus
        setPdfUrl(foundSyllabus.fileUrl);
        
        setLoading(false);
      } catch (err) {
        console.error('PDF setup error:', err);
        setError(err.message || 'Failed to load syllabus. Please try again.');
        setLoading(false);
      }
    };

    fetchSyllabus();

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
        const buttonsToRemove = document.querySelectorAll(
          '[data-testid*="download"], [aria-label*="download"], [title*="download"], ' +
          '[aria-label*="print"], [title*="print"], [aria-label*="save"], [title*="save"], ' +
          '[data-testid*="back"], [aria-label*="back"], [title*="back"], ' + // Target back buttons
          '[data-testid*="return"], [aria-label*="return"], [title*="return"]' // Target return buttons
        );
        buttonsToRemove.forEach(button => {
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
    };
  }, [selectedSyllabus]);

  // Custom CSS to inject for hiding buttons
  useEffect(() => {
    // Create a style element
    const style = document.createElement('style');
    // Define CSS to hide download/print buttons and back buttons
    style.textContent = `
      [data-testid*="download"], [aria-label*="download"], [title*="download"],
      [data-testid*="print"], [aria-label*="print"], [title*="print"],
      [data-testid*="save"], [aria-label*="save"], [title*="save"],
      [data-testid*="open"], [aria-label*="open"], [title*="open"],
      [data-testid*="upload"], [aria-label*="upload"], [title*="upload"],
      [data-testid*="back"], [aria-label*="back"], [title*="back"],
      [data-testid*="return"], [aria-label*="return"], [title*="return"],
      button:contains("Back"), button:contains("Return"), a:contains("Back"), a:contains("Return") {
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

  // Custom watermark component with student name
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
      ARN Private Exam - {studentName}
    </div>
  );

  return (
    <div className="container-fluid mt-2 mt-md-4">
      <div className="card shadow">
        <div className="card-header bg-dark text-white text-center">
          <h2 className={isMobile ? "fs-4" : "fs-2"}>
            {selectedSyllabus ? selectedSyllabus.syllabusTitle : 'Syllabus Viewer'}
          </h2>
          {selectedSyllabus && (
            <p className="mb-0 text-light">
              {selectedSyllabus.syllabusCategory}
            </p>
          )}
        </div>

        <div className="card-body p-1 p-md-3 text-center">
          {loading ? (
            <div className="d-flex flex-column align-items-center justify-content-center py-5">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p>Loading your secure syllabus...</p>
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
                  onError={handleError}
                  defaultScale={isMobile ? SpecialZoomLevel.PageFit : 1.5} // PageFit for mobile, 150% for desktop
                  initialPage={0}
                  textSelectionEnabled={false}
                />
              </Worker>
            </div>
          ) : (
            <div className="alert alert-warning">No PDF available</div>
          )}
        </div>

        <div className="card-footer text-center">
          <small className="text-muted">
            © {new Date().getFullYear()} ARN Education - All rights reserved. This document is for {studentName}'s use only.
          </small>
        </div>
      </div>
    </div>
  );
}