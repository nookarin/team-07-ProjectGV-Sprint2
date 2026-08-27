import React from 'react'
import img_product1 from "../../assets/image-product/Gemini_Generated_Image_4knuxp4knuxp4knu.jpg";
import ProductCard from '#components/ProductCard/ProductCard';
import { useParams } from 'react-router-dom';

const ProductListPage = () => {
    const param = useParams();
    console.log(param.id)
  return (
    <div className='min-h-screen bg-gbg-3'>
        <div className='h-60 border flex flex-col justify-center items-center border-gbase-1 bg-linear-to-br from-gbg-1 0% via-50% via-gbase-3 to-gpurple-5/40'>
            <div className='text-white text-center'>
                <h3 className='font-bold tracking-widest'>COLLECTION</h3>
                <h1 className='font-light text-7xl tracking-tighter capitalize'>{param.id}<span className='text-gcyan-light'>.</span></h1>
            </div>
        </div>
        <div className='w-9/12 py-14 mx-auto'>
            <div className='grid grid-cols-3 gap-20'>
                <ProductCard img={img_product1} />
                <ProductCard img={img_product1} />
                <ProductCard img={img_product1} />
                <ProductCard img={img_product1} />
                <ProductCard img={img_product1} />
            </div>
        </div>
    </div>
  )
}

export default ProductListPage