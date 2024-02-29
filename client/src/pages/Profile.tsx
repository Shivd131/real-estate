import React, { useState, useEffect } from 'react';
import { Input } from "@nextui-org/react";
import { EyeFilledIcon } from "../assets/EyeFilledIcon";
import { EyeSlashFilledIcon } from "../assets/EyeSlashFilledIcon";
import { Button } from "@nextui-org/react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useRef } from 'react';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../firebase';
import { updateUserFailure, updateUserStart, updateUserSuccess } from '../redux/user/userSlice';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


interface FormValues {
  avatar: string;
  username: string;
  email: string;
  password: string;
  [key: string]: string;
}
interface User {
  currentUser: {
    _id: any;
    username: string;
    email: string;
    avatar: string;
  } | null;
}

const Profile: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const userDetails = useSelector((state: RootState) => {
    return state.user as unknown as User;
  });
  const [formData, setFormData] = useState<FormValues>({
    avatar: userDetails.currentUser?.avatar || '',
    username: userDetails.currentUser?.username || '', // Set username directly
    email: userDetails.currentUser?.email || '',
    password: ''
  });
  const dispatch = useDispatch();



  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  useEffect(() => {
    console.log("formdata is ", formData)
  }, [formData])


  const toggleVisibility = () => setIsVisible(!isVisible);

  const initialValues: FormValues = {
    username: userDetails.currentUser?.username || '',
    email: userDetails.currentUser?.email || '',
    password: '',
    avatar: userDetails.currentUser?.avatar || ''
  };

  const validate = (values: FormValues) => {
    const errors: Partial<FormValues> = {};
    return errors;
  };


  const handleSubmit = async (values: FormValues) => {
    try {
      dispatch(updateUserStart());
  
      const changedFields: Partial<FormValues> = {};
  
      Object.keys(values).forEach((key) => {
        if (values[key] !== initialValues[key]) {
          changedFields[key as keyof FormValues] = values[key];
        }
      });
  
      const res = await axios.post(`/api/user/update/${userDetails!.currentUser!._id}`, changedFields);
      const data = res.data;
      toast.success("updated")
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }
      dispatch(updateUserSuccess(data));
  
      // Update formData with the new values
      setFormData({ ...formData, ...changedFields });
  
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure((error as Error).message));
    }
  };
  


  const handleFileUpload = (file: File) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
      },
      (error) => {
        setFileUploadError(true);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref)
          .then((downloadURL) => {
            setFileUploadError(false);
            setUpdateSuccess(false);
            setFilePerc(0);
            setFile(null);
            setFormData({ ...initialValues, avatar: downloadURL });
          })
          .catch((error) => {
            console.error('Error getting download URL:', error);
            setFileUploadError(true);
          });
      }
    );
  };



  return (
    
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl text-center font-semibold my-7'>Profile</h1>
      <ToastContainer />
      <Formik
        initialValues={formData}
        validate={validate}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className='flex flex-col gap-5 bg-gray-300 p-10 rounded-lg'>
            <input
              type="file"
              ref={fileRef}
              hidden
              accept='image/*'
              onChange={e => e?.target?.files && setFile(e.target.files[0])}
            />
            <img
              src={formData.avatar || userDetails.currentUser?.avatar}
              alt='profile'
              className='rounded-full h-32 w-32 object-cover self-center cursor-pointer'
              onClick={() => fileRef?.current?.click()}
            />
            <p className='text-sm self-center'>
              {fileUploadError ? (
                <span className='text-red-700'>
                  Error Image upload (image must be less than 2 mb)
                </span>
              ) : filePerc > 0 && filePerc < 100 ? (
                <span className='text-slate-700'>{`Uploading ${filePerc}%`}</span>
              ) : filePerc === 100 ? (
                <span className='text-green-700'>Image successfully uploaded!</span>
              ) : (
                ''
              )}
            </p>
            <Field
              type="text"
              name="username"
              as={Input}
              label="Name"
              labelPlacement="outside"
            />
            <ErrorMessage name="username" component="div" className='text-red-500 text-sm pr-2 -top-10' />
            <Field
              type="email"
              name="email"
              as={Input}
              label="Email"
              labelPlacement="outside"
            />
            <ErrorMessage name="email" component="div" className='text-red-500 text-sm pr-2 -top-10' />
            <Field
              type={isVisible ? "text" : "password"}
              name="password"
              as={Input}
              label="Password"
              labelPlacement="outside"
              endContent={
                <button className="focus:outline-none" type="button" onClick={toggleVisibility} >
                  {isVisible ? (
                    <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                  ) : (
                    <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                  )}
                </button>
              }
            />
            <ErrorMessage name="password" component="div" className='text-red-500 text-sm pr-2 -top-10' />
            <Button color="primary" type="submit" className='text-white font-bold text-lg' disabled={isSubmitting} isLoading={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update'}
            </Button>

            <Button color='success' type="button" className='text-white font-bold text-lg' onClick={() => navigate('/create-listing')}>
              Create Listing
            </Button>
          </Form>
        )}
      </Formik>

      <div className='flex justify-between mt-3'>
        <span className='text-red-700 cursor-pointer'>
          Delete Account
        </span>
        <span className='text-red-700 cursor-pointer'>
          Sign Out
        </span>
      </div>
    </div>
  );
};

export default Profile;
