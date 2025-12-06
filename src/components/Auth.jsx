import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export const Auth = ({ onAuthSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState('');

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { credits: 0 } // Initialize 0 credits but handled by DB trigger optimally
                    }
                });
                if (error) throw error;
                setMessage('Check your email for the confirmation link!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                if (onAuthSuccess) onAuthSuccess();
            }
        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel" style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>
                {isSignUp ? '✨ Create Account' : '👋 Welcome Back'}
            </h2>

            <form onSubmit={handleAuth}>
                <div className="form-group">
                    <label>Email</label>
                    <input
                        className="form-input"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input
                        className="form-input"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                {message && (
                    <div style={{
                        padding: '0.75rem',
                        borderRadius: 'var(--radius)',
                        background: message.includes('Check') ? '#f0fdf4' : '#fef2f2',
                        color: message.includes('Check') ? '#166534' : '#991b1b',
                        marginBottom: '1rem',
                        fontSize: '0.9rem'
                    }}>
                        {message}
                    </div>
                )}

                <button
                    className="btn btn-primary"
                    disabled={loading}
                    style={{ width: '100%', marginTop: '1rem' }}
                >
                    {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Log In')}
                </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
                <button
                    className="btn-ghost"
                    onClick={() => setIsSignUp(!isSignUp)}
                    style={{ color: 'var(--primary)' }}
                >
                    {isSignUp ? 'Already have an account? Log In' : 'Need an account? Sign Up'}
                </button>
            </div>
        </div>
    );
};
