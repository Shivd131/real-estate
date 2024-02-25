import { Button } from "@nextui-org/react";
import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import { app } from '../firebase';
import axios from 'axios';
import { useDispatch } from "react-redux";
import { signInSuccess } from "../redux/user/userSlice";
import { useNavigate } from "react-router-dom";

export default function OAuth() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleGoogleClick = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const auth = getAuth(app);

            const result = await signInWithPopup(auth, provider);
            console.log("Sign-in result:", result);

            const response = await axios.post('/api/auth/google', {
                name: result.user.displayName,
                email: result.user.email,
                photo: result.user.photoURL
            });

            console.log("API response:", response.data);
            

            dispatch(signInSuccess(response.data));
            navigate("/");

        } catch (error) {
            console.error("Could not sign in with Google", error);
        }
    }

    return (
        <Button onClick={handleGoogleClick} color="danger" className='text-white font-bold text-lg mt-5'>
            CONTINUE WITH GOOGLE
        </Button>
    )
}
