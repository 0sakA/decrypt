import React, { useEffect, useState } from 'react';
import { auth } from './firebase'; // Firebase Auth
import { collection, getDoc, doc, addDoc } from 'firebase/firestore'; // Firestore functions
import { db } from './firebase'; // Firestore instance
import { useNavigate, useParams } from 'react-router-dom';
import './ExamPage.css';

const ExamPage = () => {
  const [examData, setExamData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [isExamStarted, setIsExamStarted] = useState(false); // Track exam start
  const [tabChangeCount, setTabChangeCount] = useState(0); // Track tab changes
  const [isInFullscreen, setIsInFullscreen] = useState(true); // Track fullscreen status
  const [message, setMessage] = useState(''); // State for message input
  const navigate = useNavigate();
  const { examId } = useParams(); // Get examId from URL params

  useEffect(() => {
    const disableContextMenu = (e) => e.preventDefault();
    const disableCopy = (e) => e.preventDefault();
    const disablePaste = (e) => e.preventDefault();

    document.addEventListener('contextmenu', disableContextMenu);
    document.addEventListener('copy', disableCopy);
    document.addEventListener('paste', disablePaste);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setTabChangeCount((prevCount) => {
          const newCount = prevCount + 1;

          if (newCount <= 2) {
            alert(`Warning: You have switched tabs ${newCount} time(s). Please return to the exam.`);
          } else {
            alert('You have exceeded the allowed tab switches.');
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            auth.signOut()
              .then(() => {
                navigate('/');
              })
              .catch((err) => {
                console.error('Error logging out:', err);
              });
          }

          return newCount;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('contextmenu', disableContextMenu);
      document.removeEventListener('copy', disableCopy);
      document.removeEventListener('paste', disablePaste);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [navigate]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        fetchExamData();
      } else {
        localStorage.setItem('redirectAfterLogin', window.location.pathname);
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchExamData = async () => {
    try {
      const examRef = doc(db, 'exams', examId);
      const examSnap = await getDoc(examRef);
      if (examSnap.exists()) {
        setExamData({ id: examSnap.id, ...examSnap.data() });
      } else {
        setError('Exam not found.');
      }
    } catch (error) {
      console.error('Error fetching exam data:', error);
      setError('Failed to fetch exam data.');
    }
  };

  const handleAnswerChange = (questionIndex, value) => {
    setAnswers({ ...answers, [questionIndex]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    const correctAnswers = examData.questions.map((q) => q.correctAnswer);
    let score = 0;

    correctAnswers.forEach((correctAnswer, index) => {
      if (answers[index] === correctAnswer) {
        score += 1;
      }
    });

    try {
      await addDoc(collection(db, 'results'), {
        studentName: user.email,
        score: score,
        totalQuestions: examData.questions.length,
        examId: examId,
      });
      alert('Your answers have been submitted successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error submitting answers:', error);
      setError('Failed to submit answers. Please try again.');
    }
  };

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return; // Don't submit empty messages

    try {
      await addDoc(collection(db, 'examMessages'), {
        studentName: user.email,
        content: message,
        examId: examId,
        timestamp: new Date(),
      });
      alert('Message sent to the teacher.');
      setMessage(''); // Clear the message input
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    }
  };

  const startExamWithFullscreen = () => {
    // Request fullscreen mode
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { // Firefox
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { // Chrome, Safari, and Opera
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { // IE/Edge
      elem.msRequestFullscreen();
    }

    // Mark exam as started
    setIsExamStarted(true);
  };

  const handleFullscreenChange = () => {
    const isFullscreen = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;

    if (!isFullscreen) {
      setIsInFullscreen(false);
      alert('Please return to fullscreen mode to continue the exam.');
    } else {
      setIsInFullscreen(true);
    }
  };

  useEffect(() => {
    // Listen for fullscreen changes
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      // Clean up listeners when the component unmounts
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const reEnterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { // Firefox
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { // Chrome, Safari, and Opera
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { // IE/Edge
      elem.msRequestFullscreen();
    }
  };

  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="exam-page-container">
      {/* Exam Title */}
      <h2 className="exam-title">{examData ? examData.examName : 'Loading...'}</h2>

      {!isExamStarted ? (
        <div className="start-exam-container">
          {/* Prompt user to start the exam */}
          <button onClick={startExamWithFullscreen} className="start-exam-button">
            Start Exam (Fullscreen)
          </button>
        </div>
      ) : !isInFullscreen ? (
        <div className="fullscreen-warning">
          {/* Prompt to return to fullscreen */}
          <p>You must be in fullscreen mode to continue the exam.</p>
          <button onClick={reEnterFullscreen} className="return-fullscreen-button">
            Return to Fullscreen
          </button>
        </div>
      ) : (
        <div>
          {/* Exam Form */}
          {examData && (
            <form onSubmit={handleSubmit} className="exam-form">
              {examData.questions.map((question, index) => (
                <div key={index} className="question-container">
                  {/* Question Text */}
                  <p className="question-text">{question.question}</p>

                  {/* Options */}
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="option-container">
                      <input
                        type="radio"
                        name={`question_${index}`}
                        value={option}
                        onChange={() => handleAnswerChange(index, option)}
                      />
                      <label>{option}</label>
                    </div>
                  ))}
                </div>
              ))}

              {/* Submit Button */}
              <button type="submit" className="submit-button">Submit Exam</button>
            </form>
          )}

          {/* Message Section */}
          <div className="message-section">
            <h3>Report an Issue</h3>
            <form onSubmit={handleMessageSubmit} className="message-form">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                required
              />
              <button type="submit" className="send-message-button">Send Message</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamPage;
