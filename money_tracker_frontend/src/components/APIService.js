export default class APISerive {
    
    static LoginUser(body){
        return fetch('http://localhost:8000/api/login/',{
            method:'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body:JSON.stringify(body)
        }).then(resp => resp.json())
    }

    static UpdateTransaction(id,body,token){
        return fetch('http://localhost:8000/api/transactions/'+id+'/',{
            method:'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body:JSON.stringify(body)
        }).then(resp => resp.json())
    }

    static CreateTransaction(body,token){
        return fetch('http://localhost:8000/api/transactions/',{
            method:'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body:JSON.stringify(body)
        }).then(resp => resp.json())
    }

    static DeleteTransaction(id,token){
        return fetch('http://localhost:8000/api/transactions/'+id,{
            method:'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            }
        })
    }

}