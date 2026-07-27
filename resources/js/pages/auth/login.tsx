import React from 'react';
import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLoginLayout from '@/layouts/auth/auth-login-layout';
import { store } from '@/routes/login';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Log in" />

            {status && (
                <div className="login-status-message">
                    {status}
                </div>
            )}

            <p className="login-subtitle">Silahkan login menggunakan akun anda</p>

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="login-form"
            >
                {({ processing, errors }) => (
                    <>
                        {Object.keys(errors).length > 0 && (
                            <div className="login-errors">
                                <ul>
                                    {Object.entries(errors).map(([key, error]) => (
                                        <li key={key}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="login-field">
                            <Label htmlFor="username" className="login-label">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                name="username"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="username"
                                className="login-input"
                            />
                            <InputError message={errors.username} />
                        </div>

                        <div className="login-field">
                            <Label htmlFor="password" className="login-label">Password</Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                className="login-input"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="login-remember">
                            <Checkbox
                                id="remember"
                                name="remember"
                                tabIndex={3}
                            />
                            <Label htmlFor="remember" className="login-remember-label">Remember me</Label>
                        </div>

                        <Button
                            type="submit"
                            tabIndex={4}
                            disabled={processing}
                            data-test="login-button"
                            className="login-btn"
                        >
                            {processing && <Spinner />}
                            Sign in
                        </Button>
                    </>
                )}
            </Form>
        </>
    );
}

Login.layout = (page: React.ReactNode) => <AuthLoginLayout>{page}</AuthLoginLayout>;
