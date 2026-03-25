import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase'; // Make sure the firebase.js file is correctly set up
import './LoginPage.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Handle user sign-in
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(''); // Reset error

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log('Logged in as:', user.email);

      // Check if the user is an admin or staff and navigate accordingly
      if (user.email.toLowerCase().includes('admin')) {
        navigate('/admin-dashboard');  // Redirect to admin dashboard
      } else if (user.email.toLowerCase().includes('staff')) {
        navigate('/staff-dashboard');  // Redirect to staff dashboard
      } else {
        setError('User role not recognized.');
        return;  // Stop if the role is not recognized
      }

      // Update the user document in Firestore
      await setDoc(
        doc(db, 'users', user.uid),
        {
          email: user.email,
          role: user.email.toLowerCase().includes('admin') ? 'admin' : 'staff',  // Set role based on email
          lastLogin: serverTimestamp(),  // Set the last login time
        },
        { merge: true }  // Merge with existing user document, so we don't overwrite other fields
      );
    } catch (error) {
      setError(error.message);  // Display any error message during sign-in
    }
  };

  return (
    <div className="login-container">
      <div className="brand-header">
        <div className="logo-box">
          <span className="logo-icon">📦</span>
        </div>
        <h1>SmartStock</h1>
        <p>Inventory & Recipe Management</p>
      </div>

      <div className="login-card">
        <h2>Welcome Back</h2>
        <p className="subtitle">Sign in to your admin account</p>

        <form onSubmit={handleSignIn}>
          <div className="input-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <span className="icon">✉️</span>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <span className="icon">🔒</span>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <p className="error-message">{error}</p>} {/* Show error if any */}

          <button type="submit" className="sign-in-btn">Sign In</button>
        </form>
      </div>
    </div>
  );
};

export default Login;