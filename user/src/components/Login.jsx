// import { Input } from '@headlessui/react'
// import {Link } from "react-router-dom";
import EAL from '../assets/EAL.jpg'

function Login(){
    return(
        <>
            <div className="">               
                <section className="h-screen flex items-center justify-center bg-slate-100">
                    <main className="flex justify-center items-center bg-slate-100 p-3">
                        <div className="flex justify-center items-center bg-white p-5">
                            <div>
                                <form action="/" className="">
                                    <div className="flex justify-center">
                                        <img src={EAL} alt="EAL Logo" width={50} height={50}/>
                                    </div>
                                    <h2 className="h2 mb-4 text-center">Login to your account</h2>
                                    <div>

                                    <input type="text" className="w-full p-2 border rounded-md" name="" id="" placeholder='username' />
                                    <br />
                                    <br />
                                    
                                    <input type="password" className="w-full p-2 border rounded-md" name="" id="" placeholder='password' />

                                    <p className='warningToggle'><small>Passwords must be 8 digits, alphanumeric</small></p>
                                    <div className="mb-5">
                                        <input type="checkbox" name="" id="" className="mr-2 text-red-800" />Remember me 
                                        
                                    </div>
                                    <div className="w-100 flex">
                                    {/* <Link className='rounded-full bg-blue-950 p-2 w-100 mb-5 text-white w-full text-center' to={"/dashboard"}>Login</Link> */}
                                        <a href="#" className='rounded-full bg-red-800 p-2 w-100 mb-5 text-white w-full text-center'>Login</a>
                                    </div>
                    
                                    <p className="text-center mb-5"> or sign up with</p>
                                    <button className='flex justify-center items-center gap-1 border rounded-full border-gray-300 w-100 p-2'>
                                    <svg width="33" height="32" viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M29.574 13.3887H28.5V13.3334H16.5V18.6667H24.0354C22.936 21.7714 19.982 24.0001 16.5 24.0001C12.082 24.0001 8.50002 20.4181 8.50002 16.0001C8.50002 11.5821 12.082 8.00008 16.5 8.00008C18.5394 8.00008 20.3947 8.76941 21.8074 10.0261L25.5787 6.25475C23.1974 4.03541 20.012 2.66675 16.5 2.66675C9.13669 2.66675 3.16669 8.63675 3.16669 16.0001C3.16669 23.3634 9.13669 29.3334 16.5 29.3334C23.8634 29.3334 29.8334 23.3634 29.8334 16.0001C29.8334 15.1061 29.7414 14.2334 29.574 13.3887Z" fill="#FFC107"/>
                                        <path d="M4.70398 9.79408L9.08465 13.0067C10.27 10.0721 13.1406 8.00008 16.5 8.00008C18.5393 8.00008 20.3946 8.76941 21.8073 10.0261L25.5786 6.25475C23.1973 4.03541 20.012 2.66675 16.5 2.66675C11.3786 2.66675 6.93731 5.55808 4.70398 9.79408Z" fill="#FF3D00"/>
                                        <path d="M16.5 29.3333C19.944 29.3333 23.0733 28.0153 25.4393 25.872L21.3127 22.38C19.974 23.394 18.31 24 16.5 24C13.032 24 10.0873 21.7886 8.978 18.7026L4.63 22.0526C6.83667 26.3706 11.318 29.3333 16.5 29.3333Z" fill="#4CAF50"/>
                                        <path d="M29.574 13.3886H28.5V13.3333H16.5V18.6666H24.0353C23.5073 20.1579 22.548 21.4439 21.3107 22.3806L21.3127 22.3793L25.4393 25.8713C25.1473 26.1366 29.8333 22.6666 29.8333 15.9999C29.8333 15.1059 29.7413 14.2333 29.574 13.3886Z" fill="#1976D2"/>
                                    </svg>
                                    Google
                                    </button>
                                
                                    <p className="text-center">Already have an account? <a href="#">Login now</a></p>
                                    </div>
                                    
                                </form>
                            </div>
                        </div>
                    </main>
                </section>
                
            </div>
        </>
    )
}
export default Login;