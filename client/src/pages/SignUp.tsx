import React from 'react'
import { Input } from "@nextui-org/react";
import { EyeFilledIcon } from "../assets/EyeFilledIcon";
import { EyeSlashFilledIcon } from "../assets/EyeSlashFilledIcon";
import { Button } from "@nextui-org/react";
import { Link } from 'react-router-dom';


export default function SignUp() {
  const [isVisible, setIsVisible] = React.useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl text-center font-semibold my-7'>Sign Up</h1>
      <form className='flex flex-col gap-5 bg-gray-300 p-10 rounded-lg'>
        <Input
          type="text"
          label="Name"
          labelPlacement="outside"
        />
        <Input
          type="email"
          label="Email"
          labelPlacement="outside"
        />
        <Input
          label="Password"
          labelPlacement="outside"
          //variant="bordered"
          endContent={
            <button className="focus:outline-none" type="button" onClick={toggleVisibility}>
              {isVisible ? (
                <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
              ) : (
                <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
              )}
            </button>
          }
          type={isVisible ? "text" : "password"}
          className=""
        />
        <Button color="success" className='text-white font-bold text-lg mt-5'>
          SIGN UP
        </Button>
      </form>
      <div className='flex gap-2 mt-3'>
       <p>Have an account?</p>
       <Link to={"/sign-in"}>
        <span className='text-blue-700'>Sign in</span>
       </Link>
      </div>
    </div>
  )
}
