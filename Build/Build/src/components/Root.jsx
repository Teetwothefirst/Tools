import React from 'react'
import CreatePost from './CreatePost'
import ViewPost from './ViewPost'

export default function Root() {
  return (
    <div>
      {/* <h1>Hello, Adetomiwa!</h1>
        <p>Welcome to my Blog Application.</p> */}
        <div>
            
            <div>
                <CreatePost />
                {/* <ViewPost />  */}
            </div>
        </div>
    </div>
  )
}
