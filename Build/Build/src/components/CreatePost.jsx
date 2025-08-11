import React, {useState} from 'react'

export default function CreatePost() {
  
  const [inputValue, setInputValue] = useState('')
  const [textareaValue, settextareaValue] = useState('')

  const handleinputChange = (e)=>{
    setInputValue(e.target.value)
  }
  const handletextareaChange = (e)=>{
    settextareaValue(e.target.value)
  }

   const data = {
            title: inputValue,
            description: textareaValue
    }
    const handleSubmit = async (e) =>{
      
      const url = "http://localhost:3000/api/createPost"
      console.log("Send Data to backend")
      
      try {
        const response = await fetch(url,
            {
                method: 'POST',
                headers: {
                'Accept': 'application/json',
                'content-type': 'application/json'
                },
                body: JSON.stringify({
                  title: inputValue,
                  description: textareaValue
                })
            }
        )
        if(response.ok){
          console.log("Data Submitted Successfully")
        }else{
          console.error('Failed to Submit Data')
        }
      }
      catch(error){
        console.error('Error Submitting Data', error)
      }
    }

    function CreatedPost(data){

    } 
    return (
    <div>
      <div className='flex flex-col items-center justify-center gap-2 h-screen'>
        <h2 className='text-2xl font-bold'>Create a New Post</h2>
        <p>Share your thoughts with the world</p><br />
        <input type="text" name="postTitle" id="postTitle" placeholder="Post Title" value={inputValue} onChange={handleinputChange} className='border border-gray-300 p-2 rounded-md w-72'/>
        <textarea name="postBody" id="postBody" placeholder='post description' value={textareaValue} onChange={handletextareaChange} className='border border-gray-300 py-2 px-3 rounded-md w-72'></textarea>
        <br />   
        <button onClick={handleSubmit}>Create Post </button>
      </div>
    </div>
  )
}
