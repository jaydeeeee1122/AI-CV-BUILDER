import React from 'react';

export const Layout = ({ children }) => {
    return (
        <div className="container" style={{ paddingTop: '1rem', paddingBottom: '3rem' }}>
            {children}

            <footer style={{
                marginTop: '4rem',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.875rem'
            }}>
                <p>&copy; {new Date().getFullYear()} AI CV Builder. Professional Edition.</p>
            </footer>
        </div>
    );
};
