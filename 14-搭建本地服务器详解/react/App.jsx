import React, { memo, useState } from 'react'

const App = memo(() => {
  const [count, setCount] = useState(0)
  return (
    <div>
      <h2>当前计数: {count}</h2>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  )
})

export default App