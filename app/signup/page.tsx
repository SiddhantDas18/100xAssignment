'use client'
import { useState } from 'react';
import React from 'react'; // Import React for React.FormEvent

interface SignUpResponse{
    msg:string,
}

// Main Signup component for the Next.js page
export default  function Signup() {
    const [username, setUsername] = useState(''); // New state for username
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        console.log('Signup attempt with:', { username, email, password });

        try{

            const response = await axios.post('/api/signup',{
                username,
                password,
                email
            })

            const data = response.data as SignUpResponse;
            alert(data.msg)
            

        }catch(e){

        }

    };

    return (

        <div className="min-h-screen w-screen bg-gradient-to-b from-[#f7f9fd] to-[#cfdaf6] flex flex-col justify-center items-center p-4">

            <div className="relative bg-[#e6ebf1]/40 rounded-xl p-8 max-w-md w-full sm:p-10 flex flex-col items-center text-center backdrop-blur-md bg-opacity-80 transform transition-all duration-300 ease-in-out hover:scale-[1.02]">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
                    Welcome to <span className="devs">100xDevs</span>
                </h1>
                <p className="text-gray-600 text-lg sm:text-xl mb-8">
                    Create an account to get started!
                </p>

                <form onSubmit={handleSignUp} className="w-full space-y-6">

                    <div>
                        <label htmlFor="username" className="block text-left text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            placeholder="your_username"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm
                                       transition-all duration-200 ease-in-out placeholder-gray-400 text-gray-900 text-base"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>


                    <div>
                        <label htmlFor="email" className="block text-left text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="name@email.com"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm
                                       transition-all duration-200 ease-in-out placeholder-gray-400 text-gray-900 text-base"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>


                    <div>
                        <label htmlFor="password" className="block text-left text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="••••••••"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm
                                           transition-all duration-200 ease-in-out placeholder-gray-400 text-gray-900 text-base pr-10"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </div>
                        </div>
                    </div>


                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg shadow-md
                                   hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                                   transition-all duration-200 ease-in-out transform hover:scale-[1.01]"
                    >
                        Sign Up
                    </button>
                </form>


                <div className="mt-6 text-sm flex justify-between w-full">
                    <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">Forgot password?</a>
                    <a href="/signin" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">Sign In</a>
                </div>
            </div>
        </div>
    );
}
