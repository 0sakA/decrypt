import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, addDoc, collection } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBYPfTEoYujHgdWk1n7rtj4eL565v9Ei-g",
  authDomain: "hackathon-8f483.firebaseapp.com",
  projectId: "hackathon-8f483",
  storageBucket: "hackathon-8f483.appspot.com",
  messagingSenderId: "306076417028",
  appId: "1:306076417028:web:8e4359e19d274f6e080951",
  measurementId: "G-9BTE57RFJV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Function to create a user document in Firestore
export const createUserDocument = async (user, role) => {
  if (!user) return;
  const userRef = doc(db, "users", user.uid);
  const userData = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    role: role,  // "teacher" or "student"
  };
  try {
    await setDoc(userRef, userData);
    console.log("User document created in Firestore");
  } catch (error) {
    console.error("Error creating user document", error);
  }
};

// Function to create an exam document in Firestore
export const createExamDocument = async (examData) => {
  const examsRef = collection(db, "exams");
  try {
    const examDoc = await addDoc(examsRef, examData);
    console.log("Exam created with ID:", examDoc.id);
    return examDoc.id;
  } catch (error) {
    console.error("Error creating exam document", error);
  }
};

// Function to save student exam submission in Firestore
export const handleExamSubmission = async (examId, studentId, answers, score) => {
  const studentAnswersRef = doc(collection(db, `exams/${examId}/studentAnswers`), studentId);
  try {
    await setDoc(studentAnswersRef, {
      answers: answers,   // Array of answers
      score: score,       // Calculated score
      completedAt: new Date(), // Timestamp of when the exam was completed
    });
    console.log("Student answers saved in Firestore");
  } catch (error) {
    console.error("Error saving student answers", error);
  }
};

export { auth, db };
