import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Spinner } from "@nextui-org/react";
import { Swiper, SwiperSlide } from 'swiper/react'
import SwiperCore from 'swiper';
import { Navigation } from 'swiper/modules'
import 'swiper/css/bundle'

interface Listing {
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

function Listing() {
    SwiperCore.use([Navigation])
    const [listing, setListing] = useState<Listing>({
        imageUrls: ['https://firebasestorage.googleapis.com/v0/b/real-estate-2864e.appspot.com/o/1710326067709WIN_20230718_21_34_29_Pro.jpg?alt=media&token=921c124b-21ce-4a57-866f-9264d7829584'],
        name: '',
        description: '',
        address: '',
        type: 'rent',
        bedrooms: 1,
        bathrooms: 1,
        regularPrice: 50,
        discountPrice: 0,
        offer: false,
        parking: false,
        furnished: false,
    });
    console.log("listing is ", listing)
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [copied, setCopied] = useState(false);
    const [contact, setContact] = useState(false);
    const params = useParams();

    useEffect(() => {
        const fetchListing = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`/api/listing/get/${params.listingId}`);
                const data = res.data;
                if (data.success === false) {
                    setError(true);
                    setLoading(false);
                    return;
                }
                setListing(data as Listing);
                setLoading(false);
                setError(false);
            } catch (error) {
                setError(true);
                setLoading(false);
            }
        };
        fetchListing();
    }, [params.listingId]);

    return (
        <div className='flex justify-center items-center h-[80vh]'>
            {loading && <Spinner className='scale-150' size="lg" />}
            {error && <p className='text-3xl'>Something went Wrong!</p>}
            {listing && !loading && !error && (
                <Swiper className='self-start' navigation>
                    {listing.imageUrls.map(url => (
                        <SwiperSlide key={url}>
                            <div className='h-[550px] w-[100vw]' style={{ background: `url(${url}) center/cover no-repeat`  }}></div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            )}
        </div>
    );
}

export default Listing