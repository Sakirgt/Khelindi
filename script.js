document.addEventListener('DOMContentLoaded', () => {
    // --- Firebase Configuration ---
    // ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
    // >> PASTE YOUR ACTUAL CONFIGURATION OBJECT FROM FIREBASE CONSOLE HERE! <<
    //    Ensure ALL values (apiKey, authDomain, projectId, etc.) are correct.
    // ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
const firebaseConfig = {
        apiKey: "AIzaSyB57Ybfdajo06q9wzLEmpZXPQqg8Ac-gCM", // REPLACE
        authDomain: "kheloindia-2c66c.firebaseapp.com", // REPLACE
        projectId: "kheloindia-2c66c", // REPLACE
        storageBucket: "kheloindia-2c66c.appspot.com", // REPLACE
        messagingSenderId: "753876441074", // REPLACE
        appId: "1:753876441074:web:9e983fe3346a4d45bd3d6b", // REPLACE
        measurementId: "G-L75B55B6SX" // REPLACE (Optional)
    };
    // ▲▲▲ END Firebase Configuration ▲▲▲

    // --- Initialize Firebase Core Services ---
    let auth, db, functions, storage;
    try {
        if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); console.log("Firebase Core Initialized successfully."); }
        else { firebase.app(); console.log("Firebase Core Already Initialized."); }
        auth = firebase.auth(); db = firebase.firestore(); functions = firebase.functions(); storage = firebase.storage();
        console.log("Firebase Service references obtained.");
    } catch (error) {
        console.error("FATAL: Firebase Initialization Error:", error);
        const authContainer = document.getElementById('auth-container');
        const appContainer = document.getElementById('app-container');
        if (appContainer) appContainer.classList.add('hidden');
        if (authContainer) {
            authContainer.classList.remove('hidden'); authContainer.style.display = 'flex';
            authContainer.innerHTML = `<div class="init-error-container card"> <i class="fas fa-exclamation-triangle error-icon"></i> <h2>Initialization Error</h2> <p class="error-text">Could not connect to essential services.</p> <p class="error-suggestion">Please check your internet connection and ensure the app configuration in the code is correct (copied exactly from your Firebase project settings).</p> <p class="error-support">If the problem persists, check the browser console (F12) for more details or contact support.</p> <button onclick="window.location.reload()" class="retry-button"> <i class="fas fa-sync-alt"></i> Refresh </button> </div>`;
        }
        return; // Stop script execution
    }
    // --- End Firebase Initialization ---

    // --- Configuration Constants ---
    const INR_TO_SM_RATE = 10; const SM_TO_INR_RATE = 1 / INR_TO_SM_RATE; const MIN_DEPOSIT_INR = 10; const MIN_WITHDRAW_SM = 100; const dailyRewards = [0.2, 0.1, 0.1, 0.1, 0.1, 0.1, 0.3]; const MAX_STREAK = 7; const DEFAULT_PROFILE_PIC = 'images/default-profile.png'; const PROFILE_PIC_MAX_SIZE_MB = 5;

    // --- DOM Element References ---
    // (All const declarations for elements go here)
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    const mainContent = document.getElementById('main-content');
    const dashboardDetailsContent = document.getElementById('dashboard-details-content');
    const dashboardMainView = document.getElementById('dashboard-main-view');
    const loginPage = document.getElementById('page-login');
    const signupPage = document.getElementById('page-signup');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const showSignupLink = document.getElementById('show-signup');
    const showLoginLink = document.getElementById('show-login');
    const loginErrorMsg = document.getElementById('login-error');
    const signupErrorMsg = document.getElementById('signup-error');
    const loginEmailInput = document.getElementById('login-email');
    const loginPasswordInput = document.getElementById('login-password');
    const signupUsernameInput = document.getElementById('signup-username');
    const signupEmailInput = document.getElementById('signup-email');
    const signupPasswordInput = document.getElementById('signup-password');
    const signupReferralInput = document.getElementById('signup-referral');
    const topBarWallet = document.getElementById('top-bar-wallet');
    const topBarProfilePic = document.getElementById('user-profile-pic');
    const coinBalanceElement = document.getElementById('sm-coin-balance');
    const navButtons = document.querySelectorAll('.nav-button');
    const pages = document.querySelectorAll('#app-container .page');
    const backToDashButtons = document.querySelectorAll('.back-to-dash-btn');
    const homeUsernameElement = document.getElementById('home-username');
    const checkinTrackerElement = document.getElementById('checkin-tracker');
    const referralGridButton = document.getElementById('referral-grid-btn');
    const referralCodePageElement = document.getElementById('referral-code-page');
    const copyRefCodePageButton = document.getElementById('copy-ref-code-btn-page');
    const refCountPageElement = document.getElementById('ref-count-page');
    const refEarningsPageElement = document.getElementById('ref-earnings-page');
    const shareButtonPage = document.getElementById('share-btn-page');
    const chatMessagesContainer = document.getElementById('chat-messages');
    const chatInputElement = document.getElementById('chat-input');
    const sendChatButton = document.getElementById('send-chat-btn');
    const profilePicElement = document.getElementById('user-profile-pic');
    const dashProfilePicElement = document.getElementById('dash-profile-pic');
    const dashUsernameElement = document.getElementById('dash-username');
    const dashEmailElement = document.getElementById('dash-email');
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const dashboardMenuItems = document.querySelectorAll('.dashboard-menu-item');
    const logoutButton = document.getElementById('logout-btn');
    const dashboardDetailSections = document.querySelectorAll('#dashboard-details-content .dashboard-details-section');
    const transactionListElement = document.getElementById('transaction-list');
    const depositForm = document.getElementById('deposit-form');
    const depositAmountInput = document.getElementById('deposit-amount-inr');
    const depositReceiveSpan = document.getElementById('deposit-receive-sm');
    const depositErrorMsg = document.getElementById('deposit-error');
    const initiateDepositBtn = document.getElementById('initiate-deposit-btn');
    const withdrawForm = document.getElementById('withdraw-form');
    const withdrawCurrentBalanceSpan = document.getElementById('withdraw-current-balance');
    const withdrawAmountInput = document.getElementById('withdraw-amount-sm');
    const withdrawReceiveSpan = document.getElementById('withdraw-receive-inr');
    const withdrawUpiInput = document.getElementById('withdraw-upi-id');
    const withdrawErrorMsg = document.getElementById('withdraw-error');
    const requestWithdrawBtn = document.getElementById('request-withdraw-btn');
    const profileSettingsForm = document.getElementById('profile-settings-form');
    const settingUsernameInput = document.getElementById('setting-username');
    const settingPhoneInput = document.getElementById('setting-phone');
    const settingProfilePicFileInput = document.getElementById('setting-profile-pic-file');
    const settingsPicPreview = document.getElementById('settings-pic-preview');
    const changePicButton = document.getElementById('change-pic-button');
    const picUploadStatus = document.getElementById('pic-upload-status');
    const saveSettingsButton = document.getElementById('save-settings-btn');
    const passwordChangeForm = document.getElementById('password-change-form');
    const settingNewPasswordInput = document.getElementById('setting-new-password');
    const changePasswordButton = document.getElementById('change-password-btn');
    const settingsMessageElement = document.getElementById('settings-message');
    const goToMiniGamesBtn = document.getElementById('go-to-mini-games-btn'); // Added mini-game button reference


    // --- App State ---
    let currentUserData = null; let currentUserId = null; let globalChatListener = null; let lastTransactionDoc = null; let selectedProfilePicFile = null;


    // =======================================================================
    //  FUNCTION DEFINITIONS START HERE
    // =======================================================================

    // --- Utility Functions ---
    function formatTimestamp(timestamp) { if (!timestamp || typeof timestamp.toDate !== 'function') { return 'Invalid date'; } try { const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }; return timestamp.toDate().toLocaleString(undefined, options); } catch (e) { console.error("Error formatting timestamp:", e); return 'Error date'; } }
    function getFriendlyAuthError(error) { console.error("Original Error:", error); const code = error?.code; switch (code) { case 'auth/user-not-found': case 'auth/wrong-password': case 'auth/invalid-credential': return 'Invalid email or password.'; case 'auth/invalid-email': return 'Please enter a valid email address.'; case 'auth/email-already-in-use': return 'This email address is already registered.'; case 'auth/weak-password': return 'Password is too weak (minimum 6 characters).'; case 'auth/network-request-failed': return 'Network error. Please check your connection.'; case 'auth/too-many-requests': return 'Too many login attempts. Please try again later.'; case 'auth/requires-recent-login': return 'For security, please log out and log back in to perform this action.'; case 'storage/unauthorized': return 'You do not have permission for this file operation.'; case 'storage/canceled': return 'File operation cancelled.'; case 'storage/object-not-found': return 'File not found.'; case 'storage/quota-exceeded': return 'Storage quota exceeded. Cannot upload file.'; case 'storage/unknown': return 'An unknown storage error occurred.'; case 'unavailable': return 'Service temporarily unavailable. Please try again later.'; case 'permission-denied': return 'You do not have permission for this action.'; default: return error.message || 'An unexpected error occurred. Please try again.'; } }
    function showUserMessage(element, message, isError = true) { if (!element) return; element.textContent = message; element.className = `message ${isError ? 'error' : 'success'}`; element.style.display = message ? 'block' : 'none'; }
    function setLoadingState(button, isLoading, loadingText = "Processing...") { if (!button) return; if (isLoading) { button.disabled = true; if (!button.dataset.originalText) { button.dataset.originalText = button.innerHTML; } button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${loadingText}`; } else { button.disabled = false; button.innerHTML = button.dataset.originalText || 'Submit'; delete button.dataset.originalText; } }

    // --- UI Control Functions ---
    function showAuthPage(pageName) { if (!authContainer || !appContainer || !loginPage || !signupPage) { console.error("Auth UI elements missing!"); return; } appContainer.classList.add('hidden'); authContainer.classList.remove('hidden'); authContainer.style.display = 'flex'; loginPage.classList.remove('active'); signupPage.classList.remove('active'); if (pageName === 'signup') { signupPage.classList.add('active'); } else { loginPage.classList.add('active'); } clearErrorMessages(); console.log("Showing Auth Page:", pageName); }
    function showApp() { if (!authContainer || !appContainer) { console.error("App/Auth container elements missing!"); return; } authContainer.classList.add('hidden'); authContainer.style.display = 'none'; appContainer.classList.remove('hidden'); console.log("Showing Main App Container"); }
    function clearErrorMessages() { if (loginErrorMsg) loginErrorMsg.textContent = ''; if (signupErrorMsg) signupErrorMsg.textContent = ''; if (depositErrorMsg) depositErrorMsg.textContent = ''; if (withdrawErrorMsg) withdrawErrorMsg.textContent = ''; if (settingsMessageElement) showUserMessage(settingsMessageElement, '', false); }
    function clearUserData() { console.log("Clearing user data from UI."); const elementsToClear = [ coinBalanceElement, homeUsernameElement, dashUsernameElement, dashEmailElement, referralCodePageElement, refCountPageElement, refEarningsPageElement, withdrawCurrentBalanceSpan ]; const inputsToClear = [ settingUsernameInput, settingPhoneInput, settingNewPasswordInput, depositAmountInput, withdrawAmountInput, withdrawUpiInput ]; const imagesToReset = [ profilePicElement, dashProfilePicElement, settingsPicPreview ]; const spansToReset = [ depositReceiveSpan, withdrawReceiveSpan ]; elementsToClear.forEach(el => { if (el) { if (el.id === 'sm-coin-balance' || el.id === 'withdraw-current-balance') el.textContent = '0.00'; else if (el.id === 'ref-earnings-page') el.textContent = '0.0'; else if (el.id === 'ref-count-page') el.textContent = '0'; else if (el.id === 'referral-code-page') el.textContent = 'N/A'; else el.textContent = '...'; } }); inputsToClear.forEach(input => { if (input) input.value = ''; }); imagesToReset.forEach(img => { if (img) img.src = DEFAULT_PROFILE_PIC; }); spansToReset.forEach(span => { if (span) span.textContent = span.id === 'deposit-receive-sm' ? '0' : '0.00'; }); if (settingProfilePicFileInput) settingProfilePicFileInput.value = null; selectedProfilePicFile = null; if (picUploadStatus) picUploadStatus.textContent = ''; if (settingsMessageElement) showUserMessage(settingsMessageElement, '', false); if (checkinTrackerElement) checkinTrackerElement.innerHTML = '<p class="loading-indicator">Loading check-in...</p>'; if (transactionListElement) transactionListElement.innerHTML = '<li class="empty-item">No transactions found.</li>'; showMainDashboardView(); }

    // --- Date Helper Functions ---
    function isSameDay(timestamp1, timestamp2) { if (!timestamp1 || !timestamp2 || typeof timestamp1.toDate !== 'function' || typeof timestamp2.toDate !== 'function') return false; try { const date1 = timestamp1.toDate(); const date2 = timestamp2.toDate(); return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate(); } catch (e) { console.error("isSameDay err:", e); return false; } }
    function isYesterday(checkinTimestamp, nowTimestamp) { if (!checkinTimestamp || !nowTimestamp || typeof checkinTimestamp.toDate !== 'function' || typeof nowTimestamp.toDate !== 'function') return false; try { const yesterday = new Date(nowTimestamp.toDate()); yesterday.setDate(yesterday.getDate() - 1); const checkinDate = timestamp.toDate(); return checkinDate.getFullYear() === yesterday.getFullYear() && checkinDate.getMonth() === yesterday.getMonth() && checkinDate.getDate() === yesterday.getDate(); } catch (e) { console.error("isYesterday err:", e); return false; } }

    // --- Daily Check-in ---
    function updateCheckinUI(userData) { if (!checkinTrackerElement) return; checkinTrackerElement.innerHTML = ''; if (!userData) { renderCheckinDays(0, 0, false); return; } const lastCheckin = userData.lastCheckinTimestamp; let currentStreak = userData.checkinStreak || 0; const now = firebase.firestore.Timestamp.now(); let canClaimToday = false; let eligibleDayForReward = 0; let displayStreak = 0; if (!lastCheckin) { canClaimToday = true; eligibleDayForReward = 1; displayStreak = 0; } else if (isSameDay(lastCheckin, now)) { canClaimToday = false; eligibleDayForReward = currentStreak % MAX_STREAK === 0 ? MAX_STREAK : currentStreak % MAX_STREAK; displayStreak = eligibleDayForReward; } else if (isYesterday(lastCheckin, now)) { canClaimToday = true; eligibleDayForReward = (currentStreak % MAX_STREAK) + 1; displayStreak = currentStreak % MAX_STREAK; } else { canClaimToday = true; eligibleDayForReward = 1; displayStreak = 0; } console.log(`Checkin State: canClaim=${canClaimToday}, rewardDay=${eligibleDayForReward}, displayStreak=${displayStreak}`); renderCheckinDays(displayStreak, eligibleDayForReward, canClaimToday); }
    function renderCheckinDays(completedStreakCount, currentRewardDay, isEligibleToClaim) { if (!checkinTrackerElement) return; checkinTrackerElement.innerHTML = ''; completedStreakCount = Math.min(completedStreakCount, MAX_STREAK); for (let i = 1; i <= MAX_STREAK; i++) { const dayDiv = document.createElement('div'); dayDiv.classList.add('checkin-day'); dayDiv.dataset.day = i; const circleDiv = document.createElement('div'); circleDiv.classList.add('checkin-day-circle'); const labelDiv = document.createElement('div'); labelDiv.classList.add('checkin-day-label'); labelDiv.textContent = `Day ${i}`; if (isEligibleToClaim && i === currentRewardDay) { dayDiv.classList.add('today', 'eligible'); circleDiv.innerHTML = '<i class="fas fa-gift"></i>'; labelDiv.textContent = 'Claim!'; dayDiv.addEventListener('click', handleDayClick); } else if (!isEligibleToClaim && i === currentRewardDay && completedStreakCount >= i) { dayDiv.classList.add('completed'); circleDiv.innerHTML = '<i class="fas fa-check"></i>'; labelDiv.textContent = 'Claimed'; } else if (i <= completedStreakCount) { dayDiv.classList.add('completed'); circleDiv.innerHTML = '<i class="fas fa-check"></i>'; } else { dayDiv.classList.add('future'); const futureReward = dailyRewards[i - 1] || 0; circleDiv.textContent = `${futureReward.toFixed(1)}`; } dayDiv.appendChild(circleDiv); dayDiv.appendChild(labelDiv); checkinTrackerElement.appendChild(dayDiv); } }
    async function handleDayClick(event) {
        const clickedDayDiv = event.currentTarget;
        if (!clickedDayDiv || clickedDayDiv.classList.contains('claiming') || !clickedDayDiv.classList.contains('eligible')) return;
        const day = parseInt(clickedDayDiv.dataset.day, 10);
        if (isNaN(day) || day < 1 || day > MAX_STREAK || !auth.currentUser) return;
        clickedDayDiv.classList.add('claiming');
        clickedDayDiv.removeEventListener('click', handleDayClick);
        const circle = clickedDayDiv.querySelector('.checkin-day-circle');
        const originalCircleHTML = circle ? circle.innerHTML : '';
        if (circle) circle.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        console.log(`Attempting to claim check-in reward for Day ${day} via Cloud Function`);
        try {
            const claimCheckinReward = functions.httpsCallable('claimDailyReward');
            const result = await claimCheckinReward();
            console.log("Cloud Function 'claimDailyReward' Success:", result.data);
            await fetchUserData(auth.currentUser);
        } catch (error) {
	    console.error("Error claiming check-in reward (Cloud Function call failed):", error);
            console.log("Full error object:", error);
            alert(`Failed to claim reward: ${getFriendlyAuthError(error)}`);
            if (document.contains(clickedDayDiv)) {
                clickedDayDiv.classList.remove('claiming');
                clickedDayDiv.addEventListener('click', handleDayClick);
                if (circle) circle.innerHTML = originalCircleHTML;
            }
        }
    }

    // --- Data Fetching & User Profile ---
    function updateUIWithUserData(authUser, firestoreData) { console.log("Updating UI with fetched user data..."); if (!authUser || !firestoreData) { console.warn("updateUIWithUserData: Called with invalid data, clearing UI."); clearUserData(); return; } try { const balance = firestoreData.smCoinBalance ?? 0; if (coinBalanceElement) coinBalanceElement.textContent = balance.toFixed(2); if (withdrawCurrentBalanceSpan) withdrawCurrentBalanceSpan.textContent = balance.toFixed(2); const profilePicUrl = firestoreData.profilePictureUrl || DEFAULT_PROFILE_PIC; if (profilePicElement) profilePicElement.src = profilePicUrl; if (dashProfilePicElement) dashProfilePicElement.src = profilePicUrl; const username = firestoreData.username || 'User'; if (homeUsernameElement) homeUsernameElement.textContent = username; if (dashUsernameElement) dashUsernameElement.textContent = username; if (dashEmailElement) dashEmailElement.textContent = authUser.email || firestoreData.email || 'N/A'; if (referralCodePageElement) referralCodePageElement.textContent = firestoreData.referralCode || 'N/A'; if (refCountPageElement) refCountPageElement.textContent = firestoreData.totalReferrals?.toString() ?? '0'; if (refEarningsPageElement) refEarningsPageElement.textContent = (firestoreData.referralEarnings ?? 0).toFixed(1); updateCheckinUI(firestoreData); console.log("UI update completed."); } catch (uiError) { console.error("Error occurred during UI update:", uiError); } }
    async function fetchUserData(user) { if (!db) throw new Error("Database service unavailable"); if (!user || !user.uid) throw new Error("Invalid user for fetching data"); const userId = user.uid; console.log(`fetchUserData: Fetching data for UID: ${userId}`); try { const userDocRef = db.collection('users').doc(userId); const docSnap = await userDocRef.get({ source: 'server' }); if (docSnap.exists) { currentUserData = docSnap.data(); console.log("fetchUserData: User data found:", currentUserData); updateUIWithUserData(user, currentUserData); return currentUserData; } else { console.warn("fetchUserData: No user document found for UID:", userId); currentUserData = null; clearUserData(); throw new Error("User profile not found in database."); } } catch (error) { console.error(`fetchUserData: Error for UID ${userId}:`, error); currentUserData = null; throw new Error(`Failed to load profile: ${getFriendlyAuthError(error)}`); } }
    async function createUserProfileInFirestore(userId, username, email, referredByCode) { if (!db) throw new Error("Firestore service not available"); if (!userId || !username || !email) throw new Error("Missing data for profile creation"); const userDocRef = db.collection('users').doc(userId); const newReferralCode = generateReferralCode(username); const initialCoins = 0; let signupBonus = 0; let processedReferrer = null; if (referredByCode) { console.log(`Checking referral code: ${referredByCode}`); try { const referrerQuery = await db.collection('users').where('referralCode', '==', referredByCode).limit(1).get(); if (!referrerQuery.empty) { const referrerDoc = referrerQuery.docs[0]; processedReferrer = referrerDoc.id; signupBonus = 1; console.log(`Valid referral code found for user ID: ${processedReferrer}. Awarding signup bonus.`); console.warn("Referrer credit needs to be implemented via Cloud Function for security."); } else { console.warn(`Referral code ${referredByCode} not found.`); } } catch (refError) { console.error("Error checking referral code:", error); } } const userProfileData = { username: username, email: email.toLowerCase(), smCoinBalance: initialCoins + signupBonus, referralCode: newReferralCode, referredBy: processedReferrer, createdAt: firebase.firestore.FieldValue.serverTimestamp(), profilePictureUrl: DEFAULT_PROFILE_PIC, phoneNumber: null, lastLogin: firebase.firestore.FieldValue.serverTimestamp(), tournamentsPlayed: 0, tournamentsWon: 0, miniGamesPlayed: 0, totalReferrals: 0, referralEarnings: 0, lastCheckinTimestamp: null, checkinStreak: 0, }; try { await userDocRef.set(userProfileData); console.log("User profile created successfully in Firestore for:", userId); if (signupBonus > 0) { await addTransaction(userId, 'signup_bonus', signupBonus, { referredBy: processedReferrer }); console.log("Signup bonus transaction recorded."); } } catch (error) { console.error("Error writing user profile to Firestore:", error); throw new Error("Failed to create user profile database entry."); } }
    function generateReferralCode(username) { const namePart = username.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase(); const randomPart = Array.from({ length: 6 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]).join(''); return `${namePart}${randomPart}`.substring(0, 10); }

    // --- Global Chat ---
    const CHAT_COLLECTION = 'globalChatMessages'; // Define collection name

    function loadAndListenChat() {
        if (!db || !chatMessagesContainer) {
            console.error("Cannot load: Firestore or chat container missing.");
            if(chatMessagesContainer) chatMessagesContainer.innerHTML = '<p class="error-message">Chat service unavailable.</p>';
            return;
        }
        if (globalChatListener) {
            console.log("Chat listener already active.");
            return; // Don't attach multiple listeners
        }

        console.log("Attaching chat listener...");
        chatMessagesContainer.innerHTML = '<p class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Loading chat...)</p>';

        try {
            globalChatListener = db.collection(CHAT_COLLECTION)
                .orderBy('timestamp', 'asc')
                .limitToLast(50) // Limit initial load/listener to last 50 messages
                .onSnapshot(snapshot => {
                    console.log(`Chat snapshot received: ${snapshot.docs.length} messages.`);
                    if (snapshot.empty) {
                        chatMessagesContainer.innerHTML = '<p class="empty-item">No messages yet. Be the first!</p>';
                        return;
                    }
                    // Use a DocumentFragment for performance when adding many messages
                    const fragment = document.createDocumentFragment();
                    snapshot.docs.forEach(doc => {
                        fragment.appendChild(createChatMessageElement(doc.data()));
                    });

                    // Clear container and append all messages at once
                    chatMessagesContainer.innerHTML = '';
                    chatMessagesContainer.appendChild(fragment);

                    scrollToChatBottom();
                }, error => {
                    console.error("Error listening to chat messages:", error);
                    chatMessagesContainer.innerHTML = `<p class="error-message">Error loading chat: ${getFriendlyAuthError(error)}</p>`;
                    detachChatListener(); // Detach listener on error
                });
        } catch (error) {
            console.error("Failed to attach chat listener:", error);
            chatMessagesContainer.innerHTML = `<p class="error-message">Failed to initialize chat: ${getFriendlyAuthError(error)}</p>`;
            detachChatListener();
        }
    }

    function createChatMessageElement(messageData) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message-item');

        // Add class if message is from current user
        if (messageData.userId === currentUserId) {
            messageDiv.classList.add('current-user-message');
        }

        const senderSpan = document.createElement('span');
        senderSpan.classList.add('message-sender');
        senderSpan.textContent = `${messageData.username || 'User'}:`; // Use username or fallback

        const textSpan = document.createElement('span');
        textSpan.classList.add('message-text');
        textSpan.textContent = messageData.text || ''; // Message text

        // Optional: Add timestamp (consider formatting)
        // const timeSpan = document.createElement('span');
        // timeSpan.textContent = messageData.timestamp ? formatTimestamp(messageData.timestamp) : '';

        messageDiv.appendChild(senderSpan);
        messageDiv.appendChild(textSpan);
        // messageDiv.appendChild(timeSpan); // Uncomment to show timestamp

        return messageDiv;
    }

    // Renamed from displayChatMessage to createChatMessageElement for clarity

    async function sendChatMessage() {
        if (!db || !auth.currentUser || !currentUserData || !chatInputElement || !sendChatButton) {
            console.error("Cannot send chat message: Missing services, user data, or elements.");
            alert("Cannot send message. Please ensure you are logged in and try again.");
            return;
        }

        const messageText = chatInputElement.value.trim();
        if (!messageText) {
            return; // Don't send empty messages
        }

        const userId = currentUserId;
        const username = currentUserData.username || 'Anonymous'; // Use fetched username

        setLoadingState(sendChatButton, true, ""); // Show spinner on button

        try {
            await db.collection(CHAT_COLLECTION).add({
                text: messageText,
                userId: userId,
                username: username,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log("Chat message sent successfully.");
            chatInputElement.value = ''; // Clear input field
            // scrollToChatBottom(); // Let onSnapshot handle scrolling
        } catch (error) {
            console.error("Error sending chat message:", error);
            alert(`Failed to send message: ${getFriendlyAuthError(error)}`);
        } finally {
            setLoadingState(sendChatButton, false); // Restore button
            chatInputElement.focus(); // Keep focus on input
        }
    }

    function detachChatListener() {
        if (globalChatListener && typeof globalChatListener === 'function') {
            console.log("Detaching chat listener.");
            globalChatListener(); // Call the unsubscribe function
            globalChatListener = null;
        } else {
            // console.log("No active chat listener to detach.");
        }
    }

    function scrollToChatBottom() {
        if(chatMessagesContainer) {
            // Use setTimeout to ensure scroll happens after DOM update from onSnapshot
            setTimeout(() => {
                chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
            }, 0);
        }
    }

    // --- Navigation ---
    function switchPage(pageId) { console.log(`Attempting to switch to page: ${pageId}`); if (!mainContent || !appContainer || appContainer.classList.contains('hidden')) { console.warn("switchPage called while app container is hidden or mainContent missing."); return; } const currentPage = document.querySelector('#app-container .page.active'); if (currentPage && currentPage.id === 'page-dashboard' && pageId !== 'dashboard') { const isDetailViewActive = Array.from(dashboardDetailSections).some(section => !section.classList.contains('hidden')); if (isDetailViewActive) { showMainDashboardView(); } } pages.forEach(page => page.classList.remove('active')); const targetPage = document.getElementById(`page-${pageId}`); if (targetPage) { targetPage.classList.add('active'); mainContent.scrollTop = 0; console.log(`Switched to page: ${pageId}`); if (pageId === 'global-chat') { loadAndListenChat(); setTimeout(scrollToChatBottom, 100); } else { detachChatListener(); } if (pageId === 'dashboard') { if (!Array.from(dashboardDetailSections).some(section => !section.classList.contains('hidden'))) { showMainDashboardView(); } } if (pageId === 'referral' && currentUserData) { if (referralCodePageElement) referralCodePageElement.textContent = currentUserData.referralCode || 'N/A'; if (refCountPageElement) refCountPageElement.textContent = currentUserData.totalReferrals?.toString() ?? '0'; if (refEarningsPageElement) refEarningsPageElement.textContent = (currentUserData.referralEarnings ?? 0).toFixed(1); } } else { console.error(`Page 'page-${pageId}' not found. Switching to home.`); const homePage = document.getElementById('page-home'); if(homePage) homePage.classList.add('active'); pageId = 'home'; } navButtons.forEach(button => { button.classList.toggle('active', button.dataset.page === pageId); }); }

    // --- Dashboard Section Logic ---
    function showMainDashboardView() { if (!dashboardMainView || !dashboardDetailsContent) return; dashboardDetailSections.forEach(section => section.classList.add('hidden')); dashboardMainView.classList.remove('hidden'); dashboardDetailsContent.classList.add('hidden'); console.log("Showing main dashboard view"); }
    function showDashboardSection(sectionId) { if (!sectionId || !dashboardDetailsContent || !dashboardMainView) return; console.log(`Showing dashboard detail section: ${sectionId}`); dashboardMainView.classList.add('hidden'); dashboardDetailSections.forEach(section => section.classList.add('hidden')); const targetSection = document.getElementById(`details-${sectionId}`); if (targetSection) { dashboardDetailsContent.classList.remove('hidden'); targetSection.classList.remove('hidden'); loadDataForDashboardSection(sectionId); } else { console.error(`Dashboard detail section content for 'details-${sectionId}' not found.`); showMainDashboardView(); } }
    function loadDataForDashboardSection(sectionId) { if (!currentUserData) { console.warn("Cannot load dashboard section data, currentUserData is null."); const targetSection = document.getElementById(`details-${sectionId}`); if(targetSection) targetSection.innerHTML = '<p class="error-message">Could not load data. Please refresh.</p>'; return; } switch (sectionId) { case 'wallet-history': fetchWalletHistory(); break; case 'deposit': if(depositAmountInput) depositAmountInput.value = ''; if(depositErrorMsg) depositErrorMsg.textContent = ''; updateDepositConversion(); break; case 'withdraw': if(withdrawCurrentBalanceSpan) withdrawCurrentBalanceSpan.textContent = currentUserData.smCoinBalance?.toFixed(2) ?? '0.00'; if(withdrawAmountInput) withdrawAmountInput.value = ''; if(withdrawUpiInput) withdrawUpiInput.value = currentUserData.upiId || ''; if(withdrawErrorMsg) withdrawErrorMsg.textContent = ''; updateWithdrawConversion(); break; case 'settings': if(settingUsernameInput) settingUsernameInput.value = currentUserData.username || ''; if(settingPhoneInput) settingPhoneInput.value = currentUserData.phoneNumber || ''; if(settingProfilePicFileInput) settingProfilePicFileInput.value = null; selectedProfilePicFile = null; if(settingsPicPreview) settingsPicPreview.src = currentUserData.profilePictureUrl || DEFAULT_PROFILE_PIC; if(picUploadStatus) picUploadStatus.textContent = ''; if(settingNewPasswordInput) settingNewPasswordInput.value = ''; if(settingsMessageElement) showUserMessage(settingsMessageElement, '', false); break; case 'tournament-history': fetchTournamentHistory(); break; case 'game-history': fetchGameHistory(); break; default: console.warn(`No specific data loading logic defined for dashboard section: ${sectionId}`); } }

    // --- Wallet History ---
    async function fetchWalletHistory(loadMore = false) { if (!db || !currentUserId || !transactionListElement) return; console.log(`Fetching wallet history... Load More: ${loadMore}`); const loadingLiClass = 'loading-item'; const emptyLiClass = 'empty-item'; if (!loadMore) { transactionListElement.innerHTML = `<li class="${loadingLiClass}"><i class="fas fa-spinner fa-spin"></i> Loading transactions...</li>`; lastTransactionDoc = null; } else { const existingLoader = transactionListElement.querySelector(`.${loadingLiClass}`); if (!existingLoader) { const loadingLi = document.createElement('li'); loadingLi.className = loadingLiClass; loadingLi.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Loading more...`; transactionListElement.appendChild(loadingLi); } } try { let query = db.collection('users').doc(currentUserId).collection('transactions').orderBy('timestamp', 'desc').limit(25); if (loadMore && lastTransactionDoc) { query = query.startAfter(lastTransactionDoc); } const snapshot = await query.get(); const loader = transactionListElement.querySelector(`.${loadingLiClass}`); if (loader) loader.remove(); if (!loadMore && snapshot.empty) { transactionListElement.innerHTML = `<li class="${emptyLiClass}">No transactions found.</li>`; return; } if (loadMore && snapshot.empty) { const noMoreLi = document.createElement('li'); noMoreLi.className = emptyLiClass; noMoreLi.style.textAlign = 'center'; noMoreLi.style.padding = '10px'; noMoreLi.textContent = "No more transactions."; transactionListElement.appendChild(noMoreLi); return; } if (!loadMore) { transactionListElement.innerHTML = ''; } snapshot.docs.forEach(doc => { displayTransaction(doc.data()); }); lastTransactionDoc = snapshot.docs[snapshot.docs.length - 1]; } catch (error) { console.error("Error fetching wallet history:", error); const loader = transactionListElement.querySelector(`.${loadingLiClass}`); if (loader) loader.remove(); if (!loadMore || transactionListElement.children.length === 0) { transactionListElement.innerHTML = `<li class="error-message" style="padding: 15px;">Error loading transactions. Please try again.</li>`; } else { const errorLi = document.createElement('li'); errorLi.className = 'error-message'; errorLi.style.padding = '15px'; errorLi.textContent = 'Error loading more transactions.'; transactionListElement.appendChild(errorLi); } } }
    function displayTransaction(data) { if (!transactionListElement || !data || !data.timestamp) return; const li = document.createElement('li'); li.classList.add('transaction-item'); const infoDiv = document.createElement('div'); infoDiv.classList.add('transaction-info'); const descSpan = document.createElement('span'); descSpan.classList.add('description'); descSpan.textContent = getTransactionDescription(data); const timeSpan = document.createElement('span'); timeSpan.classList.add('timestamp'); timeSpan.textContent = formatTimestamp(data.timestamp); infoDiv.appendChild(descSpan); infoDiv.appendChild(timeSpan); const amountDiv = document.createElement('div'); amountDiv.classList.add('transaction-amount'); const amount = data.amount ?? 0; if (amount > 0) { amountDiv.classList.add('positive'); amountDiv.textContent = `+${amount.toFixed(1)} SM`; } else if (amount < 0) { amountDiv.classList.add('negative'); amountDiv.textContent = `${amount.toFixed(1)} SM`; } else { amountDiv.textContent = `0.0 SM`; } li.appendChild(infoDiv); li.appendChild(amountDiv); transactionListElement.appendChild(li); }
    function getTransactionDescription(data) { switch (data.type) { case 'daily_checkin': return `Daily Check-in Bonus (Day ${data.day || '?'})`; case 'referral_bonus': return `Referral Bonus Awarded`; case 'signup_bonus': return `Signup Bonus (Referred)`; case 'tournament_entry': return `Tournament Entry Fee (${data.tournamentName || 'Unknown'})`; case 'tournament_win': return `Tournament Prize (${data.tournamentName || 'Unknown'} - Rank ${data.rank || '?'})`; case 'admin_adjust': return `Admin Balance Adjustment (${data.reason || 'No reason'})`; case 'deposit_success': return `Deposit Received (₹${(data.inrAmount ?? 0).toFixed(2)})`; /* Changed type */ case 'withdrawal_request': return `Withdrawal Requested (₹${(data.inrAmount ?? 0).toFixed(2)})`; /* Changed type */ default: return data.description || data.type || 'Unknown Transaction'; } }
    async function addTransaction(userId, type, amount, details = {}) { if (!db || !userId || !type || amount === undefined || amount === null) { console.error("Missing data for addTransaction"); return; } try { const transactionRef = db.collection('users').doc(userId).collection('transactions'); await transactionRef.add({ type: type, amount: amount, timestamp: firebase.firestore.FieldValue.serverTimestamp(), ...details }); console.log(`Transaction recorded: Type=${type}, Amount=${amount}`); } catch (error) { console.error("Error adding transaction record:", error); } }

    // --- Placeholder History Functions ---
    function fetchTournamentHistory() { console.log("Fetching tournament history (placeholder)..."); const container = document.getElementById('tournament-history-content'); if(container) container.textContent = 'Your past tournament results will appear here soon.'; }
    function fetchGameHistory() { console.log("Fetching game history (placeholder)..."); const container = document.getElementById('game-history-content'); if(container) container.textContent = 'Your recent mini-game activity will appear here soon.'; }

    // --- Deposit / Withdrawal ---
    function updateDepositConversion() { if (!depositAmountInput || !depositReceiveSpan) return; const amountINR = parseFloat(depositAmountInput.value) || 0; const amountSM = amountINR * INR_TO_SM_RATE; depositReceiveSpan.textContent = amountSM.toFixed(0); }
    function updateWithdrawConversion() { if (!withdrawAmountInput || !withdrawReceiveSpan) return; const amountSM = parseFloat(withdrawAmountInput.value) || 0; const amountINR = amountSM * SM_TO_INR_RATE; withdrawReceiveSpan.textContent = amountINR.toFixed(2); }
    async function handleDepositSubmit(event) { event.preventDefault(); if (!depositAmountInput || !initiateDepositBtn || !depositErrorMsg) return; if (!currentUserData || !currentUserId || !auth.currentUser) { showUserMessage(depositErrorMsg, "User not logged in.", true); return; } const amountINR = parseFloat(depositAmountInput.value); showUserMessage(depositErrorMsg, "", false); if (isNaN(amountINR) || amountINR < MIN_DEPOSIT_INR) { showUserMessage(depositErrorMsg, `Minimum deposit amount is ₹${MIN_DEPOSIT_INR}.`, true); return; } setLoadingState(initiateDepositBtn, true, "Initiating..."); console.log(`Calling Cloud Function 'initiateDeposit' with amount: ₹${amountINR}`); try { const initiateDeposit = functions.httpsCallable('initiateDeposit'); const result = await initiateDeposit({ amount: amountINR }); console.log("Cloud Function 'initiateDeposit' Success:", result.data); alert(`Deposit initiated (Simulated)! You would be redirected. Order ID: ${result.data.orderId || 'N/A'}`); depositAmountInput.value = ''; updateDepositConversion(); } catch (error) { console.error("Error initiating deposit (Cloud Function call failed):", error); showUserMessage(depositErrorMsg, `Failed to initiate deposit: ${getFriendlyAuthError(error)}`, true); } finally { setLoadingState(initiateDepositBtn, false); } }
    async function handleWithdrawSubmit(event) { event.preventDefault(); if (!withdrawAmountInput || !withdrawUpiInput || !requestWithdrawBtn || !withdrawErrorMsg || !currentUserData || !currentUserId || !auth.currentUser) { showUserMessage(withdrawErrorMsg, "Cannot process withdrawal. Missing info or not logged in.", true); return; } const amountSM = parseFloat(withdrawAmountInput.value) || 0; const upiId = withdrawUpiInput.value.trim(); const currentBalance = currentUserData.smCoinBalance || 0; showUserMessage(withdrawErrorMsg, "", false); if (isNaN(amountSM) || amountSM < MIN_WITHDRAW_SM) { showUserMessage(withdrawErrorMsg, `Minimum withdrawal amount is ${MIN_WITHDRAW_SM} SM Coins.`, true); return; } if (amountSM > currentBalance) { showUserMessage(withdrawErrorMsg, "Insufficient balance.", true); return; } if (!upiId || !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiId)) { showUserMessage(withdrawErrorMsg, "Please enter a valid UPI ID (e.g., yourname@bank).", true); return; } setLoadingState(requestWithdrawBtn, true, "Requesting..."); console.log(`Calling Cloud Function 'requestWithdrawal' with amount: ${amountSM} SM, UPI: ${upiId}`); try { const requestWithdrawal = functions.httpsCallable('requestWithdrawal'); const result = await requestWithdrawal({ amountSM: amountSM, upiId: upiId }); console.log("Cloud Function 'requestWithdrawal' Success:", result.data); alert(`Withdrawal request submitted successfully! Request ID: ${result.data.requestId || 'N/A'}. It will be processed soon.`); await fetchUserData(auth.currentUser); withdrawAmountInput.value = ''; updateWithdrawConversion(); } catch (error) { console.error("Error requesting withdrawal (Cloud Function call failed):", error); showUserMessage(withdrawErrorMsg, `Failed to request withdrawal: ${getFriendlyAuthError(error)}`, true); } finally { setLoadingState(requestWithdrawBtn, false); } }

    // --- Settings Logic ---
    async function uploadProfilePicture(file) { if (!storage || !currentUserId || !file) { throw new Error("Storage service not available or missing data for upload."); } console.log(`Uploading profile picture: ${file.name}`); const filePath = `profilePictures/${currentUserId}/${Date.now()}_${file.name}`; const storageRef = storage.ref(filePath); try { if (picUploadStatus) { picUploadStatus.textContent = "Uploading..."; picUploadStatus.classList.add('uploading'); picUploadStatus.classList.remove('error'); } const snapshot = await storageRef.put(file); const downloadURL = await snapshot.ref.getDownloadURL(); console.log("File uploaded successfully. URL:", downloadURL); if (picUploadStatus) { picUploadStatus.textContent = "Upload successful!"; picUploadStatus.classList.remove('uploading'); } return downloadURL; } catch (error) { console.error("Error uploading profile picture:", error); if (picUploadStatus) { picUploadStatus.textContent = "Upload failed!"; picUploadStatus.classList.add('error'); picUploadStatus.classList.remove('uploading'); } throw new Error(`Failed to upload image: ${getFriendlyAuthError(error)}`); } }
    async function handleProfileSettingsSave(event) { event.preventDefault(); if (!db || !currentUserId || !currentUserData || !settingUsernameInput || !settingPhoneInput || !saveSettingsButton || !auth.currentUser) { showUserMessage(settingsMessageElement, "Cannot save settings. Missing data or not logged in.", true); return; } const newUsername = settingUsernameInput.value.trim(); const newPhoneNumber = settingPhoneInput.value.trim() || null; if (!newUsername || newUsername.length < 3) { showUserMessage(settingsMessageElement, "Username must be at least 3 characters long.", true); return; } setLoadingState(saveSettingsButton, true, "Saving..."); showUserMessage(settingsMessageElement, "", false); let profilePicUrl = currentUserData.profilePictureUrl || null; let picUploadPromise = Promise.resolve(); if (selectedProfilePicFile) { picUploadPromise = uploadProfilePicture(selectedProfilePicFile) .then(url => { profilePicUrl = url; selectedProfilePicFile = null; if(settingProfilePicFileInput) settingProfilePicFileInput.value = null; }) .catch(error => { throw error; }); } try { await picUploadPromise; const updates = {}; let changed = false; if (profilePicUrl !== (currentUserData.profilePictureUrl || null)) { updates.profilePictureUrl = profilePicUrl; changed = true;} if (newUsername !== (currentUserData.username || '')) { updates.username = newUsername; changed = true;} if (newPhoneNumber !== (currentUserData.phoneNumber || null)) { updates.phoneNumber = newPhoneNumber; changed = true;} if (changed) { console.log("Updating Firestore profile with:", updates); await db.collection('users').doc(currentUserId).update(updates); showUserMessage(settingsMessageElement, "Profile updated successfully!", false); await fetchUserData(auth.currentUser); } else { if (!picUploadStatus || !picUploadStatus.textContent.includes("successful")) { showUserMessage(settingsMessageElement, "No changes detected.", false); } console.log("No profile data changes detected to save."); } } catch (error) { console.error("Error saving profile settings:", error); if (!settingsMessageElement.textContent || !settingsMessageElement.textContent.includes("upload")) { showUserMessage(settingsMessageElement, `Error saving profile: ${getFriendlyAuthError(error)}`, true); } } finally { setLoadingState(saveSettingsButton, false); if (settingsMessageElement.textContent && !settingsMessageElement.textContent.includes("failed")) { if(picUploadStatus && picUploadStatus.textContent.includes("successful")) { /* Optionally clear status */ } else if (picUploadStatus) { picUploadStatus.textContent = ''; } } } }
    async function handlePasswordChange(event) { event.preventDefault(); if (!auth.currentUser || !settingNewPasswordInput || !changePasswordButton) { showUserMessage(settingsMessageElement, "Cannot change password. Not logged in or elements missing.", true); return; } const newPassword = settingNewPasswordInput.value; showUserMessage(settingsMessageElement, "", false); if (newPassword.length < 6) { showUserMessage(settingsMessageElement, "New password must be at least 6 characters long.", true); return; } setLoadingState(changePasswordButton, true, "Updating..."); try { await auth.currentUser.updatePassword(newPassword); showUserMessage(settingsMessageElement, "Password updated successfully!", false); settingNewPasswordInput.value = ''; } catch (error) { console.error("Error changing password:", error); showUserMessage(settingsMessageElement, `Error: ${getFriendlyAuthError(error)}`, true); if (error.code === 'auth/requires-recent-login') { alert("For security, please log out and log back in before changing your password."); } } finally { setLoadingState(changePasswordButton, false); } }

    // =======================================================================
    //  FUNCTION DEFINITIONS END HERE
    // =======================================================================


    // --- Authentication State Listener ---
    // This needs to be defined AFTER its dependencies (fetchUserData, switchPage, etc.)
    auth.onAuthStateChanged(async user => {
        console.log("Auth State Changed detected.");
        if (user) {
            currentUserId = user.uid;
            console.log("Auth State Changed: User logged in, UID:", currentUserId);
            showApp(); // Show app container FIRST
            try {
                console.log("Auth State Changed: Attempting initial fetchUserData...");
                await fetchUserData(user); // Fetch data
                console.log("Auth State Changed: Initial fetchUserData successful.");
                switchPage('home'); // Navigate AFTER fetch (and UI update)
            } catch (fetchError) {
                console.error("Auth State Changed: Error during initial fetchUserData:", fetchError);
                alert(`Error loading your profile: ${getFriendlyAuthError(fetchError)}. Some features might be limited.`);
                switchPage('home'); // Go home even on error
            }
        } else {
            currentUserId = null; currentUserData = null;
            console.log("Auth State Changed: User logged out.");
            showAuthPage('login'); // Show login page
            clearUserData(); // Clear UI
            detachChatListener(); // Clean up listeners
        }
    });


    // --- Event Listeners Setup Function Definition ---
    // Define this function AFTER all the functions it calls are defined
    function setupEventListeners() {
        console.log("Setting up event listeners...");

        // --- Helper to safely add listeners ---
        function safeAddEventListener(selector, event, handler, parent = document) {
            const element = parent.querySelector(selector) || document.getElementById(selector); // Try querySelector too
             if (element) {
                 element.addEventListener(event, handler);
                 // console.log(`DEBUG: Listener added for ${event} on element:`, element);
             } else {
                 console.error(`Element not found for selector "${selector}", cannot add listener.`);
             }
         }

        // Authentication Pages Toggles
        safeAddEventListener('show-signup', 'click', (e) => { e.preventDefault(); showAuthPage('signup'); });
        safeAddEventListener('show-login', 'click', (e) => { e.preventDefault(); showAuthPage('login'); });

        // Login Form Submit
        safeAddEventListener('login-form', 'submit', (e) => { e.preventDefault(); clearErrorMessages(); const email = loginEmailInput?.value.trim(); const password = loginPasswordInput?.value; const button = loginForm?.querySelector('button[type="submit"]'); if (!auth || !email || !password || !button) { showUserMessage(loginErrorMsg, "Please enter valid email and password.", true); return; } setLoadingState(button, true, "Logging in..."); console.log("DEBUG: Login attempt started for:", email); auth.signInWithEmailAndPassword(email, password) .then(async (userCredential) => { console.log("DEBUG: Firebase signIn SUCCESSFUL for:", userCredential.user.uid); try { console.log("DEBUG: Attempting to update lastLogin..."); await db.collection('users').doc(userCredential.user.uid).update({ lastLogin: firebase.firestore.FieldValue.serverTimestamp() }); console.log("DEBUG: Last login updated."); } catch (updateError) { console.warn("DEBUG: Could not update last login time:", updateError); } console.log("DEBUG: Login successful. Waiting for onAuthStateChanged."); /* onAuthStateChanged handles UI */ }) .catch((error) => { console.error("DEBUG: Firebase signIn FAILED:", error); showUserMessage(loginErrorMsg, getFriendlyAuthError(error), true); setLoadingState(button, false); console.log("DEBUG: Login button state restored after error."); }); });

        // Signup Form Submit
        safeAddEventListener('signup-form', 'submit', async (e) => { e.preventDefault(); clearErrorMessages(); const username = signupUsernameInput?.value.trim(); const email = signupEmailInput?.value.trim(); const password = signupPasswordInput?.value; const referralCodeInput = signupReferralInput?.value.trim().toUpperCase(); const button = signupForm?.querySelector('button[type="submit"]'); if (!username || username.length < 3 || !email || !password || password.length < 6 || !button) { showUserMessage(signupErrorMsg, "Please fill all fields correctly (Username min 3, Password min 6 chars).", true); return; } if (!auth) return; setLoadingState(button, true, "Signing up..."); try { const userCredential = await auth.createUserWithEmailAndPassword(email, password); console.log("Auth user created:", userCredential.user.uid); await createUserProfileInFirestore(userCredential.user.uid, username, email, referralCodeInput || null); console.log("Signup process complete."); /* onAuthStateChanged handles UI */ } catch (error) { console.error("Signup Error:", error); showUserMessage(signupErrorMsg, getFriendlyAuthError(error), true); setLoadingState(button, false); } });

        // Logout Button
        safeAddEventListener('logout-btn', 'click', () => { if (!auth) return; console.log("Logout button clicked."); auth.signOut().catch((error) => { console.error("Logout Error:", error); alert("Error logging out: " + getFriendlyAuthError(error)); }); });

        // Bottom Navigation
        navButtons.forEach((button) => { if(button) button.addEventListener('click', () => { const pageId = button.dataset.page; if (pageId) switchPage(pageId); }); });

        // Top Bar Icons
        safeAddEventListener('top-bar-wallet', 'click', () => { switchPage('dashboard'); setTimeout(() => showDashboardSection('wallet-history'), 50); });
        safeAddEventListener('user-profile-pic', 'click', () => { switchPage('dashboard'); setTimeout(() => showDashboardSection('settings'), 50); });

        // Homepage Earning Grid Button
        safeAddEventListener('referral-grid-btn', 'click', () => switchPage('referral'));

        // Mini Games Button on Home Page
        safeAddEventListener('go-to-mini-games-btn', 'click', () => switchPage('mini-games'));

        // Global Chat
        safeAddEventListener('send-chat-btn', 'click', sendChatMessage);
        safeAddEventListener('chat-input', 'keypress', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); } });

        // Referral Page Buttons
        safeAddEventListener('copy-ref-code-btn-page', 'click', () => { const code = referralCodePageElement?.textContent; if (code && code !== 'LOADING...' && code !== 'N/A') { navigator.clipboard.writeText(code).then(() => { const btn = document.getElementById('copy-ref-code-btn-page'); if(!btn) return; const originalIcon = btn.innerHTML; btn.innerHTML = '<i class="fas fa-check"></i>'; setTimeout(() => { btn.innerHTML = originalIcon; }, 1500); }).catch(err => { console.error('Failed to copy code: ', err); alert('Failed to copy code.'); }); } });
        safeAddEventListener('share-btn-page', 'click', () => { const code = referralCodePageElement?.textContent; if (navigator.share && code && code !== 'LOADING...' && code !== 'N/A') { navigator.share({ title: 'Join Khelo India!', text: `Join me on Khelo India! Use my referral code: ${code}`, url: window.location.href }).catch((error) => console.log('Error sharing:', error)); } else if (code && code !== 'LOADING...' && code !== 'N/A') { alert(`Share this code: ${code}\n(Sharing not supported on this browser)`); } else { alert("Referral code not loaded yet."); } });

        // Dashboard Menu Items & Back Buttons
        dashboardMenuItems.forEach((button) => { if(button) button.addEventListener('click', () => { const sectionId = button.dataset.section; if (sectionId) showDashboardSection(sectionId); }); });
        backToDashButtons.forEach((btn) => { if(btn) btn.addEventListener('click', showMainDashboardView); });
        safeAddEventListener('edit-profile-btn', 'click', () => showDashboardSection('settings'));

        // Deposit/Withdrawal Input Listeners
        safeAddEventListener('deposit-amount-inr', 'input', updateDepositConversion);
        safeAddEventListener('withdraw-amount-sm', 'input', updateWithdrawConversion);

        // Deposit/Withdrawal Form Submissions
        safeAddEventListener('deposit-form', 'submit', handleDepositSubmit);
        safeAddEventListener('withdraw-form', 'submit', handleWithdrawSubmit);

        // Settings Form Submissions and File Input
        safeAddEventListener('profile-settings-form', 'submit', handleProfileSettingsSave);
        safeAddEventListener('password-change-form', 'submit', handlePasswordChange);
        safeAddEventListener('change-pic-button', 'click', () => settingProfilePicFileInput?.click());
        safeAddEventListener('setting-profile-pic-file', 'change', (event) => { const file = event.target.files[0]; if (file) { if (!file.type.startsWith('image/')) { showUserMessage(settingsMessageElement, "Please select an image file.", true); settingProfilePicFileInput.value = null; return; } if (file.size > PROFILE_PIC_MAX_SIZE_MB * 1024 * 1024) { showUserMessage(settingsMessageElement, `Image size must be less than ${PROFILE_PIC_MAX_SIZE_MB}MB.`, true); settingProfilePicFileInput.value = null; return; } selectedProfilePicFile = file; showUserMessage(settingsMessageElement, "", false); const reader = new FileReader(); reader.onload = (e) => { if(settingsPicPreview) settingsPicPreview.src = e.target.result; }; reader.readAsDataURL(file); if(picUploadStatus) picUploadStatus.textContent = "Image selected. Save changes to upload."; } else { selectedProfilePicFile = null; if(picUploadStatus) picUploadStatus.textContent = ""; } });

        console.log("Event listeners setup completed.");
    } // --- End setupEventListeners function ---


    // --- Initialize App ---
    console.log("Khelo India App script initializing...");
    // Call setupEventListeners only ONCE, AFTER all function definitions
    setupEventListeners();

}); // End DOMContentLoaded
