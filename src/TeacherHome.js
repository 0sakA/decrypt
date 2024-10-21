import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import { auth } from './firebase'; // Import auth from firebase
import { signOut } from 'firebase/auth'; // Import signOut from firebase
import * as XLSX from 'xlsx'; // Import xlsx library
import './TeacherHome.css';

const TeacherHome = () => {
  const [questions, setQuestions] = useState([{ question: '', options: ['', '', '', ''], correctAnswer: '' }]);
  const [examLink, setExamLink] = useState('');
  const [examName, setExamName] = useState('');
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);
  const [exams, setExams] = useState([]); // State for storing exams
  const [messages, setMessages] = useState([]); // State for storing messages

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], correctAnswer: '' }]);
  };

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].question = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const handleCorrectAnswerChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].correctAnswer = value;
    setQuestions(newQuestions);
  };

  const handleCreateExam = async () => {
    try {
      const examDocRef = await addDoc(collection(db, 'exams'), {
        examName: examName,
        questions: questions,
      });

      const examId = examDocRef.id;
      const generatedLink = `${window.location.origin}/exam/${examId}`;
      setExamLink(generatedLink);
      alert('Exam created successfully! The exam link is ready.');
      fetchExams(); // Refresh exam list after creating a new exam
    } catch (error) {
      console.error('Error creating exam:', error.message);
      setError('Failed to create the exam. Please try again.');
    }
  };

  // Fetch exams from Firestore
  const fetchExams = async () => {
    try {
      const examsCollection = collection(db, 'exams');
      const examsSnapshot = await getDocs(examsCollection);
      const examsList = examsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExams(examsList);
    } catch (error) {
      console.error('Error fetching exams:', error.message);
    }
  };

  // Fetch student results from Firestore
  const fetchStudentResults = async () => {
    try {
      const resultsCollection = collection(db, 'results');
      const resultsSnapshot = await getDocs(resultsCollection);
      const resultsList = resultsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setResults(resultsList);
    } catch (error) {
      console.error('Error fetching student results:', error.message);
    }
  };

  // Fetch messages from Firestore
  const fetchMessages = async () => {
    try {
      const messagesCollection = collection(db, 'examMessages');
      const messagesSnapshot = await getDocs(messagesCollection);
      const messagesList = messagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(messagesList);
    } catch (error) {
      console.error('Error fetching messages:', error.message);
    }
  };

  // Delete exam function
  const handleDeleteExam = async (examId) => {
    try {
      await deleteDoc(doc(db, 'exams', examId));
      alert('Exam deleted successfully!');
      fetchExams(); // Refresh exam list after deletion
    } catch (error) {
      console.error('Error deleting exam:', error.message);
    }
  };

  // Logout function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert('Logged out successfully!');
      window.location.href = '/'; // Redirect to home page or login page after logout
    } catch (error) {
      console.error('Error logging out:', error.message);
    }
  };

  // Fetch exams, results, and messages when component mounts
  useEffect(() => {
    fetchExams();
    fetchStudentResults();
    fetchMessages(); // Fetch messages on component mount
  }, []);

  // Group results by exam title
  const groupResultsByExam = () => {
    const groupedResults = {};
    results.forEach(result => {
      const { examId, studentName, score, totalQuestions } = result;
      const exam = exams.find(exam => exam.id === examId);
      if (exam) {
        if (!groupedResults[exam.examName]) {
          groupedResults[exam.examName] = [];
        }
        groupedResults[exam.examName].push({ studentName, score, totalQuestions });
      }
    });
    return groupedResults;
  };

  const resultsByExam = groupResultsByExam();

  // Function to handle Excel file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0]; // Assuming the first sheet
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Process jsonData to extract questions
      const newQuestions = jsonData.map((item) => ({
        question: item.Question, // Column name for question
        options: [
          item.Option1,
          item.Option2,
          item.Option3,
          item.Option4
        ],
        correctAnswer: item.CorrectAnswer // Column name for correct answer
      }));

      setQuestions(newQuestions);
      alert('Questions imported successfully!');
    };

    reader.readAsArrayBuffer(file);
  };

  // Function to export student results to Excel
  const exportResultsToExcel = () => {
    const resultsData = results.map(result => ({
      StudentName: result.studentName,
      ExamId: result.examId,
      Score: result.score,
      TotalQuestions: result.totalQuestions,
    }));

    const worksheet = XLSX.utils.json_to_sheet(resultsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Student Results');

    // Create a file download
    XLSX.writeFile(workbook, 'student_results.xlsx');
  };

  return (
    <div className="page-container">
      <h2>Create Exam</h2>
      <div className="columns-container">
        {/* Create Exam Column */}
        <div className="column create-exam-column">
          <h3>Create Exam</h3>
          <input
            type="text"
            placeholder="Exam Name"
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
            required
          />
          {questions.map((question, index) => (
            <div className="question-section" key={index}>
              <input
                type="text"
                placeholder="Enter question"
                value={question.question}
                onChange={(e) => handleQuestionChange(index, e.target.value)}
              />
              {question.options.map((option, optionIndex) => (
                <input
                  key={optionIndex}
                  type="text"
                  placeholder={`Option ${optionIndex + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, optionIndex, e.target.value)}
                />
              ))}
              <input
                className="correct-answer-input"
                type="text"
                placeholder="Correct answer"
                value={question.correctAnswer}
                onChange={(e) => handleCorrectAnswerChange(index, e.target.value)}
              />
            </div>
          ))}
          <button className="add-question-button" onClick={addQuestion}>Add Question</button>
          <button className="create-exam-button" onClick={handleCreateExam}>Create Exam</button>
          {examLink && (
            <div className="exam-link-section">
              <h4>Exam Link:</h4>
              <a href={examLink} target="_blank" rel="noopener noreferrer">{examLink}</a>
            </div>
          )}
          {error && <p className="error-message">{error}</p>}

          {/* File Upload for Questions */}
          <div className="file-upload-section">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              className="file-input"
            />
            <button className="upload-button" onClick={() => document.querySelector('.file-input').click()}>
              Upload Excel Sheet for Questions
            </button>
          </div>
        </div>

        {/* Created Exams Column */}
        <div className="column created-exams-section">
          <h3>Created Exams</h3>
          {exams.length > 0 ? (
            <ul>
              {exams.map((exam) => (
                <li key={exam.id}>
                  <strong>{exam.examName}</strong>:{' '}
                  <a href={`${window.location.origin}/exam/${exam.id}`} target="_blank" rel="noopener noreferrer">
                    View Exam
                  </a>
                  <button onClick={() => handleDeleteExam(exam.id)} style={{ marginLeft: '10px', color: 'red' }}>
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No exams created yet.</p>
          )}
        </div>

        {/* Student Results Column */}
        <div className="column student-results-column">
          <h3>Student Results</h3>
          {Object.keys(resultsByExam).length > 0 ? (
            <>
              {Object.entries(resultsByExam).map(([examName, results]) => (
                <div key={examName}>
                  <h4>{examName}</h4>
                  <ul>
                    {results.map((result, index) => (
                      <li key={index}>
                        <strong>{result.studentName}</strong>: {result.score} / {result.totalQuestions}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <button className="export-results-button" onClick={exportResultsToExcel}>
                Export Results to Excel
              </button>
            </>
          ) : (
            <p>No results available. Fetch results to see student scores.</p>
          )}
        </div>

        {/* Student Messages Column */}
        <div className="column student-messages-column">
          <h3>Student Messages</h3>
          {messages.length > 0 ? (
            <ul>
              {messages.map((message) => (
                <li key={message.id}>
                  <strong>{message.studentName}</strong>: {message.content}
                </li>
              ))}
            </ul>
          ) : (
            <p>No messages from students.</p>
          )}
        </div>
      </div>

      <button className="logout-button" onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default TeacherHome;
