import React, {useState, useEffect} from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)

  
    return (
    <div>
        <div className=''>
            <button onClick={()=> setCount = count + 1}>+</button>
            <div>0</div>
            <button>-</button>
        </div>
    </div>
  )
}
