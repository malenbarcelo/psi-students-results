import g from "./globals.js"
import { isValid } from "../generalFunctions.js"

async function printTable() {

    body.innerHTML = ''
    let html = ''
    const data = g.students

    data.forEach((element,index) => {

        const rowClass = index % 2 === 0 ? 'tBody3 tBodyEven' : 'tBody3 tBodyOdd'

        html += `
            <tr>
                <th class="${rowClass}">${element.company}</th>
                <th class="${rowClass}">${element.dni}</th>
                <th class="${rowClass}">${element.last_name}</th>
                <th class="${rowClass}">${element.first_name}</th>
                <th class="${rowClass}">${element.email}</th>
                <th class="${rowClass}"><i class="fa-regular fa-pen-to-square allowedIcon" id="edit_${element.id}"></i></th>
            </tr>
            `
    })

    body.innerHTML = html

    eventListeners()
}

function eventListeners() {

    g.students.forEach(element => {

        const edit = document.getElementById('edit_' + element.id)

        //edit
        edit.addEventListener('click',async()=>{

            isValid([esppLastName, esppFirstName, esppEmail])

            g.idStudent = element.id
            esppLastName.value = element.last_name
            esppFirstName.value = element.first_name
            esppEmail.value = element.email
            esppDni.value = element.dni
            

            espp.style.display = 'block'

            
        })
    })
}

export { printTable }