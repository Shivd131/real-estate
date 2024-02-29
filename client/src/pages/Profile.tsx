import React, { useEffect, useState } from 'react';
import { Input } from "@nextui-org/react";
import { EyeFilledIcon } from "../assets/EyeFilledIcon";
import { EyeSlashFilledIcon } from "../assets/EyeSlashFilledIcon";
import { Button } from "@nextui-org/react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useRef } from 'react';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../firebase';



interface FormValues {
  username: string;
  email: string;
  password: string;
}
interface FormDataWithAvatar extends FormValues {
  avatar?: string;
}

interface User {
  currentUser: {
    name: string;
    email: string;
    avatar: string;
  } | null;
}

const Profile: React.FC = () => {

  const [isVisible, setIsVisible] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState<FormDataWithAvatar>({ avatar: '', username: '', email: '', password: '' });
  console.log("formdata is ", formData)

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const fileRef = useRef<HTMLInputElement>(null);
  const userDetails = useSelector((state: RootState) => {
    return state.user as unknown as User;
  });
  const toggleVisibility = () => setIsVisible(!isVisible);
  const navigate = useNavigate()

  const initialValues: FormValues = {
    username: '',
    email: '',
    password: ''
  };

  const validate = (values: FormValues) => {
    const errors: Partial<FormValues> = {};
    if (!values.username) {
      errors.username = 'Required';
    }
    if (!values.email) {
      errors.email = 'Required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
      errors.email = 'Invalid email address';
    }
    if (!values.password) {
      errors.password = 'Required';
    } else if (values.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }
    return errors;
  };

  const handleSubmit = async (values: FormValues, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
    try {
      // You can handle profile update logic here
      console.log("Profile updated:", values);
      setSubmitting(false)
      // Show success message
      toast.success('Profile updated successfully', {
        autoClose: 3000 // Set the duration for which the toast will be displayed
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      // Display a toast notification
      toast.error('An error occurred while updating profile. Please try again later.', {
        autoClose: 3000 // Set the duration for which the toast will be displayed
      });
      setSubmitting(false);
    }
  };

  const handleFileUpload = (file: Blob | ArrayBuffer) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + (file instanceof File ? file.name : 'unknown');
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
        console.log(progress)
      },
      (error) => {
        setFileUploadError(true);
        console.log(error)
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
          setFormData({ ...formData, avatar: downloadURL })
        );
      }
    );
  };

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl text-center font-semibold my-7'>Profile</h1>

      <Formik
        initialValues={initialValues}
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
              onChange={e => e?.target?.files && setFile(e.target.files[0])} />
            <img
              src={formData?.avatar || userDetails.currentUser?.avatar }
              alt='profile'
              className='rounded-full h-32 w-32 object-cover self-center'
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
