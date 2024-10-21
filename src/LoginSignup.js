import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import './Login.css';

const LoginSignup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [role, setRole] = useState('student'); // Default role
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if the email is verified
      if (!user.emailVerified) {
        setError('Email not verified. Please check your inbox.');
        return;
      }

      // Check user type (teacher or student) in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userType = userDoc.data().role; // Ensure 'role' is the field name
        if (userType === 'teacher') {
          navigate('/teacher-home');
        } else if (userType === 'student') {
          // Check if there is a redirect link
          const redirectLink = localStorage.getItem('redirectAfterLogin');
          if (redirectLink) {
            localStorage.removeItem('redirectAfterLogin'); // Clear the link after using it
            navigate(redirectLink); // Redirect to the exam link
          } else {
            navigate('/student-home'); // Default redirect for students
          }
        } else {
          setError('User type not recognized.');
        }
      } else {
        setError('User document not found.');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Set user role in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: role, // Use the selected role from the dropdown
      });

      // Send email verification
      await sendEmailVerification(user);
      setError('Verification email sent. Please check your inbox.');
    } catch (err) {
      setError(err.message);
    }
  };

  // Toggle between login and signup
  const toggleForm = () => {
    setIsSignup(!isSignup);
    setError(''); // Clear any error messages when switching forms
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="auth-title">{isSignup ? 'Signup' : 'Login'}</h2>
        {error && <p className="auth-error">{error}</p>}
        <form className="auth-form" onSubmit={isSignup ? handleSignup : handleLogin}>
          <input
            className="auth-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {isSignup && (
            <div className="role-selection">
              <label className="role-option">
                <input
                  type="radio"
                  value="teacher"
                  checked={role === 'teacher'}
                  onChange={() => setRole('teacher')}
                />
                Teacher
              </label>
              <label className="role-option">
                <input
                  type="radio"
                  value="student"
                  checked={role === 'student'}
                  onChange={() => setRole('student')}
                />
                Student
              </label>
            </div>
          )}
          <button className="auth-button" type="submit">
            {isSignup ? 'Signup' : 'Login'}
          </button>
        </form>
  
        <p className="auth-toggle-text">
          {isSignup ? "Already have an account? " : "Don't have an account? "}
          <span
            className="auth-toggle-link"
            onClick={toggleForm}
          >
            {isSignup ? 'Login here' : 'Signup here'}
          </span>
        </p>
      </div>
    </div>
  );
  
};

export default LoginSignup;
