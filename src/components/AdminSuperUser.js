import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Card, Spinner, Button, Table, Badge } from "react-bootstrap";
import API_BASE_URL from "./ApiConfig";

export default function AdminSuperUser() {
  const [month, setMonth] = useState("");
  const [days, setDays] = useState("");
  const [price, setPrice] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [finalPrice, setFinalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Auto-calculate final price
  useEffect(() => {
    const basePrice = parseFloat(price || 0);
    const discount = parseFloat(discountPercent || 0);
    const final = basePrice - (basePrice * discount) / 100;
    setFinalPrice(final > 0 ? Math.floor(final) : 0);
  }, [price, discountPercent]);

  // Fetch all subscriptions
  const fetchSubscriptions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin-super-user`);
      const result = await res.json();
      if (result.success) {
        setSubscriptions(result.data);
      } else {
        setSubscriptions([]);
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  // Handle Add or Update
  const handleSave = async () => {
    const totalDays = parseInt(month || 0) * 30 + parseInt(days || 0);
    const data = {
      month,
      extraDays: days,
      price,
      discountPercent,
      finalPrice,
      totalDays,
    };

    if (!month || !price) {
      alert("Please fill in required fields before saving!");
      return;
    }

    setLoading(true);
    try {
      let res, result;

      if (editingId) {
        res = await fetch(`${API_BASE_URL}/api/admin-super-user/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } else {
        res = await fetch(`${API_BASE_URL}/api/admin-super-user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }

      result = await res.json();

      if (result.success) {
        setSaved(true);
        fetchSubscriptions();
        resetForm();
      }
    } catch (error) {
      console.error("Error saving data:", error);
    } finally {
      setLoading(false);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  // Handle Edit
  const handleEdit = (item) => {
    setEditingId(item.id);
    setMonth(item.month);
    setDays(item.extraDays);
    setPrice(item.price);
    setDiscountPercent(item.discountPercent);
    setFinalPrice(item.finalPrice);
  };

  // Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin-super-user/${id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.success) {
        fetchSubscriptions();
      } else {
        alert("Failed to delete record!");
      }
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };

  // Reset form
  const resetForm = () => {
    setMonth("");
    setDays("");
    setPrice("");
    setDiscountPercent("");
    setFinalPrice(0);
    setEditingId(null);
  };

  return (
    <Container style={styles.container}>
      {/* Form Card */}
      <Card style={styles.card}>
        {/* Blue Header */}
        <div style={styles.cardHeader}>
          <h3 style={styles.headerTitle}>
            <span style={styles.icon}>👤</span>
            Admin Super User Dashboard
          </h3>
          <p style={styles.headerSubtitle}>Manage subscription plans and pricing</p>
        </div>

        {/* White Body */}
        <Card.Body style={styles.cardBody}>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group style={styles.inputGroup}>
                  <Form.Label style={styles.label}>
                    Month <span style={styles.required}>*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    placeholder="Enter number of months"
                    onWheel={(e) => e.target.blur()}
                    style={styles.input}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group style={styles.inputGroup}>
                  <Form.Label style={styles.label}>Extra Days</Form.Label>
                  <Form.Control
                    type="number"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    placeholder="Enter extra days"
                    onWheel={(e) => e.target.blur()}
                    style={styles.input}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group style={styles.inputGroup}>
                  <Form.Label style={styles.label}>
                    Price (₹) <span style={styles.required}>*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Enter price"
                    onWheel={(e) => e.target.blur()}
                    style={styles.input}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group style={styles.inputGroup}>
                  <Form.Label style={styles.label}>Discount (%)</Form.Label>
                  <Form.Control
                    type="number"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    placeholder="Enter discount percentage"
                    onWheel={(e) => e.target.blur()}
                    style={styles.input}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div style={styles.resultBox}>
              <div style={styles.priceDisplay}>
                <span style={styles.priceLabel}>Final Price</span>
                <span style={styles.priceValue}>₹{finalPrice}</span>
              </div>

              <div style={styles.buttonGroup}>
                <Button
                  variant={editingId ? "warning" : "primary"}
                  onClick={handleSave}
                  disabled={loading}
                  style={editingId ? styles.updateButton : styles.addButton}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" style={{ marginRight: "8px" }} />
                      Saving...
                    </>
                  ) : editingId ? (
                    <>✏️ Update</>
                  ) : (
                    <>➕ Add</>
                  )}
                </Button>

                {editingId && (
                  <Button variant="secondary" style={styles.cancelButton} onClick={resetForm}>
                    ✖️ Cancel
                  </Button>
                )}
              </div>

              {saved && (
                <div style={styles.successMessage}>
                  <Badge bg="success" style={styles.successBadge}>
                    ✅ Saved Successfully
                  </Badge>
                </div>
              )}
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Subscription Table Card */}
      <Card style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <h4 style={styles.tableTitle}>
            <span style={styles.icon}>📋</span>
            Subscription Plans
          </h4>
        </div>
        <Card.Body style={styles.tableBody}>
          <Table striped hover responsive style={styles.table}>
            <thead style={styles.thead}>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Month</th>
                <th style={styles.th}>Extra Days</th>
                <th style={styles.th}>Price</th>
                <th style={styles.th}>Discount</th>
                <th style={styles.th}>Final Price</th>
                <th style={styles.th}>Total Days</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.length > 0 ? (
                subscriptions.map((item, index) => (
                  <tr key={item.id} style={styles.tr}>
                    <td style={styles.td}>{index + 1}</td>
                    <td style={styles.td}>
                      <Badge bg="info" style={styles.badge}>{item.month} Month{item.month > 1 ? "s" : ""}</Badge>
                    </td>
                    <td style={styles.td}>{item.extraDays || "-"}</td>
                    <td style={styles.td}>₹{item.price}</td>
                    <td style={styles.td}>
                      {item.discountPercent > 0 ? (
                        <Badge bg="success" style={styles.badge}>{item.discountPercent}%</Badge>
                      ) : (
                        <span style={{ color: "#999", fontSize: "15px" }}>-</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <strong style={{ color: "#0d6efd", fontSize: "16px" }}>₹{item.finalPrice}</strong>
                    </td>
                    <td style={styles.td}>
                      <Badge bg="secondary" style={styles.badge}>{item.totalDays} Days</Badge>
                    </td>
                    <td style={styles.td}>
                      <Button
                        variant="outline-warning"
                        size="sm"
                        style={styles.editBtn}
                        onClick={() => handleEdit(item)}
                      >
                        ✏️
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        style={styles.deleteBtn}
                        onClick={() => handleDelete(item.id)}
                      >
                        🗑️
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={styles.noData}>
                    <div style={styles.emptyState}>
                      <span style={styles.emptyIcon}>📭</span>
                      <p style={styles.emptyText}>No subscription plans found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
}

const styles = {
  container: {
    marginTop: "40px",
    maxWidth: "1100px",
    paddingBottom: "40px",
  },
  card: {
    borderRadius: "16px",
    border: "none",
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    overflow: "hidden",
    marginBottom: "30px",
  },
  cardHeader: {
    background: "linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)",
    padding: "30px",
    textAlign: "center",
    borderBottom: "none",
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: "32px", // Increased from 28px
    fontWeight: "700",
    marginBottom: "8px",
    letterSpacing: "0.5px",
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: "16px", // Increased from 14px
    margin: 0,
    fontWeight: "400",
  },
  icon: {
    marginRight: "10px",
    fontSize: "32px", // Increased from 28px
  },
  cardBody: {
    padding: "35px",
    background: "#ffffff",
  },
  inputGroup: {
    marginBottom: "20px",
  },
  label: {
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: "8px",
    fontSize: "16px", // Increased from 14px
  },
  required: {
    color: "#dc3545",
    marginLeft: "3px",
  },
  input: {
    borderRadius: "8px",
    border: "1.5px solid #e0e0e0",
    padding: "12px 16px", // Increased padding
    fontSize: "16px", // Increased from 14px
    transition: "all 0.3s ease",
  },
  resultBox: {
    marginTop: "30px",
    padding: "25px",
    background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
    borderRadius: "12px",
    border: "2px solid #dee2e6",
  },
  priceDisplay: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    padding: "15px",
    background: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  priceLabel: {
    fontSize: "18px", // Increased from 16px
    fontWeight: "600",
    color: "#495057",
  },
  priceValue: {
    fontSize: "32px", // Increased from 28px
    fontWeight: "700",
    color: "#0d6efd",
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
  },
  addButton: {
    flex: 1,
    padding: "14px", // Increased from 12px
    fontSize: "18px", // Increased from 16px
    fontWeight: "600",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)",
    transition: "all 0.3s ease",
  },
  updateButton: {
    flex: 1,
    padding: "14px", // Increased from 12px
    fontSize: "18px", // Increased from 16px
    fontWeight: "600",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg, #ffc107 0%, #ff9800 100%)",
    color: "#000",
    transition: "all 0.3s ease",
  },
  cancelButton: {
    flex: 1,
    padding: "14px", // Increased from 12px
    fontSize: "18px", // Increased from 16px
    fontWeight: "600",
    borderRadius: "8px",
    border: "none",
    transition: "all 0.3s ease",
  },
  successMessage: {
    marginTop: "15px",
    textAlign: "center",
  },
  successBadge: {
    padding: "12px 24px", // Increased from 10px 20px
    fontSize: "16px", // Increased from 14px
    fontWeight: "600",
  },
  tableCard: {
    borderRadius: "16px",
    border: "none",
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    overflow: "hidden",
  },
  tableHeader: {
    background: "linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)",
    padding: "25px 30px",
    borderBottom: "none",
  },
  tableTitle: {
    color: "#ffffff",
    fontSize: "26px", // Increased from 22px
    fontWeight: "700",
    margin: 0,
    letterSpacing: "0.5px",
  },
  tableBody: {
    padding: "0",
    background: "#ffffff",
  },
  table: {
    margin: 0,
    fontSize: "16px", // Increased from 14px
  },
  thead: {
    background: "#f8f9fa",
    borderBottom: "2px solid #dee2e6",
  },
  th: {
    padding: "18px", // Increased from 16px
    fontWeight: "700",
    color: "#2c3e50",
    borderBottom: "2px solid #dee2e6",
    fontSize: "15px", // Increased from 13px
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  tr: {
    transition: "all 0.2s ease",
  },
  td: {
    padding: "18px", // Increased from 16px
    verticalAlign: "middle",
    borderBottom: "1px solid #f0f0f0",
    fontSize: "15px", // Added explicit font size
  },
  badge: {
    fontSize: "14px", // Added explicit font size for badges
    padding: "6px 12px",
  },
  editBtn: {
    marginRight: "8px",
    padding: "8px 14px", // Increased from 6px 12px
    fontSize: "18px", // Increased from 16px
    borderRadius: "6px",
    transition: "all 0.3s ease",
  },
  deleteBtn: {
    padding: "8px 14px", // Increased from 6px 12px
    fontSize: "18px", // Increased from 16px
    borderRadius: "6px",
    transition: "all 0.3s ease",
  },
  noData: {
    textAlign: "center",
    padding: "60px 20px",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIcon: {
    fontSize: "72px", // Increased from 64px
    marginBottom: "15px",
    opacity: 0.5,
  },
  emptyText: {
    fontSize: "18px", // Increased from 16px
    color: "#6c757d",
    margin: 0,
  },
};