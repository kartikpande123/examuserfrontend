import React, { useState } from "react";
import { Trophy, Award, Gift, Phone, Bell, Star, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Rewards = () => {
  const [expandedPrize, setExpandedPrize] = useState(null);
  const navigate = useNavigate();

  const prizeData = {
    first: {
      worth: 1000,
      icon: Trophy,
      iconColor: "#ffc107",
      items: [
        { name: "Comport", mrp: 57 },
        { name: "Harpic", mrp: 105 },
        { name: "Phynail", mrp: 75 },
        { name: "Lizol", mrp: 140 },
        { name: "Soap wheel (10pcs)", mrp: 100 },
        { name: "Raw rice (1kg)", mrp: 75 },
        { name: "Santoor soap (2pcs)", mrp: 70 },
        { name: "Sugar (2kg)", mrp: 84 },
        { name: "Ghee", mrp: 140 },
        { name: "Ice cream", mrp: 49 },
        { name: "Besan (0.5kg)", mrp: 65 },
        { name: "Paneer", mrp: 40 },
      ],
      cashOption: "₹1000",
      rank: "1st",
    },
    second: {
      worth: 750,
      icon: Award,
      iconColor: "#6c757d",
      items: [
        { name: "Comport", mrp: 57 },
        { name: "Harpic", mrp: 105 },
        { name: "Phynail", mrp: 75 },
        { name: "Lizol", mrp: 140 },
        { name: "Soap (10pcs)", mrp: 100 },
        { name: "Paneer", mrp: 40 },
        { name: "Ice cream", mrp: 49 },
        { name: "Ghee", mrp: 140 },
        { name: "Idli rava", mrp: 44 },
      ],
      cashOption: "₹750",
      rank: "2nd",
    },
    third: {
      worth: 500,
      icon: Gift,
      iconColor: "#ffc107",
      items: [
        { name: "Comport", mrp: 57 },
        { name: "Harpic", mrp: 105 },
        { name: "Phynail", mrp: 65 },
        { name: "Paneer", mrp: 40 },
        { name: "Ice cream", mrp: 49 },
        { name: "Ghee", mrp: 140 },
        { name: "Idli rava", mrp: 44 },
      ],
      cashOption: "₹500",
      rank: "3rd",
    },
  };

  const togglePrize = (prize) => {
    setExpandedPrize(expandedPrize === prize ? null : prize);
  };

  const styles = {
    mainContainer: {
      minHeight: "100vh",
      background: "#ffffff",
      padding: "40px 0",
    },
    headerCard: {
      background: "#0d6efd",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      color: "white",
      padding: "30px",
      marginBottom: "25px",
      border: "none",
    },
    headerTitle: {
      fontSize: "2rem",
      fontWeight: "700",
      marginBottom: "10px",
    },
    headerSubtitle: {
      fontSize: "1.1rem",
      opacity: "0.95",
      marginBottom: "0",
    },
    badgeContainer: {
      background: "rgba(255,255,255,0.2)",
      borderRadius: "10px",
      padding: "15px",
      display: "inline-block",
    },
    helplineCard: {
      background: "#ffc107",
      borderRadius: "12px",
      padding: "25px",
      marginBottom: "25px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
      border: "none",
    },
    phoneIcon: {
      background: "rgba(255,255,255,0.3)",
      borderRadius: "50%",
      padding: "12px",
      display: "inline-flex",
      margin: "0 auto",
    },
    phoneNumber: {
      fontSize: "1.8rem",
      fontWeight: "bold",
      color: "#dc3545",
      textDecoration: "none",
    },
    announcementCard: {
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      border: "3px solid #dc3545",
      marginBottom: "25px",
    },
    announcementHeader: {
      background: "#dc3545",
      padding: "25px",
      textAlign: "center",
    },
    announcementTitle: {
      fontSize: "2rem",
      fontWeight: "bold",
      color: "white",
      margin: 0,
    },
    announcementBody: {
      background: "#fff3cd",
      padding: "40px 25px",
    },
    freeText: {
      fontSize: "2.5rem",
      fontWeight: "900",
      color: "#dc3545",
    },
    limitedBadge: {
      background: "#28a745",
      color: "white",
      padding: "12px 25px",
      borderRadius: "25px",
      fontSize: "1.2rem",
      fontWeight: "bold",
      display: "inline-block",
      boxShadow: "0 3px 10px rgba(40,167,69,0.3)",
    },
    hurryBanner: {
      background: "#ffc107",
      padding: "15px",
      borderRadius: "10px",
      border: "2px solid #ff9800",
    },
    aboutCard: {
      background: "white",
      borderRadius: "12px",
      padding: "30px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      marginBottom: "25px",
      border: "1px solid #dee2e6",
    },
    sectionTitle: {
      fontSize: "2rem",
      fontWeight: "700",
      textAlign: "center",
      marginBottom: "30px",
      color: "#0d6efd",
    },
    prizeCard: {
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
      border: "1px solid #dee2e6",
      height: "100%",
      background: "white",
    },
    prizeHeaderFirst: {
      padding: "25px",
      background: "#ffc107",
      color: "#000",
      textAlign: "center",
    },
    prizeHeaderSecond: {
      padding: "25px",
      background: "#6c757d",
      color: "white",
      textAlign: "center",
    },
    prizeHeaderThird: {
      padding: "25px",
      background: "#dc3545",
      color: "white",
      textAlign: "center",
    },
    prizeIcon: {
      marginBottom: "15px",
    },
    prizeRank: {
      background: "rgba(255,255,255,0.3)",
      borderRadius: "25px",
      padding: "6px 18px",
      fontSize: "1.3rem",
      fontWeight: "bold",
      display: "inline-block",
      marginBottom: "12px",
    },
    prizeTitle: {
      fontSize: "1.5rem",
      fontWeight: "bold",
      marginBottom: "10px",
    },
    prizeWorth: {
      fontSize: "2rem",
      fontWeight: "900",
    },
    prizeBody: {
      padding: "25px",
      background: "#f8f9fa",
    },
    viewItemsBtn: {
      background: "white",
      border: "2px solid #dee2e6",
      borderRadius: "8px",
      padding: "12px 15px",
      width: "100%",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      cursor: "pointer",
      transition: "all 0.3s ease",
      fontWeight: "600",
      color: "#495057",
    },
    itemsList: {
      maxHeight: "280px",
      overflowY: "auto",
      marginTop: "15px",
      marginBottom: "15px",
    },
    itemCard: {
      background: "white",
      borderRadius: "8px",
      padding: "12px 15px",
      marginBottom: "8px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
      border: "1px solid #e9ecef",
    },
    cashOption: {
      background: "#d4edda",
      border: "2px solid #28a745",
      borderRadius: "10px",
      padding: "15px",
      textAlign: "center",
      fontWeight: "bold",
      color: "#155724",
    },
    cashAmount: {
      fontSize: "1.5rem",
      fontWeight: "900",
      color: "#28a745",
    },
    ctaCard: {
      background: "#0d6efd",
      borderRadius: "12px",
      padding: "40px",
      textAlign: "center",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      color: "white",
      border: "none",
    },
    ctaTitle: {
      fontSize: "2rem",
      fontWeight: "bold",
      marginBottom: "15px",
    },
    ctaButton: {
      background: "white",
      color: "#0d6efd",
      padding: "12px 40px",
      borderRadius: "25px",
      border: "none",
      fontSize: "1.2rem",
      fontWeight: "bold",
      boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
      transition: "all 0.3s ease",
      cursor: "pointer",
    },
    bellAnimation: {
      animation: "ring 2s infinite",
    },
  };

  const keyframes = `
    @keyframes ring {
      0%, 100% { transform: rotate(0deg); }
      10%, 30% { transform: rotate(-10deg); }
      20%, 40% { transform: rotate(10deg); }
    }
  `;

  return (
    <>
      <style>{keyframes}</style>
      <div style={styles.mainContainer}>
        <div className="container">
          {/* Header */}
          <div className="card" style={styles.headerCard}>
            <div className="text-center">
              <h1 style={styles.headerTitle}>
                Karnataka Ayan Wholesale Supply Enterprises
              </h1>
              <p style={styles.headerSubtitle}>
                Nurturing Bright Futures Through Excellence
              </p>
            </div>
          </div>

          {/* Helpline */}
          <div 
            className="card" 
            style={styles.helplineCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
            }}
          >
            <div className="text-center">
              <div style={styles.phoneIcon}>
                <Phone size={36} color="#000" />
              </div>
              <h4 style={{ color: "#000", fontWeight: "bold", marginBottom: "8px", marginTop: "15px" }}>
                Need Help? Call Our Helpline:
              </h4>
              <a href="tel:+916360785195" style={styles.phoneNumber}>
                +91 6360785195
              </a>
              <p style={{ color: "#000", marginTop: "8px", marginBottom: 0, fontSize: "0.95rem" }}>
                Our experts are available to answer all your queries!
              </p>
            </div>
          </div>

          {/* Special Announcement */}
          <div className="card" style={styles.announcementCard}>
            <div style={styles.announcementHeader}>
              <div className="d-flex align-items-center justify-content-center gap-3">
                <Bell size={32} style={styles.bellAnimation} />
                <h2 style={styles.announcementTitle}>SPECIAL ANNOUNCEMENT</h2>
              </div>
            </div>
            <div style={styles.announcementBody}>
              <div className="text-center mb-4">
                <div className="d-flex align-items-center justify-content-center gap-3 mb-4">
                  <Star size={40} color="#dc3545" fill="#dc3545" />
                  <h3 style={styles.freeText}>FREE! FREE! FREE!</h3>
                  <Star size={40} color="#dc3545" fill="#dc3545" />
                </div>
                <div style={styles.limitedBadge}>
                  Limited Time Offer - This Month Only!
                </div>
              </div>
              <div className="row justify-content-center">
                <div className="col-lg-10">
                  <p style={{ fontSize: "1.25rem", textAlign: "center", marginBottom: "20px", color: "#333", lineHeight: "1.6" }}>
                    Access all our <strong style={{ color: "#0d6efd" }}>Practice Tests</strong> and{" "}
                    <strong style={{ color: "#0d6efd" }}>Complete Syllabus</strong> at absolutely NO COST!
                  </p>
                  <p style={{ fontSize: "1rem", textAlign: "center", marginBottom: "25px", color: "#666", lineHeight: "1.6" }}>
                    Enhance your skills with our professionally designed test series and comprehensive study materials. 
                    Prepare like a pro and ace your competitive exams with our expert-curated content.
                  </p>
                  <div style={styles.hurryBanner}>
                    <p style={{ fontSize: "1.15rem", fontWeight: "bold", margin: 0, color: "#000", textAlign: "center" }}>
                      HURRY UP! This exceptional opportunity ends soon!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="card" style={styles.aboutCard}>
            <p style={{ fontSize: "1.1rem", lineHeight: "1.7", color: "#495057", marginBottom: 0 }}>
              Welcome to <strong style={{ color: "#0d6efd" }}>Karnataka Ayan Wholesale Supply Enterprises</strong>. 
              With the support of our main company, we created our sub-company,{" "}
              <strong style={{ color: "#6c757d" }}>ARN Pvt Exam Conduct</strong>, which runs competitive exams 
              to nurture bright futures. The top 3 winners will be rewarded with premium grocery and dairy 
              products or equivalent cash prizes!
            </p>
          </div>

          {/* Prize Section */}
          <h2 style={styles.sectionTitle}>🏆 Prize Distribution 🏆</h2>
          
          <div className="row g-4 mb-4">
            {Object.entries(prizeData).map(([key, data]) => {
              const Icon = data.icon;
              const isExpanded = expandedPrize === key;
              const headerStyle = key === "first" ? styles.prizeHeaderFirst : 
                                 key === "second" ? styles.prizeHeaderSecond : 
                                 styles.prizeHeaderThird;
              
              return (
                <div key={key} className="col-lg-4 col-md-6">
                  <div 
                    className="card" 
                    style={styles.prizeCard}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-5px)";
                      e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                    }}
                  >
                    <div style={headerStyle}>
                      <div style={styles.prizeIcon}>
                        <Icon size={50} strokeWidth={2} />
                      </div>
                      <div style={styles.prizeRank}>{data.rank}</div>
                      <h4 style={styles.prizeTitle}>
                        {key === "first" ? "First Prize" : key === "second" ? "Second Prize" : "Third Prize"}
                      </h4>
                      <div style={styles.prizeWorth}>₹{data.worth}</div>
                    </div>
                    
                    <div style={styles.prizeBody}>
                      <button
                        onClick={() => togglePrize(key)}
                        style={styles.viewItemsBtn}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = "0 3px 10px rgba(0,0,0,0.15)";
                          e.currentTarget.style.borderColor = "#0d6efd";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = "none";
                          e.currentTarget.style.borderColor = "#dee2e6";
                        }}
                      >
                        <span>View {data.items.length} Items</span>
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                      
                      {isExpanded && (
                        <div style={styles.itemsList}>
                          {data.items.map((item, i) => (
                            <div key={i} style={styles.itemCard}>
                              <span style={{ color: "#495057" }}>{item.name}</span>
                              <span style={{ fontWeight: "bold", color: "#28a745", fontSize: "1.05rem" }}>
                                ₹{item.mrp}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div style={styles.cashOption}>
                        <div style={{ marginBottom: "5px" }}>Alternatively, you can choose a cash prize of</div>
                        <div style={styles.cashAmount}>{data.cashOption}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA Section */}
          <div className="card" style={styles.ctaCard}>
            <h3 style={styles.ctaTitle}>Ready to Start Your Journey?</h3>
            <p style={{ fontSize: "1.1rem", marginBottom: "25px", opacity: 0.95 }}>
              Join thousands of successful candidates today!
            </p>
            <button 
              style={styles.ctaButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow = "0 5px 15px rgba(0,0,0,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 3px 10px rgba(0,0,0,0.2)";
              }}
              onClick={()=>navigate("/")}
            >
              Continue to Dashboard →
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Rewards;