import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Userdashboard.js';
import Notifications from './components/Notification';
import Help from './components/Help';
import ExamRegistrationForm from './components/ExamForm';
import Paymentgateway from './components/PaymentGateway';
import UpcomingExams from './components/UpcomingExam';
import ExamEntry from './components/Examentry';
import MainExam from './components/MainExam';
import RegenerateHallTicket from './components/HallticketDownload';
import AboutUs from './components/AboutUs';
import QAList from './components/ExamKeyAnswers';
import ExamKeyAnswer from './components/ExamKeyAnswers';
import ExamResults from './components/Results';
import WelcomePopup from './components/WelcomePopup';
import TermsAndConditions from './components/TermsAndCondition';
import PrivacyPolicy from './components/PrivacyPolicy';
import CancellationPolicy from './components/CancelationPloicy';
import CandidateAnswerViewer from './components/AnswersCheck';
import FindWinner from './components/FindWinner';
import PracticeTestDashboard from './components/PracticeTestDashboard';
import ExamPurchaseRegistration from './components/ExamPurchaseRegistration.js';
import PracticeMainExam from './components/PracticeMainExam.js';
import PracticeExamEntry from './components/PreactieExamEntry.js';
import PdfSyllabusDashboard from './components/PdfSyllabusDashboard.js';
import PdfSyllabusRegistration from './components/PdfSyllabusRegistration.js';
import PdfSyllabusEntry from './components/PdfSyllabusEntry.js';
import SecurePdfViewer from './components/SecurePdfViewer.js';
import AdminLogin from './components/Login.js';
import AdminDashboard from './components/AdminDashboard.js';
import { Question } from 'react-bootstrap-icons';
import QuestionManager from './components/Questions.js';
import ExamDateNTime from './components/Datentime.js';
import AdminNotification from './components/AdminNotification.js';
import SyllabusList from './components/UserSyllabus.js';
import Concerns from './components/Concerns.js';
import UploadExamQA from './components/UploadQa.js';
import Candidates from './components/Candidats.js';
import CandidatesNoPhoto from './components/CandidatsNoPhoto.js';
import AdminExamResults from './components/AdminResults.js';
import WinnersDisplay from './components/WinnerDetails.js';
import PracticeDashboard from './components/PracticeDashboard.js';
import CategoryManager from './components/PracticeCategory.js';
import PracticeTestDetails from './components/PracticeTestDetails.js';
import PracticeTestQuestionManager from './components/PracticeQuestions.js';
import PracticeTestStudents from './components/PracticeTestStudents.js';
import AdminPdfSyllabusDashboard from './components/AdminPdfSyllabusDashboard.js';
import PdfSyllabusCategoryManager from './components/PdfSyllabusCatrgory.js';
import PdfSyllabusDetails from './components/PdfSyllabusDetails.js';
import PdfSyllabusPurchasers from './components/PdfSyllabusPurchasers.js';
import GstInvoice from './components/GstInvoice.js';
import UserSyllabusList from './components/UserSyllabus.js';
import AdminSyllabusExamManager from './components/AdminSyllabus.js';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="help" element={<Help />} />
          <Route path="examform" element={<ExamRegistrationForm />} />
          <Route path="paymentgateway" element={<Paymentgateway />} />
          <Route path="upcomingexams" element={<UpcomingExams />} />
          <Route path="examentry" element={<ExamEntry />} />
          <Route path="exam" element={<MainExam />} />
          <Route path="aboutus" element={<AboutUs />} />
          <Route path="examqa" element={<ExamKeyAnswer />} />
          <Route path="examresults" element={<ExamResults />} />
          <Route path="/usersyllabus" element={<UserSyllabusList/>} />
          <Route path="termscondition" element={<TermsAndConditions />} />
          <Route path="privacypolicy" element={<PrivacyPolicy />} />
          <Route path="cancellationplicy" element={<CancellationPolicy />} />
          <Route path="wcp" element={<WelcomePopup />} />
          <Route path="downloadhallticket" element={<RegenerateHallTicket />} />
          <Route path="checkanswers" element={<CandidateAnswerViewer />} />
          <Route path="findwinner" element={<FindWinner />} />
          <Route path="practicetestdashboard" element={<PracticeTestDashboard />} />
          <Route path="practicetestpurchase" element={<ExamPurchaseRegistration />} />
          <Route path="practiceexam" element={<PracticeMainExam />} />
          <Route path="practiceexamentry" element={<PracticeExamEntry />} />
          <Route path="pdfsyllabusdashboard" element={<PdfSyllabusDashboard />} />
          <Route path="pdfsyllabusreg" element={<PdfSyllabusRegistration />} />
          <Route path="pdfsyllabusentry" element={<PdfSyllabusEntry />} />
          <Route path="pdfsyllabusview" element={<SecurePdfViewer />} />

          {/* Admin Login - Public */}
          <Route path="adminlogin" element={<AdminLogin />} />

          {/* Protected Admin Routes */}
          <Route path="admindashboard" element={
            <ProtectedRoute>
              <AdminDashboard/>
            </ProtectedRoute>
          } />
          <Route path="/questions" element={
            <ProtectedRoute>
              <QuestionManager/>
            </ProtectedRoute>
          } />
          <Route path="/datentime" element={
            <ProtectedRoute>
              <ExamDateNTime/>
            </ProtectedRoute>
          } />
          <Route path="/adminnotification" element={
            <ProtectedRoute>
              <AdminNotification/>
            </ProtectedRoute>
          } />
          <Route path="/concirns" element={
            <ProtectedRoute>
              <Concerns/>
            </ProtectedRoute>
          } />
          <Route path="/uploadqa" element={
            <ProtectedRoute>
              <UploadExamQA/>
            </ProtectedRoute>
          } />
          <Route path="/candidates" element={
            <ProtectedRoute>
              <Candidates/>
            </ProtectedRoute>
          } />
          <Route path="/candidatesnophoto" element={
            <ProtectedRoute>
              <CandidatesNoPhoto/>
            </ProtectedRoute>
          } />
          <Route path="/adminexamresults" element={
            <ProtectedRoute>
              <AdminExamResults/>
            </ProtectedRoute>
          } />
          <Route path="/winnerdetails" element={
            <ProtectedRoute>
              <WinnersDisplay/>
            </ProtectedRoute>
          } />
          <Route path="/practicedashboard" element={
            <ProtectedRoute>
              <PracticeDashboard/>
            </ProtectedRoute>
          } />
          <Route path="/practicecategory" element={
            <ProtectedRoute>
              <CategoryManager/>
            </ProtectedRoute>
          } />
          <Route path="/practicetestdetails" element={
            <ProtectedRoute>
              <PracticeTestDetails/>
            </ProtectedRoute>
          } />
          <Route path="/practicetestquestions" element={
            <ProtectedRoute>
              <PracticeTestQuestionManager/>
            </ProtectedRoute>
          } />
          <Route path="/practiceteststudents" element={
            <ProtectedRoute>
              <PracticeTestStudents/>
            </ProtectedRoute>
          } />
          <Route path="/adminpdfSyllabusdashboard" element={
            <ProtectedRoute>
              <AdminPdfSyllabusDashboard/>
            </ProtectedRoute>
          } />
          <Route path="/pdfcategory" element={
            <ProtectedRoute>
              <PdfSyllabusCategoryManager/>
            </ProtectedRoute>
          } />
          <Route path="/pdfdetails" element={
            <ProtectedRoute>
              <PdfSyllabusDetails/>
            </ProtectedRoute>
          } />
          <Route path="/pdfpurchasers" element={
            <ProtectedRoute>
              <PdfSyllabusPurchasers/>
            </ProtectedRoute>
          } />
          <Route path="/gstinvoice" element={
            <ProtectedRoute>
              <GstInvoice/>
            </ProtectedRoute>
          } />
          <Route path="/adminsyllabus" element={
            <ProtectedRoute>
              <AdminSyllabusExamManager/>
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;