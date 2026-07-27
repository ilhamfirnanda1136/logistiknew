import type { ReactNode } from 'react';

export default function AuthLoginLayout({ children }: { children: ReactNode }) {
    return (
        <div className="auth-login-wrapper">
            {/* Left panel – ilustrasi */}
            <div className="auth-login-left">
                <div className="auth-login-illustration-card">
                    <img
                        src="/img/login.png"
                        alt="Inventory Management Illustration"
                        className="auth-login-illustration"
                    />
                </div>
            </div>

            {/* Right panel – form */}
            <div className="auth-login-right">
                <div className="auth-login-form-container">
                    {/* Logo + App name */}
                    <div className="auth-login-brand">
                        <img
                            src="/img/logo.png"
                            alt="Logo Logistik & Asset"
                            className="auth-login-logo"
                        />
                        <h1 className="auth-login-title">Logistik &amp; Asset</h1>
                    </div>

                    {/* Konten (form) diteruskan dari halaman login */}
                    {children}
                </div>
            </div>
        </div>
    );
}
