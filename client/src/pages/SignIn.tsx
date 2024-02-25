import React, { useState } from 'react';
import { Input } from "@nextui-org/react";
import { EyeFilledIcon } from "../assets/EyeFilledIcon";
import { EyeSlashFilledIcon } from "../assets/EyeSlashFilledIcon";
import { Button } from "@nextui-org/react";
import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from "formik";
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux'
import { signInFailure, signInStart, signInSuccess } from '../redux/user/userSlice'
import OAuth from '../components/OAuth';
//import useSelector from 'react-redux'
interface FormValues {
  email: string;
  password: string;
}

const SignIn: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const dispatch = useDispatch()
  const toggleVisibility = () => setIsVisible(!isVisible);
  //const { loading, error } = useSelector((state: { user: any; }) => state.user)

  const initialValues: FormValues = {
    email: '',
    password: ''
  };

  const navigate = useNavigate();

  const validate = (values: FormValues) => {
    const errors: Partial<FormValues> = {};
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
      dispatch(signInStart())
      const response = await axios.post('/api/auth/signin', values);
      console.log(response.data);
      setSubmitting(false)
      dispatch(signInSuccess(response.data))
      navigate('/'); // Assuming after successful sign-in, user will be redirected to the dashboard
    } catch (error) {
      console.error('Error submitting form:', error);
      // Display a toast notification
      dispatch(signInFailure(error))
      toast.error('An error occurred. Please try again later.', {
        //position: toast.POSITION.TOP_CENTER,
        autoClose: 3000 // Set the duration for which the toast will be displayed
      });
      setSubmitting(false);
    }
  };

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl text-center font-semibold my-7'>Sign In</h1>

      <Formik
        initialValues={initialValues}
        validate={validate}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className='flex flex-col gap-5 bg-gray-300 p-10 rounded-lg'>
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
            <Button color="success" type="submit" className='text-white font-bold text-lg mt-5' disabled={isSubmitting} isLoading={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'SIGN IN'}
            </Button>
            <OAuth/>
          </Form>
        )}
      </Formik>

      <div className='flex gap-2 mt-3'>
        <p>Don't have an account?</p>
        <Link to={"/sign-up"}>
          <span className='text-blue-700'>Sign up</span>
        </Link>
      </div>
    </div>
  );
};

export default SignIn;
