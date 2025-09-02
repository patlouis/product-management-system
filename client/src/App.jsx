import { BrowserRouter, Routes, Route } from 'react-router-dom'

import ManageProducts from './pages/ManageProducts'
import ManageCategories from './pages/ManageCategories'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<ManageProducts />} />
        <Route path='/categories' element={<ManageCategories />} />
        <Route path='*' element={<h1>404 Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
