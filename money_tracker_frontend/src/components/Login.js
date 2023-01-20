import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import APIService from "./APIService";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {useCookies} from 'react-cookie';

function Login(){

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [token, setToken] = useCookies(['token'])
    let navigate = useNavigate()

    useEffect(()=>{
        var user_token = token['token']
        if(String(user_token)==='undefined'){
            navigate('/login')
        }
        else{
            navigate('/')
        }
    },[token,navigate])
    

    const loginBtn = () => {
        if(email.trim().length!==0 && password.trim().length){
            APIService.LoginUser({email,password})
            .then(
                resp => {
                    if(resp.errorType){
                        toast(resp.errorType,"-",resp.errorMessage)
                    }
                    else{
                        setToken('token',resp.token)
                        window.location.reload(false)
                    }
                    
                }
            )
            .catch(error => { toast(error)})
        }
        else{
            navigate('/login')
            toast("Creds are Manditory")
        }
    }
    
    return (
        <div className="App">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-4 card" style={{ marginTop: 10+'%' }}><br /><br />
                        <h5 style={{fontWeight: 'bold'}}>Please Login Here</h5><br/>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input type="text" value={email} className="form-control" placeholder="Enter email" onChange ={e=> setEmail(e.target.value)}/>
                        </div>

    
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input type="password" value={password} className="form-control" placeholder="Enter Password" onChange ={e=> setPassword(e.target.value)}/>
                        </div>

                        <br />
                        <div><button onClick={loginBtn} className="btn btn-primary">Login</button></div><br /><br />
                    </div>
                    
                </div>
            </div>    
            <ToastContainer/>        
        </div>
    )
}

export default Login