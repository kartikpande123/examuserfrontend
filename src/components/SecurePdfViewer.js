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
      // Completely disable these features at plugin level
      downloadPlugin: {
        enableShortcutKey: false,
        enableDownload: false,
      },
      printPlugin: {
        enableShortcutKey: false,
        enablePrint: false,
      },
    },
    // Disable all plugins that might allow downloading or printing
    sidebarPlugin: {
      thumbnailPlugin: {
        enableDragAndDrop: false,
      },
    },
  });

  // Completely overriding the toolbar to remove unwanted buttons
  const { renderDefaultToolbar } = defaultLayoutPluginInstance.toolbarPluginInstance;
  defaultLayoutPluginInstance.toolbarPluginInstance.renderToolbar = (Toolbar) => (
    <Toolbar>
      {(slots) => {
        // Only keep the specific slots we want to allow
        const allowedSlots = [
          'CurrentPageInput',
          'GoToNextPage',
          'GoToPreviousPage',
          'NumberOfPages',
          'ShowSearchPopover',
          'Zoom',
          'ZoomIn',
          'ZoomOut',
          'EnterFullScreen',
          'SwitchViewMode',
        ];
        
        // Create a new slots object with only the allowed slots
        const safeSlots = {};
        
        allowedSlots.forEach(slotName => {
          if (slots[slotName]) {
            safeSlots[slotName] = slots[slotName];
          }
        });
        
        return renderDefaultToolbar(safeSlots);
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

    // Prevent context menu (right-click)
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // Block keyboard shortcuts for printing, saving, etc.
    const handleKeyDown = (e) => {
      // Block Ctrl/Cmd + P (print)
      // Block Ctrl/Cmd + S (save)
      // Block Ctrl/Cmd + Shift + S (save as)
      // Block Ctrl/Cmd + C (copy)
      // Block F12 (developer tools)
      if (
        ((e.ctrlKey || e.metaKey) && 
          (e.key === 'p' || e.key === 's' || e.key === 'c' || 
          (e.shiftKey && e.key === 'S'))
        ) || 
        e.key === 'F12' || 
        e.key === 'PrintScreen'
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Apply event listeners
    document.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('keydown', handleKeyDown, true);
    
    // Use MutationObserver to continuously remove unwanted buttons
    const removeUnwantedButtons = () => {
      const selectors = [
        '[data-testid*="download"]',
        '[aria-label*="download"]',
        '[title*="download"]',
        '[data-testid*="print"]',
        '[aria-label*="print"]',
        '[title*="print"]',
        '[data-testid*="save"]',
        '[aria-label*="save"]',
        '[title*="save"]',
        '[data-testid*="open"]',
        '[aria-label*="open"]',
        '[title*="open"]',
        '[data-testid*="upload"]',
        '[aria-label*="upload"]',
        '[title*="upload"]',
        '.rpv-core__text-layer', // Prevent text selection
        'button:contains("Download")',
        'button:contains("Print")',
        'button:contains("Save")',
        'button:contains("Open")'
      ];
      
      selectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            if (el && el.parentNode) {
              el.parentNode.removeChild(el);
            }
          });
        } catch (e) {
          // Silent fail - some selectors might not be valid
        }
      });
    };

    // Run initially
    removeUnwantedButtons();
    
    // Set up observer for dynamically loaded elements
    const observer = new MutationObserver(() => {
      removeUnwantedButtons();
    });
    
    observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'id']
    });

    // Anti-iframe protection - prevent embedding in other sites
    if (window.self !== window.top) {
      document.body.innerHTML = 'Access denied';
    }

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('keydown', handleKeyDown, true);
      observer.disconnect();
    };
  }, [selectedSyllabus]);

  // Additional CSS to block UI elements
  useEffect(() => {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `
      /* Hide all download/print/save buttons */
      [data-testid*="download"],
      [aria-label*="download"],
      [title*="download"],
      [data-testid*="print"],
      [aria-label*="print"],
      [title*="print"],
      [data-testid*="save"],
      [aria-label*="save"],
      [title*="save"],
      [data-testid*="open"],
      [aria-label*="open"],
      [title*="open"],
      [data-testid*="upload"],
      [aria-label*="upload"],
      [title*="upload"],
      button[aria-label*="download"],
      button[aria-label*="print"],
      button[aria-label*="save"],
      button[aria-label*="open"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        position: absolute !important;
        top: -9999px !important;
        left: -9999px !important;
        width: 0 !important;
        height: 0 !important;
        overflow: hidden !important;
        z-index: -1 !important;
      }
      
      /* Disable text selection */
      .rpv-core__text-layer {
        pointer-events: none !important;
        user-select: none !important;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
      }
      
      /* Prevent cursor from showing select behavior */
      .rpv-core__viewer {
        cursor: default !important;
      }
      
      /* Make elements unselectable */
      .rpv-core__viewer * {
        user-select: none !important;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
      }
    `;
    document.head.appendChild(style);
    
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
              className="rpv-core__viewer no-select"
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
                  canvasList={{
                    onRenderSuccess: () => {
                      // Add additional canvas protection
                      const canvases = document.querySelectorAll('.rpv-core__canvas-layer canvas');
                      canvases.forEach(canvas => {
                        canvas.style.pointerEvents = 'none';
                        canvas.setAttribute('aria-readonly', 'true');
                      });
                    }
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
            © {new Date().getFullYear()} ARN Education - All rights reserved. This document is for {studentName}'s use only.
          </small>
        </div>
      </div>
    </div>
  );
}