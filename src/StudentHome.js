import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import './StudentHome.css';

const StudentHome = () => {
  const [exams, setExams] = useState([]);

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

  // Fetch exams when component mounts
  useEffect(() => {
    fetchExams();
  }, []);

  return (
    <div className="student-home">
      <h2>Available Exams</h2>
      <div className="exam-list-container">
        {exams.length > 0 ? (
          <ul>
            {exams.map((exam) => (
              <li key={exam.id}>
                <strong>{exam.examName}</strong>: 
                <a href={`${window.location.origin}/exam/${exam.id}`} target="_blank" rel="noopener noreferrer">
                  Start Exam
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p>No exams available at the moment.</p>
        )}
      </div>
    </div>
  );
  
};

export default StudentHome;
