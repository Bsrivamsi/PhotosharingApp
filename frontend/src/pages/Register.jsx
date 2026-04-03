import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AUTH_API } from '../api';

function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const parseErrorMessage = async (response) => {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await response.json();
      return body.message || body.error || JSON.stringify(body);
    }
    const text = await response.text();
    return text || response.statusText || 'Registration failed';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      const response = await fetch(`${AUTH_API}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const error = await parseErrorMessage(response);
        setMessage(error);
        return;
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      localStorage.setItem('userRole', data.role);
      navigate('/');
    } catch (error) {
      setMessage('Unable to reach server. Please ensure backend is running and try again.');
    }
  };

  return (
    <div className="panel">
      <div className="form-panel">
        <h2>Create your account</h2>
        <p>Register to start sharing photos with everyone.</p>
        {message && <div className="alert">{message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Username"
              required
              minLength={4}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Password"
              required
              minLength={6}
            />
          </div>
          <button type="submit">Register</button>
        </form>
        <p style={{ marginTop: '1rem' }}>
          Already have an account? <Link to="/login">Login here</Link>.
        </p>
      </div>
    </div>
  );
}

export default Register;
