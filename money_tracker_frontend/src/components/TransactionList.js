import axios from "axios";
import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import {useCookies} from 'react-cookie';
import "../App.css";
import APIService from "./APIService";
import { AddTransaction } from "./AddTransaction";
import { useNavigate } from "react-router-dom";

const TransactionList = () => {

  let navigate = useNavigate()

  const [token] = useCookies(['token'])  

  const [modalOpen, setModalOpen] = useState(false);

  const [transactions, setTransactions] = useState([]);
  const [searchcategory, setSearchcategory] = useState("");
  const [startDate, setDatecategory] = useState("");

  const checkmark = {
    height: '18px',
    width: '18px',
  }

  function convertDate(inputFormat) {
    function pad(s) { return (s < 10) ? '0' + s : s; }
    var d = new Date(inputFormat)
    return [pad(d.getMonth()+1),pad(d.getDate()), d.getFullYear()].join('-')
  }

  const onDateChange = (e) => {
    let startDate = convertDate(e.target.value);
    setDatecategory(startDate);
  };

  useEffect(() =>{
      var user_token = token['token']
      const loadtrans = async () => {
        const resp =await axios.get("http://localhost:8000/api/transactions/",{headers : {'Authorization': 'Token ' +user_token}})
        setTransactions(resp.data);
      }
      loadtrans();
    }, [token]);
  
  
  const openUpdatePage = (id) => {
    navigate('/transactions/'+id)
  }

  const delTransaction = (id) => {
    var user_token = token['token']
    console.log(id,token)
    APIService.DeleteTransaction(id,'Token ' +user_token)
        .then(
            resp => {
              console.log(resp)
              window.location.reload(false)
            }
        )
        .catch(error => console.log(error))
  }
  
  function Table({ transactions }) {
    return (
      <table cellPadding="20" cellSpacing="10" style={{borderCollapse: "collapse",margin: "auto"}}>
        <thead>
          <th>Transaction Name</th>
          <th>Transaction Category</th>
          <th>Paid by</th>
          <th>Total Amount</th>
          <th>Complete</th>
          <th>Update Transaction</th>
          <th>Delete Transaction</th>
        </thead>
        <tbody>
          {transactions.filter((value)=>{
          const value_date= new Date(value.created_at)
          
          if(searchcategory === "" && startDate===""){
            return value;
          } 
          else if ((value.category.toLowerCase().includes(searchcategory.toLowerCase())) && startDate==="") {
            return value;
          }
          
          else if((convertDate(value_date) ===(startDate)) && searchcategory === ""){
            return value;
          }
          
          else if(searchcategory && startDate){
              if((value.category.toLowerCase().includes(searchcategory.toLowerCase())) && (convertDate(value_date) ===(startDate))){
                return value;
              }
          }

          }).map(transaction => (
            <tr>
              <td>{transaction.name}</td>
              <td>{transaction.category}</td>
              <td>{transaction.created_by.username}</td>
              <td>{transaction.total_amount}</td>
              {transaction.is_completed ? (
                <td><input type="checkbox" defaultChecked={true} style={checkmark}/></td>
              ) : (
                <td><input type="checkbox" defaultChecked={false} style={checkmark}/></td>
              )}
              <td><button className="btn btn-warning" onClick={() => openUpdatePage(transaction.id)}>Update</button></td>
              <td><button className="btn btn-danger" onClick={()=>delTransaction(transaction.id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  const opencreationModal = () => {
    setModalOpen(true)
  }
  
  return (
    <div>
      <Container>
      <div className="row my-5" style={{margin:"auto"}}>
        <div className="col my-2">
          <label htmlFor="category" style={{float:'left'}}>Category</label>
          <input
            className="form-control"
            id="category"
            placeholder="Enter the Category"
            onChange={(e) => setSearchcategory(e.target.value)}
          />
        </div>

        <div className="col my-2">
          <label htmlFor="Date" style={{float:'left'}}>Date</label>
          <input
            type="date"
            className="form-control"
            id="Date"
            onChange={onDateChange}
          />
        </div>

        <div className="col my-4">
          <a className="btn btn-primary openModalBtn" style={{marginTop:'6px'}} onClick={opencreationModal}>Create Transaction</a>
        </div>

      </div>
      {modalOpen && <AddTransaction closeModal={setModalOpen} openmodal={modalOpen}/>}
      </Container>
      <Table transactions={transactions}/>
    </div>

  );
};

export default TransactionList