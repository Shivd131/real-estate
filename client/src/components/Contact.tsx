import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { Link } from 'react-router-dom';

interface Listing {
    userRef: any;
    imageUrls: string[];
    name: string;
    description: string;
    address: string;
    type: 'rent' | 'sale';
    bedrooms: number;
    bathrooms: number;
    regularPrice: number;
    discountPrice: number;
    offer: boolean;
    parking: boolean;
    furnished: boolean;
}

interface Landlord {
    email: string;
    username: string;
}

interface ContactProps {
    listing: Listing;
}

const Contact: React.FC<ContactProps> = ({ listing }) => {
    const [landlord, setLandlord] = useState<Landlord>({
        email:'',
        username:''
    })
    const [message, setMessage] = useState('');
    const onChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
        setMessage(e.target.value);
    };
    useEffect(() => {
        const fetchLandlord = async () => {
            try {
                const res = await axios.get(`/api/user/${listing.userRef}`);
                const data = res.data;
                setLandlord(data);
            } catch (error) {
                console.log(error);
            }
        };
        fetchLandlord();
    }, [listing.userRef]);
    return (
        <>
            {landlord && (
                <div className='flex flex-col gap-2'>
                    <p>
                        Contact <span className='font-semibold'>{landlord.username}</span>{' '}
                        for{' '}
                        <span className='font-semibold'>{listing.name.toLowerCase()}</span>
                    </p>
                    <textarea
                        name='message'
                        id='message'
                        rows='2'
                        value={message}
                        onChange={onChange}
                        placeholder='Enter your message here...'
                        className='w-full border p-3 rounded-lg'
                    ></textarea>

                    <Link
                        to={`mailto:${landlord.email}?subject=Regarding ${listing.name}&body=${message}`}
                        className='bg-slate-700 text-white text-center p-3 uppercase rounded-lg hover:opacity-95'
                    >
                        Send Message
                    </Link>
                </div>
            )}
        </>
    )
}

export default Contact;