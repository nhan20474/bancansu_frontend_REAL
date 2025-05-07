import React, { useState } from 'react';
import axios from 'axios';

const Login: React.FC = () => {
    const [mssv, setMssv] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            const response = await axios.post('http://localhost/bcsproject_backend/app/public/api/auth/login.php', {
                mssv,
                password,
            });
            localStorage.setItem('token', response.data.token);
            alert('Login successful');
        } catch (error: any) {
            alert(error.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div>
            <h1>Login</h1>
            <input type="text" placeholder="MSSV" value={mssv} onChange={(e) => setMssv(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleLogin}>Login</button>
        </div>
    );
};

export default Login;