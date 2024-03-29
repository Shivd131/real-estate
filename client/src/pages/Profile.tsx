import React, { useState, useEffect } from 'react';
import { Input } from "@nextui-org/react";
import { EyeFilledIcon } from "../assets/EyeFilledIcon";
import { EyeSlashFilledIcon } from "../assets/EyeSlashFilledIcon";
import { Button } from "@nextui-org/react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useRef } from 'react';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../firebase';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Card, CardBody, CardFooter, Image } from "@nextui-org/react";
import { Pagination } from "@nextui-org/react";


import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutUserStart,
  signOutUserFailure,
  signOutUserSuccess,
} from '../redux/user/userSlice';


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

interface Listing {
  _id: string;
}

interface Listing {
  address: string;
  bathrooms: number;
  bedrooms: number;
  description: string;
  discountPrice: number;
  furnished: boolean;
  imageUrls: string[];
  name: string;
  offer: boolean;
  parking: boolean;
  regularPrice: number;
  type: string;
  _id: string;
}

const Profile: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  const userDetails = useSelector((state: RootState) => {
    return state.user as unknown as User;
  });
  const [formData, setFormData] = useState<FormValues>({
    avatar: userDetails.currentUser?.avatar || '',
    username: userDetails.currentUser?.username || '', // Set username directly
    email: userDetails.currentUser?.email || '',
    password: ''
  });
  const [showListingsError, setShowListingsError] = useState('')
  const [userListings, setUserListings] = useState<Listing[]>([]);
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

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await axios.delete(`/api/user/delete/${userDetails.currentUser!._id}`)
      const data = res.data;
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure((error as Error).message));
    }
  }

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart())
      const res = await axios.get(`/api/auth/signout`)
      const data = res.data;
      if (data.success === false) {
        dispatch(signOutUserFailure(data.message))
        return;
      }

      dispatch(signOutUserSuccess(data))

    } catch (error) {
      dispatch(signOutUserFailure(error))
    }
  }

  const handleShowListings = async () => {
    try {
      const res = await axios.get(`/api/user/listings/${userDetails.currentUser?._id}`)
      const data = res.data;
      if (data.success === false) {
        setShowListingsError('error fetching data')
      }
      setUserListings(data)
    } catch (error) {
      setShowListingsError((error as Error).message)
      toast.error('Error displaying listings')
    }
  }

  const handleListingDelete = async (listingId: string) => {
    try {
      const response = await axios.delete(`/api/listing/delete/${listingId}`);
      const data = response.data;
      if (data.success === false) {
        toast.error(data.message);
        return;
      }
      setUserListings((prevListings) =>
        prevListings.filter((listing) => listing._id !== listingId)
      );
      toast.success('Listing deleted successfully');
    } catch (error) {
      console.error('Error deleting listing:', (error as Error).message);
      toast.error('Error deleting listing');
    }
  };

  const fetchUserListings = async () => {
    try {
      const res = await axios.get(`/api/user/listings/${userDetails.currentUser?._id}`, {
        params: { page: currentPage }
      });
      const data = res.data;
      if (data.success === false) {
        setShowListingsError('error fetching data');
        return;
      }
      setUserListings(data.listings);
      setTotalPages(data.totalPages);
    } catch (error) {
      setShowListingsError((error as Error).message);
      toast.error('Error displaying listings');
    }
  };
  useEffect(() => {
    fetchUserListings();
  }, [currentPage]);

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <ToastContainer />

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
        <span onClick={handleDeleteUser} className='text-red-700 cursor-pointer'>
          Delete Account
        </span>
        <span onClick={handleSignOut} className='text-red-700 cursor-pointer'>
          Sign Out
        </span>
      </div>
      <div className='flex flex-col gap-6 justify-center'>
        <Button onClick={handleShowListings} className=' '>Show Listings</Button>
        <div className='flex flex-col items-center gap-3'>
          {userListings && userListings.length > 0 && (
            <div className='flex flex-col gap-4'>
              <h1 className='text-center mt-7 text-2xl font-semibold'>
                Your Listings
              </h1>
              {userListings.map((listing: Listing) => (
                <div
                  key={listing._id}
                  className='border rounded-lg p-3 flex justify-between items-center gap-4'
                >
                  <Link to={`/listing/${listing._id}`}>
                    <img
                      src={listing.imageUrls[0]}
                      alt='listing cover'
                      className='h-20 w-20 object-contain'
                    />
                  </Link>
                  <Link
                    className='text-slate-700 font-semibold  hover:underline truncate flex-1'
                    to={`/listing/${listing._id}`}
                  >
                    <p>{listing.name}</p>
                  </Link>

                  <div className='flex flex-col item-center'>
                    <button
                      onClick={() => handleListingDelete(listing._id)}
                      className='text-red-700 uppercase'
                    >
                      Delete
                    </button>
                    <Link to={`/update-listing/${listing._id}`}>
                      <button className='text-green-700 uppercase'>Edit</button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Pagination
            showControls
            total={totalPages}
            initialPage={currentPage}
            onChange={handlePageChange}
          />
        </div>

      </div>
    </div>
  );
};

export default Profile;
