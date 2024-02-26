import { useSelector } from 'react-redux'
import { RootState } from '../redux/store';
import { Outlet, Navigate } from 'react-router-dom';

interface User {
    currentUser: {
        name: string;
        email: string;
        avatar: string;
    } | null;
}

export default function PrivateRoute() {
    const userDetails = useSelector((state: RootState) => {
        return state.user as unknown as User;
    });
    userDetails.currentUser ? console.log("user found") : console.log("not found")
    return userDetails.currentUser ? <Outlet /> : <Navigate to='/sign-in' />
}
