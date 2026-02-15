import admin from "firebase-admin";
import fs from "fs";

const serviceAccount = JSON.parse(
  fs.readFileSync("./serviceAccountKey.json", "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixPosts() {
  const snap = await db.collection("posts").get();

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    const updates = {};

    if (!("likes" in data)) {
      updates.likes = 0;
    }

    if (!("likedBy" in data)) {
      updates.likedBy = {};
    }

    if (Object.keys(updates).length > 0) {
      await db.collection("posts").doc(docSnap.id).update(updates);
      console.log("Fixed:", docSnap.id);
    }
  }

  console.log("All posts checked.");
}

fixPosts();
