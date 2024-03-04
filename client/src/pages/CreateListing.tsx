import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Button, Input, Checkbox, Textarea, RadioGroup, Radio } from '@nextui-org/react';
import * as Yup from 'yup';
import { useState } from 'react';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../firebase';
import { Image } from "@nextui-org/react";
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

interface User {
    currentUser: {
        _id: any;
        username: string;
        email: string;
        avatar: string;
    } | null;
}

function CreateListing() {
    const [files, setFiles] = useState<File[]>([]);
    const [imageUploadError, setImageUploadError] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<string[]>([]);
    const userDetails = useSelector((state: RootState) => {
        return state.user as unknown as User;
    });
    const navigate = useNavigate();

    const storeImage = async (file: File) => {
        const storage = getStorage(app);
        const fileName = new Date().getTime() + file.name;
        const storageRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        return new Promise<string>((resolve, reject) => {
            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`Upload is ${progress}% done`);
                },
                (error) => {
                    reject(error);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        resolve(downloadURL);
                        console.log(downloadURL);
                    }).catch((error) => {
                        reject(error);
                    });
                }
            );
        });
    };

    const handleImageSubmit = async () => {
        try {
            if (files.length > 0 && files.length < 7) {
                setUploading(true);
                setImageUploadError(false);
                const urls: string[] = [];

                for (let i = 0; i < files.length; i++) {
                    const url = await storeImage(files[i]);
                    urls.push(url);
                }

                setImages(urls);
                setImageUploadError(false);
                setUploading(false);
            } else {
                setImageUploadError(true);
                setUploading(false);
            }
        } catch (error) {
            console.error('Error uploading images:', error);
            setImageUploadError(true);
            setUploading(false);
        }
    };

    const removeImage = (index: number) => {
        const updatedImages = [...images];
        updatedImages.splice(index, 1);
        setImages(updatedImages);
    };

    return (
        <main className='p-3 max-w-4xl mx-auto'>
            <ToastContainer />
            <h1 className='text-3xl font-semibold text-center my-7'>
                Create a Listing
            </h1>
            <Formik
                initialValues={{
                    name: '',
                    description: '',
                    address: '',
                    type: 'rent',
                    parking: false,
                    furnished: false,
                    offer: false,
                    bedrooms: 1,
                    bathrooms: 1,
                    regularPrice: 0,
                    discountPrice: 0,
                    imageUrls: [],
                }}

                validationSchema={Yup.object({
                    name: Yup.string()
                        .min(10, 'Must be at least 10 characters')
                        .max(62, 'Must be at most 62 characters')
                        .required('Required'),
                    description: Yup.string().required('Required'),
                    address: Yup.string().required('Required'),
                    bedrooms: Yup.number().min(1, 'Must be at least 1').required('Required'),
                    bathrooms: Yup.number().min(1, 'Must be at least 1').required('Required'),
                    regularPrice: Yup.number().min(50, 'Minimum $50').required('Required'),
                })}
                onSubmit={(values, { setSubmitting }) => {
                    const updatedValues = {
                        ...values,
                        userRef: userDetails.currentUser!._id,
                        imageUrls: images
                    };

                    setLoading(true);
                    axios.post('/api/listing/create', updatedValues)
                        .then(response => {
                            const data = response.data;
                            setLoading(false);
                            if (data.success === false) {
                                setError(data.message);
                            }
                            toast.success("Listing created successfully");
                            navigate(`/listing/${data._id}`);
                        })
                        .catch(error => {
                            setError(error.response.data.message || error.message);
                        })
                        .finally(() => {
                            setLoading(false);
                            setSubmitting(false);
                        });
                }}
            >
                {({ isSubmitting, isValid, dirty, setFieldValue, values, initialValues }) => (
                    <Form className='flex flex-col sm:flex-row gap-4'>
                        <div className='flex flex-col gap-4 flex-1'>
                            <Field
                                type='text'
                                placeholder='Name'
                                className='border rounded-xl'
                                name='name'
                                maxLength='62'
                                minLength='10'
                                as={Input}
                            />
                            <ErrorMessage name='name' component="div" className='text-red-500 text-sm pr-2 -top-10' />

                            <Field
                                type='text'
                                placeholder='Description'
                                className='border rounded-xl'
                                name='description'
                                as={Textarea}
                            />
                            <ErrorMessage name='description' component="div" className='text-red-500 text-sm pr-2 -top-10' />

                            <Field
                                type='text'
                                placeholder='Address'
                                className='border rounded-xl'
                                name='address'
                                as={Input}
                            />
                            <ErrorMessage name='address' component="div" className='text-red-500 text-sm pr-2 -top-10' />

                            <div className='flex gap-6 flex-wrap flex-col'>
                                <RadioGroup className='' orientation="horizontal">
                                    <Radio
                                        id='sale'
                                        className=''
                                        value='sale'
                                        defaultChecked={initialValues.type === 'sale'}
                                        onChange={() => values.type = 'sell'}
                                    >
                                        Sell
                                    </Radio>
                                    <Radio
                                        id='rent'
                                        className=''
                                        value='rent'
                                        defaultChecked={initialValues.type === 'rent'}
                                        onChange={() => values.type = 'rent'}
                                    >
                                        Rent
                                    </Radio>
                                </RadioGroup>

                                <div className='flex gap-6'>
                                    <div className='flex gap-6 items-center'>
                                        <Field
                                            type='checkbox'
                                            id='parkingspot'
                                            className='w-5'
                                            name='parkingspot'
                                            as={Checkbox}
                                            defaultSelected={initialValues.parking}
                                        />
                                        <span>Parking Spot</span>
                                    </div>
                                    <div className='flex gap-6 items-center'>
                                        <Field
                                            type='checkbox'
                                            id='furnished'
                                            className='w-5'
                                            name='furnished'
                                            as={Checkbox}
                                            defaultSelected={initialValues.furnished}
                                        />
                                        <span>Furnished</span>
                                    </div>
                                    <div className='flex gap-6 items-center'>
                                        <Field
                                            type='checkbox'
                                            id='offer'
                                            className='w-5'
                                            name='offer'
                                            as={Checkbox}
                                            defaultSelected={initialValues.offer}
                                        />
                                        <span>Offer</span>
                                    </div>
                                </div>
                            </div>

                            <div className='flex gap-6 flex-wrap'>
                                <div className='flex items-center gap-6'>
                                    <Field
                                        type='number'
                                        id='bedrooms'
                                        min='1'
                                        required
                                        className='border rounded-xl w-20'
                                        name='bedrooms'
                                        as={Input}
                                    />
                                    <p>Beds</p>
                                </div>
                                <div className='flex items-center gap-6'>
                                    <Field
                                        type='number'
                                        id='bathrooms'
                                        min='1'
                                        required
                                        className='border rounded-xl w-20'
                                        name='bathrooms'
                                        as={Input}
                                    />
                                    <p>Bathrooms</p>
                                </div>
                                <div className='flex items-center gap-6'>
                                    <Field
                                        type='number'
                                        id='regularPrice'
                                        min='50'
                                        required
                                        className='border rounded-xl w-20'
                                        name='regularPrice'
                                        as={Input}
                                    />
                                    <div className='flex flex-col items-center'>
                                        <p>Regular price</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='flex flex-col flex-1 gap-4'>
                            <p className='font-semibold'>
                                Images:
                                <span className='font-normal text-gray-600 ml-2'>
                                    The first image will be the cover (max 6)
                                </span>
                            </p>
                            <div className='flex gap-4'>
                                <input
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        if (e.target.files) {
                                            setFiles(Array.from(e.target.files));
                                        }
                                    }}
                                    className='p-3 border border-gray-300 rounded w-full'
                                    type='file'
                                    id='images'
                                    name='images'
                                    accept='image/*'
                                    multiple
                                />
                                <Button
                                    type='button'
                                    isLoading={uploading}
                                    onClick={handleImageSubmit}
                                    className='p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80 self-stretch relative h-[100%] w-[35%] bg-white'
                                >
                                    {'Upload'}
                                </Button>
                            </div>
                            {imageUploadError && (
                                <ErrorMessage name='images' component="div" className='text-red-500 text-sm pr-2 -top-10' />
                            )}
                            <div className='flex gap-4 flex-wrap relative'>
                                {images.map((url: string, index: number) => (
                                    <div key={index} className='relative'>
                                        <Image
                                            isZoomed
                                            width={200}
                                            src={url}
                                            alt={`Listing image ${index + 1}`}
                                        />
                                        <button
                                            type='button'
                                            onClick={() => removeImage(index)}
                                            className='absolute top-0 right-0 p-1 z-10 w-6 text-gray-800 rounded-full  font-bold'
                                        >
                                            X
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <Button
                                disabled={isSubmitting || !isValid || !dirty}
                                isLoading={isSubmitting}
                                type='submit'
                                className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80'
                            >
                                {isSubmitting ? 'Creating...' : 'Create listing'}
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </main>
    )
}

export default CreateListing;
