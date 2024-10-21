import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
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
      const userType = userDoc.data().type;

      if (userType === 'teacher') {
        navigate('/teacher-home');
      } else if (userType === 'student') {
        navigate('/student-home');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Redirect to Signup page
  const handleSignupRedirect = () => {
    navigate('/signup'); // Navigate to the Signup page
  };

  return (
    <div className="login-page">
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>

      <p>
        Don't have an account?{' '}
        <span
          style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
          onClick={handleSignupRedirect}
        >
          Signup here
        </span>
      </p>
    </div>
  );
};

export default Login;
