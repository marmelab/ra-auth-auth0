import React, { useEffect, useState } from 'react';
import { Button, Login as RaLogin, useRedirect } from 'react-admin';
export const Login = ({ client }) => {
    const [isLoading, setIsLoading] = useState(true);
    const redirect = useRedirect();
    useEffect(() => {
        client.isAuthenticated().then(authenticated => {
            if (authenticated) {
                redirect('/');
            }
            setIsLoading(false);
        });
    }, [client, redirect]);

    useEffect(() => {
        const query = window.location.search;
        if (query.includes('code=') && query.includes('state=')) {
            client
                .handleRedirectCallback()
                .then(() => {
                    // For some mysterious reason, this call return "Invalid state" at the first call
                    return window.history.replaceState({}, document.title, '/');
                })
                .catch(error => {
                    console.log('error', error);
                });
        }
    }, [client]);

    const handleLogin = () => {
        client.loginWithRedirect({
            authorizationParams: {
                redirect_uri: window.location.href,
            },
        });
    };

    return (
        <RaLogin>
            <Button label="Login" onClick={handleLogin} disabled={isLoading} />
        </RaLogin>
    );
};
