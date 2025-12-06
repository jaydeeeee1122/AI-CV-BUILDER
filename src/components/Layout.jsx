import React from 'react';

export const Layout = ({ children }) => {
    return (
        <div className="app-layout">
            <header className="header">
                <div className="container header-content">
                    <div className="logo">AI CV Builder</div>
                    <nav>
                        <a href="#" className="btn btn-outline">Export PDF</a>
                    </nav>
                </div>
            </header>

            <main className="main-content">
                <div className="container">
                    {children}
                </div>
            </main>

            <footer className="footer">
                <div className="container">
                    <p>&copy; {new Date().getFullYear()} AI CV Builder. Built with React & Vite.</p>
                </div>
            </footer>
        </div>
    );
};
