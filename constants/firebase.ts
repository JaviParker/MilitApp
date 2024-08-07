import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyADDUx7787K0UEbKYeBm8MKOvzlBVx0CAU",
  authDomain: "militapp-isw.firebaseapp.com",
  projectId: "militapp-isw",
  storageBucket: "militapp-isw.appspot.com",
  messagingSenderId: "433498677543",
  appId: "1:433498677543:web:271bd67d07040ad7778902"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };


// const firebaseConfig = {
//   apiKey: "AIzaSyADDUx7787K0UEbKYeBm8MKOvzlBVx0CAU",
//   authDomain: "militapp-isw.firebaseapp.com",
//   projectId: "militapp-isw",
//   storageBucket: "militapp-isw.appspot.com",
//   messagingSenderId: "433498677543",
//   appId: "1:433498677543:web:271bd67d07040ad7778902"
// };