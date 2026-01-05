import { auth, onAuthStateChanged, signOut } from '../js/firebase-init.js';

// Protect routes
onAuthStateChanged(auth, (user) => {
    if (!user && !window.location.pathname.includes('login.html')) {
        window.location.href = 'login.html';
    } else if (user) {
        console.log('User authenticated:', user.email);
        // Inject Logout Button if sidebar exists
        setupLogoutButton(user);
    }
});

function setupLogoutButton(user) {
    const sidebar = document.querySelector('.sidebar'); // Adjust selector as needed
    if (sidebar && !document.getElementById('logoutBtn')) {
        const userInfo = document.createElement('div');
        userInfo.style.padding = '1rem';
        userInfo.style.borderTop = '1px solid rgba(255,255,255,0.1)';
        userInfo.style.marginTop = 'auto';
        userInfo.style.color = 'white';
        userInfo.style.fontSize = '0.8rem';
        userInfo.innerHTML = `
            <div style="margin-bottom:5px; overflow:hidden; text-overflow:ellipsis;">${user.email}</div>
            <button id="logoutBtn" style="background:transparent; border:1px solid rgba(255,255,255,0.3); color:white; padding:4px 8px; border-radius:4px; cursor:pointer; width:100%;">Cerrar Sesión</button>
        `;
        sidebar.appendChild(userInfo);

        document.getElementById('logoutBtn').addEventListener('click', () => {
            signOut(auth);
        });
    }
}
