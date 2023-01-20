import { useState } from "react";
import APIService from "./APIService";
import {useCookies} from 'react-cookie';
import {Modal} from 'react-bootstrap';
import "../modal.css"

export function AddTransaction({closeModal,openmodal}) {
    
    const [name, setName] = useState('');
    const [total_amount, setTotalAmount] = useState(0);
    const [category, setCategory] = useState('');
    const [split_owe, setSplitOwe] = useState(true);   
    const [token] = useCookies(['token'])  
    var user_token = token['token']

    const handleSubmit = (event) => {
        event.preventDefault();
        APIService.CreateTransaction({name,category,total_amount,split_owe},'Token ' +user_token)
        .then(
            resp => console.log(resp)
        )
        .catch(error => console.log(error))
    }    
    
    function refreshPage() {
        window.location.reload(false);
    }
    
    return(
        <div className="modal show" style={{ display: 'block', position: 'initial' }}>
            <Modal show={openmodal}>
                <Modal.Header closeButton onClick={() => closeModal(false)}>
                <Modal.Title>Create Transaction</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <form onSubmit={handleSubmit}>
                        <input type="text" placeholder="Transaction Name" onChange ={e=> setName(e.target.value)}/>
                        <input type="text" placeholder="Transaction Category" onChange ={e=> setCategory(e.target.value)}/>
                        <input type="text" placeholder="Total Amount" onChange ={e=> setTotalAmount(e.target.value)} style={{marginBottom:"3%"}}/>
                        <label>Split Owe</label><input className="checkmark" type="checkbox" defaultChecked={true} onChange ={e=> setSplitOwe(e.target.checked)}/><br/><br/>
                        <button className="btn btn-primary" type="submit" style={{margin:"auto",display:"flex"}} onClick={refreshPage}>Submit</button>
                    </form> 
                </Modal.Body>
            </Modal>
        </div>
    );
}