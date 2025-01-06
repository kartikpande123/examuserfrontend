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
          <Route path="wcp" element={<WelcomePopup />} />
          <Route path="downloadhallticket" element={<RegenerateHallTicket />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
