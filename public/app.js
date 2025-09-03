// DOM Elements
const authContainer = document.getElementById('auth-container');
const mainApp = document.getElementById('main-app');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const authError = document.getElementById('auth-error');
const userEmailSpan = document.getElementById('user-email');
const logoutBtn = document.getElementById('logout-btn');
const appointmentTitleInput = document.getElementById('appointment-title');
const appointmentTimeInput = document.getElementById('appointment-time');
const addAppointmentBtn = document.getElementById('add-appointment-btn');
const appointmentError = document.getElementById('appointment-error');
const appointmentList = document.getElementById('appointment-list');

let unsubscribeAppointments; // To manage the real-time listener

// Function to update UI based on authentication state
function updateUI(user) {
    if (user) {
        authContainer.style.display = 'none';
        mainApp.style.display = 'block';
        userEmailSpan.textContent = user.email;
        loadAppointments(user.uid);
    } else {
        authContainer.style.display = 'block';
        mainApp.style.display = 'none';
        userEmailSpan.textContent = '';
        appointmentList.innerHTML = '';
        if (unsubscribeAppointments) {
            unsubscribeAppointments(); // Stop listening if user logs out
        }
    }
}

// Firebase Auth State Observer
auth.onAuthStateChanged(user => {
    updateUI(user);
});

// Login User
loginBtn.addEventListener('click', async () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    authError.textContent = '';
    try {
        await auth.signInWithEmailAndPassword(email, password);
        // UI updated by onAuthStateChanged observer
    } catch (error) {
        authError.textContent = error.message;
    }
});

// Register User
registerBtn.addEventListener('click', async () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    authError.textContent = '';
    try {
        await auth.createUserWithEmailAndPassword(email, password);
        // UI updated by onAuthStateChanged observer
    } catch (error) {
        authError.textContent = error.message;
    }
});

// Logout User
logoutBtn.addEventListener('click', async () => {
    try {
        await auth.signOut();
        // UI updated by onAuthStateChanged observer
    } catch (error) {
        console.error("Error logging out:", error);
    }
});

// Add Appointment
addAppointmentBtn.addEventListener('click', async () => {
    const title = appointmentTitleInput.value.trim();
    const time = appointmentTimeInput.value;
    const user = auth.currentUser;
    appointmentError.textContent = '';

    if (!user) {
        appointmentError.textContent = 'You must be logged in to add appointments.';
        return;
    }
    if (!title || !time) {
        appointmentError.textContent = 'Please enter both title and time.';
        return;
    }

    try {
        await db.collection('users').doc(user.uid).collection('appointments').add({
            title: title,
            time: firebase.firestore.Timestamp.fromDate(new Date(time)),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        appointmentTitleInput.value = '';
        appointmentTimeInput.value = '';
    } catch (error) {
        appointmentError.textContent = 'Error adding appointment: ' + error.message;
        console.error("Error adding document: ", error);
    }
});

// Load and Display Appointments (Real-time Listener)
function loadAppointments(userId) {
    if (unsubscribeAppointments) {
        unsubscribeAppointments(); // Detach previous listener if any
    }

    // Set up a real-time listener
    unsubscribeAppointments = db.collection('users').doc(userId).collection('appointments')
        .orderBy('time', 'asc') // Order by appointment time
        .onSnapshot(snapshot => {
            appointmentList.innerHTML = ''; // Clear current list
            snapshot.forEach(doc => {
                const appointment = doc.data();
                const li = document.createElement('li');

                // Format time for display
                const date = appointment.time.toDate();
                const formattedTime = date.toLocaleString(); // Adjust formatting as needed

                li.innerHTML = `
                    <span>${appointment.title}</span>
                    <span class="datetime">${formattedTime}</span>
                    <button data-id="${doc.id}">Delete</button>
                `;
                appointmentList.appendChild(li);
            });
        }, error => {
            console.error("Error fetching appointments: ", error);
            appointmentError.textContent = 'Error loading appointments.';
        });
}

// Delete Appointment
appointmentList.addEventListener('click', async (event) => {
    if (event.target.tagName === 'BUTTON' && event.target.textContent === 'Delete') {
        const appointmentId = event.target.dataset.id;
        const user = auth.currentUser;
        if (user && appointmentId) {
            try {
                await db.collection('users').doc(user.uid).collection('appointments').doc(appointmentId).delete();
            } catch (error) {
                console.error("Error removing document: ", error);
            }
        }
    }
});