import "./App.css";
import NavBar from './components/Navbar';
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import LoanList from "./components/LoanList"
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import {useCookies} from 'react-cookie';
import { useState,useEffect } from "react";


function App() {
  
  const [token] = useCookies(['token'])
        
  const[islogged, setLogged] = useState(false);

  useEffect(()=>{
    var user_token = token['token']
    if(String(user_token)!=='undefined'){
      setLogged(true);
    }
  },[])

  return (
    <div className="App">
      <BrowserRouter>
        <NavBar data={islogged}/>
        <Routes>
          <Route path='/login' element={<Login />}/>  
          <Route path='/' element={<Dashboard />}/>
          <Route path='/transactions/:id' element={<LoanList />}/>
          
        </Routes>
      </BrowserRouter>
      <br />
    </div>
  );
}

export default App;
