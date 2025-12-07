import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from './button';

export const SocialAuthButtons = ({ mode = 'signin' }) => {
    const [loading, setLoading] = useState(null);

    const handleSocialLogin = async (provider) => {
        setLoading(provider);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    // Critical Security: Hardcode the redirect URL to prevent open redirect attacks
                    redirectTo: `${window.location.origin}/dashboard`
                }
            });
            if (error) throw error;
        } catch (error) {
            console.error("Social login error:", error);
            if (error.message.includes("provider is not enabled")) {
                alert(`⚠️ Configuration Required: Please enable ${provider} in your Supabase Dashboard -> Authentication -> Providers.`);
            } else {
                alert(`Failed to sign in with ${provider}: ${error.message}`);
            }
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="flex flex-col gap-3 w-full">
            <Button
                variant="outline"
                type="button"
                onClick={() => handleSocialLogin('google')}
                disabled={loading === 'google'}
                className="w-full relative"
            >
                {loading === 'google' ? (
                    'Connecting...'
                ) : (
                    <>
                        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                        </svg>
                        Continue with Google
                    </>
                )}
            </Button>

            <Button
                variant="outline"
                type="button"
                onClick={() => handleSocialLogin('facebook')}
                disabled={loading === 'facebook'}
                className="w-full relative"
            >
                {loading === 'facebook' ? (
                    'Connecting...'
                ) : (
                    <>
                        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="facebook" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                            <path fill="currentColor" d="M504 256C504 119 393 8 256 8S8 119 8 256c0 125 87 229 206 248V323h-60v-69h60v-46c0-60 36-92 92-92 27 0 51 2 51 2v56h-29c-30 0-38 18-38 36v43h63l-10 69h-53v181c118-19 206-123 206-248z"></path>
                        </svg>
                        Continue with Facebook
                    </>
                )}
            </Button>

            <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        Or continue with email
                    </span>
                </div>
            </div>
        </div>
    );
};
