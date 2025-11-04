import React, { useEffect, useState } from "react";
import { Container, Form, Button, Card, Spinner, Table } from "react-bootstrap";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API_BASE_URL from "./ApiConfig";

export default function AdminAddTut() {
  const [formData, setFormData] = useState({
    category: "",
    tutorialName: "",
    videoFile: null,
  });

  const [loading, setLoading] = useState(false);
  const [tutorials, setTutorials] = useState([]);

  // Fetch all tutorials
  const fetchTutorials = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/getAllTutorials`);
      setTutorials(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching tutorials:", error);
      toast.error("Failed to fetch tutorials");
    }
  };

  useEffect(() => {
    fetchTutorials();
  }, []);

  // Handle form change
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append("category", formData.category);
      data.append("tutorialName", formData.tutorialName);
      data.append("videoFile", formData.videoFile);

      await axios.post(`${API_BASE_URL}/api/addTutorial`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Tutorial added successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      
      setFormData({ category: "", tutorialName: "", videoFile: null });
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";
      
      fetchTutorials();
    } catch (error) {
      toast.error("Failed to add tutorial. Please try again.", {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this tutorial?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/deleteTutorial/${id}`);
      toast.success("Tutorial deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      fetchTutorials();
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete tutorial", {
        position: "top-right",
        autoClose: 4000,
      });
    }
  };

  return (
    <>
      <ToastContainer />
      <Container className="py-5">
        <Card style={styles.card}>
          <Card.Header style={styles.header}>
            <h2 style={styles.headerText}>
              Admin Add Tutorials
            </h2>
          </Card.Header>
          <Card.Body style={styles.body}>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label style={styles.label}>Category</Form.Label>
                <Form.Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  style={styles.input}
                >
                  <option value="">Select Category</option>
                  <option value="android">Android</option>
                  <option value="website">Website</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label style={styles.label}>Tutorial Name</Form.Label>
                <Form.Control
                  type="text"
                  name="tutorialName"
                  value={formData.tutorialName}
                  onChange={handleChange}
                  placeholder="Enter tutorial name"
                  required
                  style={styles.input}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label style={styles.label}>Upload Video</Form.Label>
                <Form.Control
                  type="file"
                  name="videoFile"
                  accept="video/*"
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </Form.Group>

              <Button type="submit" variant="primary" className="w-100" disabled={loading} style={styles.submitButton}>
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Uploading...
                  </>
                ) : (
                  "Add Tutorial"
                )}
              </Button>
            </Form>
          </Card.Body>
        </Card>

        {/* Tutorials List */}
        <Card style={styles.tableCard} className="mt-5">
          <Card.Header style={styles.header}>
            <h3 style={styles.headerText}>All Tutorials</h3>
          </Card.Header>
          <Card.Body style={styles.body}>
            {tutorials.length === 0 ? (
              <p className="text-center text-muted">No tutorials found</p>
            ) : (
              <Table bordered hover responsive style={styles.table}>
                <thead style={styles.tableHead}>
                  <tr>
                    <th>#</th>
                    <th>Category</th>
                    <th>Tutorial Name</th>
                    <th>Video</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tutorials.map((tut, index) => (
                    <tr key={tut.id}>
                      <td>{index + 1}</td>
                      <td style={styles.categoryCell}>{tut.category}</td>
                      <td>{tut.tutorialName}</td>
                      <td>
                        <a href={tut.videoURL} target="_blank" rel="noreferrer" style={styles.link}>
                          Watch Video
                        </a>
                      </td>
                      <td>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(tut.id)}
                          style={styles.deleteButton}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}

const styles = {
  card: {
    width: "100%",
    maxWidth: "600px",
    margin: "0 auto",
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    border: "none",
    overflow: "hidden",
  },
  header: {
    backgroundColor: "#0d6efd",
    border: "none",
    borderBottom: "3px solid #0a58ca",
    padding: "20px 30px",
  },
  headerText: {
    color: "#ffffff",
    fontWeight: "700",
    margin: 0,
    fontSize: "24px",
    textAlign: "center",
  },
  body: {
    backgroundColor: "#ffffff",
    padding: "30px",
  },
  label: {
    fontWeight: "600",
    color: "#212529",
    marginBottom: "8px",
  },
  input: {
    borderRadius: "8px",
    border: "1px solid #ced4da",
    padding: "10px 14px",
  },
  submitButton: {
    borderRadius: "8px",
    padding: "12px",
    fontWeight: "600",
    fontSize: "16px",
    backgroundColor: "#0d6efd",
    border: "none",
    transition: "all 0.3s ease",
  },
  tableCard: {
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    border: "none",
    overflow: "hidden",
  },
  table: {
    marginBottom: 0,
  },
  tableHead: {
    backgroundColor: "#f8f9fa",
  },
  categoryCell: {
    textTransform: "capitalize",
    fontWeight: "500",
  },
  link: {
    color: "#0d6efd",
    textDecoration: "none",
    fontWeight: "500",
  },
  deleteButton: {
    borderRadius: "6px",
    fontWeight: "600",
    padding: "6px 16px",
  },
};