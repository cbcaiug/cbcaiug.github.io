/**
 * js/services/firebase.js
 * 
 * Firebase Authentication and Firestore quota management
 */

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCkileHkaS3AymxvNnNAA_c0peWaL8RLTI",
  authDomain: "cbcaiug-auth.firebaseapp.com",
  projectId: "cbcaiug-auth",
  storageBucket: "cbcaiug-auth.firebasestorage.app",
  messagingSenderId: "570813240478",
  appId: "1:570813240478:web:d6b177bca3e291f25ed78f"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Get user quotas from Firestore
const getUserQuotas = async (uid) => {
  try {
    const doc = await db.collection('users').doc(uid).get();
    if (!doc.exists) {
      // Create new user with default quotas
      const defaultQuotas = {
        downloadsLeft: 20,
        messagesLeft: 50,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      await db.collection('users').doc(uid).set(defaultQuotas);
      return { downloadsLeft: 20, messagesLeft: 50 };
    }
    return doc.data();
  } catch (error) {
    console.error('Error getting quotas:', error);
    throw error;
  }
};

// Decrement quota (safe transaction to prevent race conditions)
const decrementQuota = async (uid, type) => {
  const userRef = db.collection('users').doc(uid);
  try {
    return await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(userRef);
      if (!doc.exists) throw new Error('User not found');
      
      const field = type === 'download' ? 'downloadsLeft' : 'messagesLeft';
      const current = doc.data()[field] || 0;
      
      if (current <= 0) throw new Error('Quota exceeded');
      
      const newValue = current - 1;
      transaction.update(userRef, { [field]: newValue });
      return newValue;
    });
  } catch (error) {
    console.error('Error decrementing quota:', error);
    throw error;
  }
};

// Export for use in other components
window.FirebaseService = { auth, db, getUserQuotas, decrementQuota };
