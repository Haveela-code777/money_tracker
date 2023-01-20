import { useEffect, useState } from "react";
import axios from "axios"
import { useNavigate } from "react-router-dom";
import {useCookies} from 'react-cookie';
import {Card, ListGroup} from 'react-bootstrap';
import TransactionList from "./TransactionList";

function Dashboard(){
    const user_data_url = "http://localhost:8000/api/user_data/"

    const [userdata, set_dashboard_data] = useState(null);
    const [token] = useCookies(['token']);
    const navigate = useNavigate();


    useEffect(()=>{
        var user_token = token['token']
        if(String(user_token)==='undefined'){
            navigate('/login')
        }
        else{
            navigate('/')
        }
    },[token,navigate])

    const fetchData = () => {
        
        var user_token = token['token']

        axios.get(user_data_url,{headers : {'Authorization': 'Token ' +user_token}})
        .then(
          res=> {
            set_dashboard_data(res.data)
          })
        .catch((err)=>console.log(err))
    }
    
    useEffect(()=> {
      fetchData()
    },[]);

    if (userdata){
      return (
        <div>
          <h1 style={{marginTop:'2%'}}>Dashboard</h1><br/>
          <div style={{ display:'flex', justifyContent:'center'}}>
            <Card style={{ backgroundColor:'#b5b5b5', width:'700px' }}>
              <Card.Body>
              <Card.Title>Your Stats</Card.Title>
                <ListGroup variant="flush">
                  <ListGroup.Item action variant="light" >Total Amount Spent : {userdata.total_amount_spent}</ListGroup.Item>
                  <ListGroup.Item action variant="light" >Budget Remaining   : {userdata.budget_remaining}</ListGroup.Item>
                  <ListGroup.Item action variant="light">People Who Owes you : {userdata.who_owes_you && userdata.who_owes_you.map(friend_owe =>{
                      return(
                          <a>{friend_owe} </a>
                          )
                      })}
                  </ListGroup.Item>
                  <ListGroup.Item action variant="light">People Who you Owe: {userdata.who_you_owe && userdata.who_you_owe.map(ur_owe =>{
                      return(
                        <a>{ur_owe} </a>
                          )
                      })}
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </div>
          <TransactionList/>
        </div>
      )    
    }
};

export default Dashboard