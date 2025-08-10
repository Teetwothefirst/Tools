import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Root from './components/Root'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Root />
    </>
  )
}

export default App
