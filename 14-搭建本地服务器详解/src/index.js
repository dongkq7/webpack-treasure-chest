import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './react/App'
import { sum } from './ts/index'
import axios from 'axios'

axios.get('/api/users').then(res => {
  console.log(res)
})

ReactDOM.createRoot(document.getElementById('root')).render(<App />)

console.log(sum(10, 20))