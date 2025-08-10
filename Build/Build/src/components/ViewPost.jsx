import React ,{useState, useEffect}from 'react'

export default function ViewPost() {
  const [posts, setPosts] = useState([])
  
  
  const url = "http://localhost:3000/api/posts"

  const getFetchedData = async () => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched Data:", data);
        setPosts(data); // Adjust based on the actual response structure
      } else {
        console.error('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  useEffect(() =>{
    getFetchedData();
  }, [])

    return (
    <div>
      <div>
        
        <div>
          <div className='flex justify-between items-center'>
            <div>
              <h1 className='text-2xl font-bold'>Teetwo Blog</h1>
              </div>
            <div>
              <input type="search" name="search" id="search" className='border border-gray-300 rounded-md p-2 w-full' placeholder="Search for your Favourite Article" />
            </div>
            <div>
              <button>Create Post</button>
            </div>
          </div>

           <div className='mt-4'>
            {/* <div>
              <button onClick={getFetchedData}>Fetch Posts</button>
            </div> */}
            <div className='mt-6'>
              <h2 className='text-xl font-semibold border-b-1'>Recent Posts</h2>
                {/* {posts.map(post => (
                  <div key={post.id}>
                    <h3>{post.title}</h3>
                    <p>{post.body}</p>
                  </div>
                ))} */}
              {
                posts.map(post =>{
                  return(
                  <div key={post.id} className='mt-4 p-2'>
                    <h3 className='text-2xl font-semibold'>{post.titlePost}</h3>
                    <p className=''>{post.descriptionPost}</p>
                  </div>
                  )
                })
              }
            </div>
           </div>
        </div>
      </div>
    </div>
  )
}
