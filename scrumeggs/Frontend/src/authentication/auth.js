import {createAuthProvider} from 'react-token-auth';

export const [useAuth, authFetch, login, logout] =
createAuthProvider({
    accessTokenKey: 'access_token',
    onUpdateToken: (token) => fetch('/api/refresh', {
        method: 'POST',
        body: token.refreshToken
    })
    .then(r => r.json())
});