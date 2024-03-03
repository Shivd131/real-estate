import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from "./pages/Home"
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import Profile from './pages/Profile'
import Header from './components/Header'
import About from './pages/About'
import PrivateRoute from './components/PrivateRoute'
import CreateListing from './pages/CreateListing'

export default function App() {
  return <BrowserRouter>
    <Header />
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/sign-in' element={<SignIn />} />
      <Route path='/sign-up' element={<SignUp />} />
      <Route element={<PrivateRoute />}>
        <Route path='/profile' element={<Profile />} />
      </Route>
      <Route element={<PrivateRoute />}>
        <Route path='/create-listing' element={<CreateListing />} />
      </Route>
      <Route path='/about' element={<About />} />

    </Routes>
  </BrowserRouter>
}
