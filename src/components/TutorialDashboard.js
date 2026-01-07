import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Spinner, Modal } from "react-bootstrap";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API_BASE_URL from "./ApiConfig";

export default function TutorialDashboard() {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch all tutorials
  const fetchTutorials = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/getAllTutorials`);
      const allTutorials = Array.isArray(response.data) ? response.data : [];
      
      // Filter only website category
      const websiteTutorials = allTutorials.filter(
        (tut) => tut.category === "website"
      );
      
      setTutorials(websiteTutorials);
    } catch (error) {
      console.error("Error fetching tutorials:", error);
      toast.error("Failed to load tutorials", {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutorials();
  }, []);

  // Handle video click
  const handleVideoClick = (tutorial) => {
    setSelectedVideo(tutorial);
    setShowModal(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedVideo(null);
  };

  return (
    <>
      <ToastContainer />
      <div style={styles.pageWrapper}>
        {/* Header */}
        <div style={styles.headerSection}>
          <Container>
            <h1 style={styles.headerTitle}>Website Guide Tutorial</h1>
            <p style={styles.headerSubtitle}>
              Learn how to use our website with these videos
            </p>
          </Container>
        </div>

        {/* Content */}
        <Container style={styles.contentSection}>
          {loading ? (
            <div style={styles.loadingContainer}>
              <Spinner animation="border" variant="primary" style={styles.spinner} />
              <p style={styles.loadingText}>Loading tutorials...</p>
            </div>
          ) : tutorials.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📹</div>
              <h3 style={styles.emptyTitle}>No Tutorials Available</h3>
              <p style={styles.emptyText}>
                Check back later for website tutorial videos
              </p>
            </div>
          ) : (
            <Row className="g-4">
              {tutorials.map((tutorial) => (
                <Col key={tutorial.id} xs={12} sm={6} md={4} lg={3}>
                  <Card
                    style={styles.tutorialCard}
                    onClick={() => handleVideoClick(tutorial)}
                  >
                    <div style={styles.thumbnailContainer}>
                      <video
                        src={tutorial.videoURL}
                        style={styles.thumbnail}
                        preload="metadata"
                      />
                      <div style={styles.playOverlay}>
                        <div style={styles.playButton}>
                          <svg
                            width="50"
                            height="50"
                            viewBox="0 0 50 50"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle cx="25" cy="25" r="25" fill="white" opacity="0.9" />
                            <path
                              d="M20 15L35 25L20 35V15Z"
                              fill="#0d6efd"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <Card.Body style={styles.cardBody}>
                      <h5 style={styles.tutorialTitle}>{tutorial.tutorialName}</h5>
                      <div style={styles.tutorialMeta}>
                        <span style={styles.categoryBadge}>
                          {tutorial.category}
                        </span>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Container>

        {/* Video Modal */}
        <Modal
          show={showModal}
          onHide={handleCloseModal}
          size="lg"
          centered
          style={styles.modal}
        >
          <Modal.Header closeButton style={styles.modalHeader}>
            <Modal.Title style={styles.modalTitle}>
              {selectedVideo?.tutorialName}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={styles.modalBody}>
            {selectedVideo && (
              <video
                src={selectedVideo.videoURL}
                controls
                autoPlay
                style={styles.videoPlayer}
              />
            )}
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
}

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    backgroundColor: "#f8f9fa",
  },
  headerSection: {
    backgroundColor: "#1a3b5d",
    padding: "40px 0",
    marginBottom: "40px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: "36px",
    fontWeight: "700",
    margin: 0,
    textAlign: "center",
    marginBottom: "10px",
  },
  headerSubtitle: {
    color: "#ffffff",
    fontSize: "16px",
    textAlign: "center",
    margin: 0,
    opacity: 0.9,
  },
  contentSection: {
    paddingBottom: "60px",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
  },
  spinner: {
    width: "50px",
    height: "50px",
  },
  loadingText: {
    marginTop: "20px",
    color: "#6c757d",
    fontSize: "16px",
  },
  emptyState: {
    textAlign: "center",
    padding: "80px 20px",
  },
  emptyIcon: {
    fontSize: "80px",
    marginBottom: "20px",
  },
  emptyTitle: {
    color: "#212529",
    fontWeight: "600",
    marginBottom: "12px",
  },
  emptyText: {
    color: "#6c757d",
    fontSize: "16px",
  },
  tutorialCard: {
    border: "none",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    cursor: "pointer",
    transition: "all 0.3s ease",
    height: "100%",
  },
  thumbnailContainer: {
    position: "relative",
    width: "100%",
    paddingTop: "56.25%", // 16:9 aspect ratio
    backgroundColor: "#000",
    overflow: "hidden",
  },
  thumbnail: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  playOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 1,
    transition: "opacity 0.3s ease",
  },
  playButton: {
    transition: "transform 0.3s ease",
  },
  cardBody: {
    padding: "20px",
    backgroundColor: "#ffffff",
  },
  tutorialTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#212529",
    marginBottom: "12px",
    lineHeight: "1.4",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  tutorialMeta: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  categoryBadge: {
    display: "inline-block",
    padding: "4px 12px",
    backgroundColor: "#e7f1ff",
    color: "#0d6efd",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  modal: {
    zIndex: 1050,
  },
  modalHeader: {
    backgroundColor: "#2c3e50",
    borderBottom: "none",
    padding: "20px 24px",
  },
  modalTitle: {
    color: "#ffffff",
    fontSize: "20px",
    fontWeight: "600",
    margin: 0,
  },
  modalBody: {
    padding: 0,
    backgroundColor: "#000",
  },
  videoPlayer: {
    width: "100%",
    height: "auto",
    maxHeight: "70vh",
    display: "block",
  },
};

// Add hover effects with CSS
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  .card:hover {
    transform: translateY(-8px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.15) !important;
  }
  .card:hover .play-overlay {
    background-color: rgba(0,0,0,0.5);
  }
  .card:hover .play-button {
    transform: scale(1.1);
  }
  .modal-content {
    border: none;
    border-radius: 12px;
    overflow: hidden;
  }
  .btn-close {
    filter: brightness(0) invert(1);
  }
`;
document.head.appendChild(styleSheet);