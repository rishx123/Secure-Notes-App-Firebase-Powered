// Firebase SDK Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { 
    getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { 
    getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAQ6mBEsExnYv0lu_eZa9XFjGaqdF15J6A",
    authDomain: "notes-app-92a35.firebaseapp.com",
    projectId: "notes-app-92a35",
    storageBucket: "notes-app-92a35.appspot.com",
    messagingSenderId: "305575912779",
    appId: "1:305575912779:web:9fbe7872e03786863ff4ce",
    measurementId: "G-D0DSMJVFHZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Signup Function
window.signup = async function () {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Signup Successful! Please log in.");
    } catch (error) {
        alert(error.message);
    }
};

// Login Function
window.login = async function () {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Login Successful!");
        showNotesSection();
    } catch (error) {
        alert(error.message);
    }
};

// Logout Function
window.logout = function () {
    signOut(auth).then(() => {
        alert("Logged Out!");
        document.getElementById("authSection").style.display = "block";
        document.getElementById("notesSection").style.display = "none";
    });
};

// Show Notes Section
function showNotesSection() {
    document.getElementById("authSection").style.display = "none";
    document.getElementById("notesSection").style.display = "block";
    displayNotes();
    displayAllNotes();
}

// Add Note
window.addNote = async function () {
    const noteText = document.getElementById("noteInput").value.trim();
    if (noteText === "") {
        alert("Please write something!");
        return;
    }

    const user = auth.currentUser;
    if (user) {
        try {
            await addDoc(collection(db, "notes"), {
                uid: user.uid,
                text: noteText,
                timestamp: new Date(),
            });
            alert("Note added!");
            document.getElementById("noteInput").value = "";
            displayNotes();
            displayAllNotes();
        } catch (error) {
            console.error("Error adding note:", error);
        }
    }
};

// Display User's Notes
async function displayNotes() {
    const user = auth.currentUser;
    if (!user) return;

    const notesContainer = document.getElementById("notesContainer");
    notesContainer.innerHTML = "";

    const q = query(collection(db, "notes"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        const noteData = doc.data();
        if (noteData.uid === user.uid) {
            notesContainer.innerHTML += `
                <div class="note">
                    <p contenteditable="true" id="note-${doc.id}">${noteData.text}</p>
                    <button class="save-btn" onclick="updateNote('${doc.id}')">Save</button>
                    <button class="delete-btn" onclick="deleteNote('${doc.id}')">X</button>
                </div>
            `;
        }
    });
}

// Update Note
window.updateNote = async function (noteId) {
    const noteText = document.getElementById(`note-${noteId}`).innerText;
    await updateDoc(doc(db, "notes", noteId), { text: noteText });
    alert("Note Updated!");
};

// Delete Note
window.deleteNote = async function (noteId) {
    await deleteDoc(doc(db, "notes", noteId));
    alert("Note Deleted!");
    displayNotes();
    displayAllNotes();
};

// Firebase Auth State Listener
onAuthStateChanged(auth, (user) => {
    if (user) {
        showNotesSection();
    }
});
// Speech Recognition API Setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.lang = "en-US";

// Get Button & Input Field
const voiceButton = document.getElementById("voiceButton");
const noteInput = document.getElementById("noteInput");

let isRecording = false;

// Start/Stop Speech Recognition
voiceButton.addEventListener("click", () => {
    if (!isRecording) {
        recognition.start();
        voiceButton.textContent = "🛑 Stop";
        isRecording = true;
    } else {
        recognition.stop();
        voiceButton.textContent = "🎤 Speak";
        isRecording = false;
    }
});

// Capture Speech & Display in Textarea
recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    noteInput.value += transcript + " "; // Append spoken text
};

// Handle Errors
recognition.onerror = (event) => {
    console.error("Speech Recognition Error:", event.error);
    alert("Error with voice recognition. Try again!");
};
