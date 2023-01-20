import { useEffect, useState } from "react";
import { Container, Card } from "react-bootstrap";
import {useCookies} from 'react-cookie';
import APIService from "./APIService";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useParams } from 'react-router-dom';

const LoanList = () => {

  const textStyle = {
    padding: "10px",
    fontFamily: "Cursive",
    fontSize:"large"
  };

  const checkmark = {
    position: "absolute",
    left: 80,
    height: '25px',
    width: '25px',
    display:"flex"
  }


  const { id } = useParams()

  const [token] = useCookies(['token'])  
  var user_token = token['token']

  const [transaction, setTransaction] = useState({});  

  function UpdateFriendLoan(check_value,loan_id,transaction_id) {
      const is_paid = check_value
      APIService.UpdateTransaction(transaction_id,{loan_id,is_paid},'Token ' +user_token)
      .then(
          resp => {
            console.log(resp.message)
            toast(resp.message)
            setTimeout(function(){
              window.location.reload();
           }, 5000);
          }
      )
      .catch(error => {console.log(error)})
      
  }

  function convertDate(inputFormat) {
    function pad(s) { return (s < 10) ? '0' + s : s; }
    var d = new Date(inputFormat)
    return [pad(d.getDate()),pad(d.getMonth()+1), d.getFullYear()].join('-')
  }

  useEffect(() =>{
      var user_token = token['token']
      const loadloans = async () => {
        const resp = await axios.get("http://localhost:8000/api/transactions/"+id,{headers : {'Authorization': 'Token ' +user_token}})
        setTransaction(resp.data);
      }
      loadloans();
    }, [token]);
  
  function Loans({ transaction }) {
    let paid_date = convertDate(transaction.created_at)
    return (
      <div>
        <div>
        <Card>
          <Card.Body><Card.Title>{transaction.name} - {transaction.category} ({paid_date})</Card.Title></Card.Body>
        </Card>
          <Container>
          <div className="row my-5" style={{display:"flex",margin:"auto"}}>
            {
              transaction.friends_transactions && transaction.friends_transactions.length ?  (
              transaction.friends_transactions.map(loan => (   
                <div className="col my-3">
                  <Card style={{width:"500px"}}>
                      <Card.Body>
                        <label class="container" style={{left:0,display:"flex"}}>Is Paid<input type="checkbox" class="checkbox" style={checkmark} onChange ={e=> UpdateFriendLoan(e.target.checked,loan.id,transaction.id)} defaultChecked={loan.is_paid}/></label>
                        <div style={textStyle}>Friend : {loan.friend.username}</div>
                        <div style={textStyle}>Amount : {loan.amount}</div>
                      </Card.Body>
                    </Card>
                </div>
                ))) : (<div><h5>No Split Data Found. Might be its an individual Transaction</h5></div>)
              }
          </div>
          </Container>
        </div>
        
      </div>
    );
  }
  
  return (
    <>
    <Loans transaction={transaction}/>
    <ToastContainer/>
    </>
  );
};

export default LoanList