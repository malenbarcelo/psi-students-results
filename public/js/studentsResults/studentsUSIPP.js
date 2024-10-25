import { dominio } from "../dominio.js"
import srg from "./globals.js"
import {showOkPopup} from "../generalFunctions.js"
import {printTableSR} from "./printTable.js"
import {applyFilters} from "./functions.js"

//UPLOAD STUDENT IMAGE POPUP (usipp)
async function usippEventListeners() {

    usippAccept.addEventListener("click", async() => {

        const file = image.files[0]

        if (!file) {
            usippError.innerText = 'Debe ingresar una imagen'
            usippError.style.display = 'block'
            
        }else{
            const fileName = file.name
            const fileExtension = fileName.split('.').pop()
            
            if (fileExtension != 'jpg' && fileExtension != 'png') {
                usippError.innerText = 'Las extensiones permitidas son ".jpg" y ".png"'
                usippError.style.display = 'block'
            }else{
                const formData = new FormData()
                formData.append('image', file)
                formData.append('dni', srg.studentDniToUpload)
                formData.append('idCourse', srg.courseId)                
                    
                await fetch(dominio + 'apis/upload-image/' + srg.studentDniToUpload, {
                    method: 'POST',
                    body: formData
                })

                usipp.style.display = 'none'
                studentsResultsLoader.style.display = 'block'
                srg.studentsResults = await (await fetch(dominio + 'apis/students-results/' + srg.companyName + '/' + srg.courseName)).json()
                srg.studentsResultsFiltered = srg.studentsResults
                applyFilters()
                printTableSR(srg.studentsResultsFiltered)
                showOkPopup(usippOk)
            }
        }

    })

    //acceptWithEnter()
}

export {usippEventListeners}