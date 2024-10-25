import { dominio } from "./dominio.js"

window.addEventListener('load',async()=>{

    const associateForm = document.getElementById('associateForm')
    
    //Add events listeners
    var associatedForms = 0
    associateForm.addEventListener("click",async(e)=>{
        associatedForms += 1
        if (associatedForms<=10) {
            var associatedForm = document.getElementById('associatedForm' + associatedForms )
            associatedForm.classList.remove('notVisible')
        }
    })
})