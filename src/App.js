import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import WelcomePopup from './components/Rewards.js';
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
import AdminVideoDashboard from './components/AdminVideoDashboard.js';
import VideoSyllabusCategoryManager from './components/AdminVideoCategory.js';
import AdminVideoDetails from './components/AdminVideoDetails.js';
import VideoSyllabusDashboard from './components/VideoSyllabusDashboard.js';
import VideoSyllabusRegistration from './components/VideoSyllbuSRegistration.js';
import VideoSyllabusEntry from './components/VideoSyllabusEntry.js';
import AdminVideoPurchasers from './components/AdminVideoPurchasers.js';
import AdminSuperUser from './components/AdminSuperUser.js';
import SuperUserDashboard from './components/SuperUserDashboard.js';
import AdminSuperUserDashboard from './components/AdminSuperUserDashboard.js';
import AdminSuperUserPurchasers from './components/AdminSuperUserPurchasers.js';
import TutorialDashboard from './components/TutorialDashboard.js';
import AdminAddTut from './components/AdminAddTut.js';
import Rewards from './components/Rewards.js';
import AdminCourseDashboard from './components/AdminCourseDashboard.js';
import AdminCourseCategory from './components/AdminCourseCategory.js';
import AdminAddCourse from './components/AdminCourseAdd.js';
import AdminCourseApllications from './components/AdminCourseApllications.js';
import AdminCoursePayments from './components/AdminCoursePayments.js';
import AdminCourseGmeet from './components/AdminCourseGmeet.js';
import AdminCourseAllGmeets from './components/AdminCourseAllGmeets.js';
import AdminCourseCandidates from './components/AdminCourseCandidates.js';
import AdminCourseAttendance from './components/AdminCourseAttendace.js';
import AdminCourseAttendanceTrack from './components/AdminCourseAttendanceTrack.js';
import CourseDashboard from './components/CourseDashboard.js';
import CourseStatusCheck from './components/CourseStatusCheck.js';
import CourseGmeetFinder from './components/CourseGmeetFinder.js';
import CourseDetails from './components/CourseDetails.js';
import HomeDashboard from './components/HomeDashboard.js';

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
          <Route path="/" element={<HomeDashboard />} />
          <Route path="/rewards" element={<Rewards />} />
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
          <Route path="videosyllabusdashboard" element={<VideoSyllabusDashboard />} />
          <Route path="videosyllabusreg" element={<VideoSyllabusRegistration />} />
          <Route path="videosyllabusentry" element={<VideoSyllabusEntry />} />
          <Route path="adminvideopurchase" element={<AdminVideoPurchasers />} />
          <Route path="superuser" element={<SuperUserDashboard />} />
          <Route path="tutorialdashboard" element={<TutorialDashboard />} />


          
          <Route path="coursedashboard" element={<CourseDashboard />} />
          <Route path="coursestatuscheck" element={<CourseStatusCheck />} />
          <Route path="coursegmeetfinder" element={<CourseGmeetFinder />} />
          <Route path="/course/:id" element={<CourseDetails />} />

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
          <Route path="/adminvideodashboard" element={
            <ProtectedRoute>
              <AdminVideoDashboard/>
            </ProtectedRoute>
          } />
          <Route path="/videocategory" element={
            <ProtectedRoute>
              <VideoSyllabusCategoryManager/>
            </ProtectedRoute>
          } />
          <Route path="/adminvideodetails" element={
            <ProtectedRoute>
              <AdminVideoDetails/>
            </ProtectedRoute>
          } />
          <Route path="/adminsuperuser" element={
            <ProtectedRoute>
              <AdminSuperUser/>
            </ProtectedRoute>
          } />
          <Route path="/adminsuperuserdashboard" element={
            <ProtectedRoute>
              <AdminSuperUserDashboard/>
            </ProtectedRoute>
          } />
          <Route path="/superuserpurchasers" element={
            <ProtectedRoute>
              <AdminSuperUserPurchasers/>
            </ProtectedRoute>
          } />
          <Route path="/adminaddtut" element={
            <ProtectedRoute>
              <AdminAddTut/>
            </ProtectedRoute>
          } />
          <Route path="/admincoursedashboard" element={
            <ProtectedRoute>
              <AdminCourseDashboard/>
            </ProtectedRoute>
          } />
          <Route path="/coursecategory" element={
            <ProtectedRoute>
              <AdminCourseCategory/>
            </ProtectedRoute>
          } />
          <Route path="/courseadd" element={
            <ProtectedRoute>
              <AdminAddCourse/>
            </ProtectedRoute>
          } />
          <Route path="/courseapplicants" element={
            <ProtectedRoute>
              <AdminCourseApllications/>
            </ProtectedRoute>
          } />
          <Route path="/coursepayments" element={
            <ProtectedRoute>
              <AdminCoursePayments/>
            </ProtectedRoute>
          } />
          <Route path="/coursegmeets" element={
            <ProtectedRoute>
              <AdminCourseGmeet/>
            </ProtectedRoute>
          } />
          <Route path="/courseallgmeets" element={
            <ProtectedRoute>
              <AdminCourseAllGmeets/>
            </ProtectedRoute>
          } />
          <Route path="/coursecandidates" element={
            <ProtectedRoute>
              <AdminCourseCandidates/>
            </ProtectedRoute>
          } />
          <Route path="/courseattendance" element={
            <ProtectedRoute>
              <AdminCourseAttendance/>
            </ProtectedRoute>
          } />
          <Route path="/courseattendancetrack" element={
            <ProtectedRoute>
              <AdminCourseAttendanceTrack/>
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;