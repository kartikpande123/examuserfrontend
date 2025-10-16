import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminDashboard from "./components/AdminDashboard";
import Questions from "./components/Questions";
import ExamDateNTime from "./components/Datentime";
import Notification from "./components/Notification";
import Syllabus from "./components/Syllabus";
import Concerns from "./components/Concerns";
import AdminLogin from "./components/Login";
import Candidates from "./components/Candidats";
import UploadExamQA from "./components/UploadQa";
import ExamResults from "./components/Results";
import Protected from "./components/Protected";
import WinnerDetails from "./components/WinnerDetails"
import PracticeDashboard from "./components/PracticeDashboard";
import CategoryManager from "./components/PracticeCategory";
import PracticeTestDetails from "./components/PracticeTestDetails";
import PracticeTestQuestionManager from "./components/PracticeQuestions";
import CandidatesNoPhoto from "./components/CandidatsNoPhoto";
import PracticeTestStudents from "./components/PracticeTestStudents";
import PdfSyllabusDashboard from "./components/PdfSyllabusDashboard";
import PdfSyllabusCategoryManager from "./components/PdfSyllabusCatrgory";
import PdfSyllabusDetails from "./components/PdfSyllabusDetails";
import PdfSyllabusPurchasers from "./components/PdfSyllabusPurchasers";
import GstInvoice from "./components/GstInvoice";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<AdminLogin />} />
          <Route path="/admindashboard" element={<Protected Component={AdminDashboard} />} />
          <Route path="/questions" element={<Protected Component={Questions} />} />
          <Route path="/datentime" element={<Protected Component={ExamDateNTime} />} />
          <Route path="/notification" element={<Protected Component={Notification} />} />
          <Route path="/syllabus" element={<Protected Component={Syllabus} />} />
          <Route path="/concirns" element={<Protected Component={Concerns} />} />
          <Route path="/uploadqa" element={<Protected Component={UploadExamQA} />} />
          <Route path="/candidates" element={<Protected Component={Candidates} />} />
          <Route path="/candidatesnophoto" element={<Protected Component={CandidatesNoPhoto} />} />
          <Route path="/examresults" element={<Protected Component={ExamResults} />} />
          <Route path="/winnerdetails" element={<Protected Component={WinnerDetails} />} />
          <Route path="/practiceDashboard" element={<Protected Component={PracticeDashboard} />} />
          <Route path="/practicecategory" element={<Protected Component={CategoryManager} />} />
          <Route path="/practicetestdetails" element={<Protected Component={PracticeTestDetails} />} />
          <Route path="/practicetestquestions" element={<Protected Component={PracticeTestQuestionManager} />} />
          <Route path="/practiceteststudents" element={<Protected Component={PracticeTestStudents} />} />
          <Route path="/pdfsyllabusdashboard" element={<Protected Component={PdfSyllabusDashboard} />} />
          <Route path="/pdfcategory" element={<Protected Component={PdfSyllabusCategoryManager} />} />
          <Route path="/pdfdetails" element={<Protected Component={PdfSyllabusDetails} />} />
          <Route path="/pdfpurchasers" element={<Protected Component={PdfSyllabusPurchasers} />} />
          <Route path="/gstinvoice" element={<Protected Component={GstInvoice} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
