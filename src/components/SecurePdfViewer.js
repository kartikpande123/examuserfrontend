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
  const [retryCount, setRetryCount] = useState(0);
  const viewerRef = useRef(null);
  const observerRef = useRef(null);
  
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
          zoom(isMobile ? SpecialZoomLevel.PageFit : 1.5);
        },
        onExitFullScreen: (zoom) => {
          zoom(isMobile ? SpecialZoomLevel.PageFit : 1.5);
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

  // Security event listeners and CSS protection
  useEffect(() => {
    // Apply CSS hiding for better security
    const styleElement = document.createElement('style');
    styleElement.type = 'text/css';
    styleElement.innerHTML = `
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
        pointer-events: none !important;
      }
      
      /* Disable text selection */
      .rpv-core__text-layer {
        pointer-events: none !important;
        user-select: none !important;
        -webkit-user-select: none !important;
      }
      
      /* Prevent cursor from showing select behavior */
      .rpv-core__viewer {
        cursor: default !important;
      }
      
      /* Make elements unselectable */
      .rpv-core__viewer * {
        user-select: none !important;
        -webkit-user-select: none !important;
      }
      
      /* Mobile optimization */
      @media (max-width: 767px) {
        .rpv-core__viewer canvas {
          width: 100% !important;
          height: auto !important;
          max-width: 100vw !important;
        }
        
        .rpv-core__minimal-button {
          padding: 8px !important;
        }
      }
    `;
    document.head.appendChild(styleElement);

    // Prevent context menu (right-click)
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // Block keyboard shortcuts for printing, saving, etc.
    const handleKeyDown = (e) => {
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

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('keydown', handleKeyDown, true);

    // Use a safer approach to hide unwanted buttons
    const safeRemoveElements = () => {
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
        '[title*="upload"]'
      ];
      
      selectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            // Instead of removing, hide with style (safer for DOM operations)
            if (el) {
              el.style.display = 'none';
              el.style.visibility = 'hidden';
              el.style.opacity = '0';
              el.style.pointerEvents = 'none';
              el.setAttribute('aria-hidden', 'true');
              el.classList.add('hidden-secure-element');
            }
          });
        } catch (e) {
          // Silent fail for selector issues
        }
      });
    };

    // Initial removal
    safeRemoveElements();
    
    // Set up a safer observer that doesn't cause DOM conflicts
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    observerRef.current = new MutationObserver(() => {
      // Use requestAnimationFrame to avoid blocking the main thread
      requestAnimationFrame(() => {
        safeRemoveElements();
      });
    });
    
    // Start observing with a more focused approach
    observerRef.current.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: false // Reduce processing load
    });

    // Anti-iframe protection
    if (window.self !== window.top) {
      document.body.innerHTML = 'Access denied';
    }

    // Cleanup function
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('keydown', handleKeyDown, true);
      
      // Safely disconnect observer
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      
      // Remove the style element
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);

  // Fetch syllabus data
  useEffect(() => {
    const fetchSyllabus = async () => {
      try {
        setLoading(true);
        setError('');

        if (!selectedSyllabus) {
          throw new Error('No syllabus selected');
        }

        // Fetch all syllabi
        const response = await fetch(`${API_BASE_URL}/api/pdf-syllabi`, {
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch syllabi: ${response.status}`);
        }
        
        const allSyllabi = await response.json();
        
        // Find the selected syllabus
        let foundSyllabus = null;
        
        Object.keys(allSyllabi).forEach(category => {
          Object.keys(allSyllabi[category]).forEach(title => {
            if (
              title === selectedSyllabus.syllabusTitle && 
              category === selectedSyllabus.syllabusCategory
            ) {
              foundSyllabus = allSyllabi[category][title];
            }
          });
        });
        
        if (!foundSyllabus) {
          throw new Error('Selected syllabus not found');
        }
        
        if (foundSyllabus.fileError) {
          throw new Error('This syllabus file is currently unavailable');
        }
        
        // Important: DO NOT add query parameters to Firebase Storage URLs
        // They already have authentication tokens that mustn't be modified
        setPdfUrl(foundSyllabus.fileUrl);
        
        setLoading(false);
      } catch (err) {
        console.error('PDF setup error:', err);
        setError(err.message || 'Failed to load syllabus');
        setLoading(false);
      }
    };

    fetchSyllabus();
  }, [selectedSyllabus, retryCount]);

  const handleViewerError = (error) => {
    console.error('PDF viewer error:', error);
    
    // If we're on mobile and haven't retried yet, try once more
    if (isMobile && retryCount < 2) {
      setError('Retrying to load the document...');
      // Increment retry count to trigger useEffect
      setRetryCount(prevCount => prevCount + 1);
      setTimeout(() => {
        // This forces a refresh of the viewer with a delay
        setPdfUrl(null);
        setTimeout(() => {
          // Re-fetch the syllabus data
          setLoading(true);
        }, 500);
      }, 1000);
    } else {
      setError('Error displaying PDF. Please try again or switch to desktop mode.');
    }
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
      fontSize: isMobile ? '24px' : '48px',
      color: '#000000',
      fontWeight: 'bold'
    }}>
      ARN Private Exam - {studentName}
    </div>
  );

  // Alternate mobile view component as a backup option
  const MobileBackupView = () => (
    <div className="alert alert-warning">
      <h4>Mobile Viewing Issue</h4>
      <p>We're experiencing an issue displaying this document on your mobile device.</p>
      <button 
        className="btn btn-primary mt-2"
        onClick={() => setRetryCount(prevCount => prevCount + 1)}
      >
        Retry Loading
      </button>
      <p className="mt-3 small">Tip: For best results, try viewing in landscape orientation or on a desktop device.</p>
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
                  onError={handleViewerError}
                  defaultScale={isMobile ? SpecialZoomLevel.PageFit : 1.5}
                  initialPage={0}
                  // Important mobile settings to improve compatibility
                  renderMode="canvas"
                  // Don't use withCredentials with Firebase storage URLs
                  withCredentials={false}
                  // Disable caching for mobile to prevent stale data
                  cachePageRender={!isMobile}
                />
              </Worker>
              
              {/* Mobile tips */}
              {isMobile && (
                <div className="alert alert-info mt-2" style={{fontSize: '0.8rem'}}>
                  For best viewing experience, please rotate your device to landscape mode.
                </div>
              )}
            </div>
          ) : (
            <div className="alert alert-warning">No PDF available</div>
          )}
          
          {/* Show mobile backup button after multiple failures */}
          {isMobile && retryCount >= 2 && error && <MobileBackupView />}
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