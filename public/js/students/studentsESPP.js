import { dominio } from "../dominio.js"
import g from "./globals.js"
import { isValid, isInvalidOk, showResultPopup, showOkPopup } from "../generalFunctions.js"
import { getData} from "./functions.js"
import { printTable } from "./printTable.js"

// edis student popup (espp)
async function esppEventListeners() {

    // accept
    esppAccept.addEventListener('click',async(e)=>{
        
        const errors = await esppValidations()

        if (errors == 0) {
            
            loader.style.display = 'block'

            const data = {
                id: g.idStudent,
                data:{
                    first_name: esppFirstName.value,
                    last_name: esppLastName.value,
                    email: esppEmail.value,
                    
                }
            }

            await fetch(dominio + 'apis/update/students',{
                method:'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            })

            //get data
            previousPage.style.color = 'grey'
            await getData()

            //print table
            printTable()

            espp.style.display = 'none'

            okText.innerText = 'Datos editados con éxito'

            showResultPopup(okPopup)

            loader.style.display = 'none'
            
        }

    })
    
}

async function esppValidations(){

    let errors = 0
    
    // lastName
    if (esppLastName.value == 0) {
        errors +=1
        isInvalidOk([esppLastName],'Debe completar el campo')        
    }else{
        isValid([esppLastName]) 
    }

    // firstName
    if (esppFirstName.value == 0) {
        errors +=1
        isInvalidOk([esppFirstName],'Debe completar el campo')        
    }else{
        isValid([esppFirstName]) 
    }

    // email
    if (esppEmail.value == 0) {
        errors +=1
        isInvalidOk([esppEmail],'Debe completar el campo')        
    }else{
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailRegex.test(esppEmail.value)) {
            errors +=1
            isInvalidOk([esppEmail],'Email inválido') 
        }else{
            isValid([esppEmail]) 
        }
    }

    return errors
    
}

export { esppEventListeners }