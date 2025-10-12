import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function SignIn({ setAuth }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setErr('');
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('Invalid credentials');
      const data = await res.json();
      localStorage.setItem('token', data.token);
      setAuth(true);
      navigate('/');
    } catch (error) {
      setErr('Đăng nhập thất bại');
    }
  };

  return (
    <div>
      <h2>Đăng nhập</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        /><br />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        /><br />
        <button type="submit">Đăng nhập</button>
      </form>
      {err && <div style={{ color: 'red' }}>{err}</div>}
      <div>
        Chưa có tài khoản? <Link to="/signup">Đăng ký</Link>
      </div>
    </div>
  );
}

export default SignIn;
