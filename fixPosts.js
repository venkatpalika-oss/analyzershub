import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "instmates.firebaseapp.com",
  projectId: "instmates"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixPosts() {
  const snap = await getDocs(collection(db, "posts"));

  for (const d of snap.docs) {
    const data = d.data();

    const updates = {};

    if (!("likes" in data)) {
      updates.likes = 0;
    }

    if (!("likedBy" in data)) {
      updates.likedBy = {};
    }

    if (Object.keys(updates).length > 0) {
      await updateDoc(doc(db, "posts", d.id), updates);
      console.log("Fixed:", d.id);
    }
  }

  console.log("All posts checked.");
}

fixPosts();
