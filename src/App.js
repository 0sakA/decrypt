import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginSignup from './LoginSignup'; // Assuming this is your login/signup component
import TeacherHome from './TeacherHome';
import ExamPage from './ExamPage'; // Import ExamPage component
import StudentHome from './StudentHome'; // If you have a separate Student Home component

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginSignup />} />
        <Route path="/teacher-home" element={<TeacherHome />} />
        <Route path="/exam/:examId" element={<ExamPage />} /> {/* Dynamic route for exams */}
        <Route path="/student-home" element={<StudentHome />} /> {/* Optional */}
      </Routes>
    </Router>
  );
};

export default App;
