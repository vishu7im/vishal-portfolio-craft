
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebaseConfig";
import { toast } from "@/components/ui/use-toast";

export async function uploadImage(file: File, path: string): Promise<string> {
  try {
    const storageRef = ref(storage, `${path}/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    toast({
      title: "Success",
      description: "Image uploaded successfully",
    });
    
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    toast({
      title: "Error",
      description: "Failed to upload image",
      variant: "destructive",
    });
    throw error;
  }
}

export async function uploadResume(file: File): Promise<string> {
  try {
    const storageRef = ref(storage, `resumes/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    toast({
      title: "Success",
      description: "Resume uploaded successfully",
    });
    
    return downloadURL;
  } catch (error) {
    console.error("Error uploading resume:", error);
    toast({
      title: "Error",
      description: "Failed to upload resume",
      variant: "destructive",
    });
    throw error;
  }
}
