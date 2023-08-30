import {
  Route,
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements
} from 'react-router-dom'

import Header from './components/Header'
import Home from './components/Home'
import Payouts from './components/Payouts'
import Reporting from './components/Reporting'

import './App.css'

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Header />}>
        <Route index element={<Home />} />
        <Route path="/payouts" element={<Payouts />} />
        <Route path="/reporting" element={<Reporting />} />
      </Route>
    )
  )
  return <RouterProvider router={router} />
}

export default App
