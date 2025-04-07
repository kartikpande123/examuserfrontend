import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/userdashboard';
import Notifications from './components/Notification';
import Help from './components/Help';
import ExamRegistrationForm from './components/ExamForm';
import Paymentgateway from './components/PaymentGateway';
import UpcomingExams from './components/UpcomingExam';
import ExamEntry from './components/Examentry';
import MainExam from './components/MainExam';
import SyllabusList from './components/Syllabus';
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
import TestPdf from './components/TestPdf.js';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="help" element={<Help />} />
          <Route path="examform" element={<ExamRegistrationForm />} />
          <Route path="paymentgateway" element={<Paymentgateway />} />
          <Route path="upcomingexams" element={<UpcomingExams />} />
          <Route path="examentry" element={<ExamEntry />} />
          <Route path="exam" element={<MainExam />} />
          <Route path="syllabus" element={<SyllabusList />} />
          <Route path="aboutus" element={<AboutUs />} />
          <Route path="examqa" element={<ExamKeyAnswer />} />
          <Route path="examresults" element={<ExamResults />} />
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
          <Route path="testpdf" element={<TestPdf />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
