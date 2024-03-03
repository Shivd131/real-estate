import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Button, Input, Checkbox, Textarea } from '@nextui-org/react';
import * as Yup from 'yup';
import { Key } from 'react';

function CreateListing() {
    return (
        <main className='p-3 max-w-4xl mx-auto'>
            <h1 className='text-3xl font-semibold text-center my-7'>
                Create a Listing
            </h1>
            <Formik
                initialValues={{
                    name: '',
                    description: '',
                    address: '',
                    sale: false,
                    rent: false,
                    parking: false,
                    furnished: false,
                    offer: false,
                    bedrooms: '',
                    bathrooms: '',
                    regularPrice: '',
                    discountPrice: '',
                    images: [],
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
                    discountPrice: Yup.number().when('offer', {
                        is: true,
                        then: Yup.number().min(0, 'Minimum $0').required('Required'),
                        otherwise: Yup.number(),
                    }),
                })}
                onSubmit={(values, { setSubmitting }) => {
                    // Handle form submission
                    console.log(values);
                    setSubmitting(false);
                }}
            >
                {({ isSubmitting, isValid, dirty, setFieldValue }) => (
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

                            <div className='flex gap-6 flex-wrap'>
                                <div className='flex gap-6 items-center'>
                                    <Field
                                        type='checkbox'
                                        id='sale'
                                        className='w-5'
                                        name='sale'
                                        as={Checkbox}
                                    />
                                    <span>Sell</span>
                                </div>
                                <div className='flex gap-6 items-center'>
                                    <Field
                                        type='checkbox'
                                        id='rent'
                                        className='w-5'
                                        name='rent'
                                        as={Checkbox}
                                    />
                                    <span>Rent</span>
                                </div>
                                <div className='flex gap-6 items-center'>
                                    <Field
                                        type='checkbox'
                                        id='parkingspot'
                                        className='w-5'
                                        name='parkingspot'
                                        as={Checkbox}
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
                                    />
                                    <span>Offer</span>
                                </div>
                                {/* Similar checkbox fields for rent, parking, furnished, and offer */}
                            </div>
                            <div className='flex  gap-6 flex-wrap'>
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


                            {/* {values.offer && (
                                <div className='flex gap-6'>
                                    <Field
                                        type='number'
                                        id='discountPrice'
                                        min='0'
                                        required={values.offer}
                                        className='p-3 border border-gray-300 rounded-lg'
                                        name='discountPrice'
                                        as={Input}
                                    />
                                    <div className='flex flex-col items-center'>
                                        <p>Discounted price</p>
                                    </div>
                                </div>
                            )} */}

                            <ErrorMessage name='discountPrice' component="div" className='text-red-500 text-sm pr-2 -top-10' />
                        </div>
                        <div className='flex flex-col flex-1 gap-4'>
                            <p className='font-semibold'>
                                Images:
                                <span className='font-normal text-gray-600 ml-2'>
                                    The first image will be the cover (max 6)
                                </span>
                            </p>
                            <Field
                                onChange={(files: any) => setFieldValue('images', files)}
                                className='p-3 border border-gray-300 rounded w-full'
                                type='file'
                                id='images'
                                name='images'
                                // as={Upload}
                                accept='image/*'
                                multiple
                            />
                            <ErrorMessage name='images' component="div" className='text-red-500 text-sm pr-2 -top-10' />

                            {/* {values.images.map((file: Blob | MediaSource, index: Key | null | undefined) => (
                                <div key={index} className='flex justify-between p-3 border items-center'>
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={`Listing image ${index + 1}`}
                                        className='w-20 h-20 object-contain rounded-lg'
                                    />
                                    <button
                                        type='button'
                                        onClick={() => setFieldValue('images', values.images.filter((_, i) => i !== index))}
                                        className='p-3 text-red-700 rounded-lg uppercase hover:opacity-75'
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))} */}

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

export default CreateListing