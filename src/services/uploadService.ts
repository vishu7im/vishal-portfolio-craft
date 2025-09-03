
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import { storage } from "./firebaseConfig";
import toast from "react-hot-toast";

export async function uploadImage(file: File, path: string): Promise<string> {
  try {
    const storageRef = ref(storage, `${path}/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    toast.success("Image uploaded successfully");


    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    toast.error("Failed to upload image");

    throw error;
  }
}

export async function uploadResume(file: File): Promise<string> {
  try {
    const storageRef = ref(storage, `resumes/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    toast.success("Resume uploaded successfully");

    return downloadURL;
  } catch (error) {
    console.error("Error uploading resume:", error);
    toast.error("Failed to upload resume");
    throw error;
  }
}
