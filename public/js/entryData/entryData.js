
import { dominio } from "../dominio.js"
import { closePopupsEventListeners,isInvalid,isValid,acceptWithEnter } from "../generalFunctions.js"

window.addEventListener('load',async()=>{

    let findImage
    let courseData    

    //close popups
    const closePopups = [uippClose]
    closePopupsEventListeners(closePopups)

    //entryData
    entryDataAccept.addEventListener("click",async(e)=>{
        //validations
        if (dni.value == '') {
            dniError.style.display = 'block'
            isInvalid([dni])
        }else{
            dniError.style.display = 'none'
            isValid([dni])
            findImage = await (await fetch(dominio + 'apis/find-image/' + dni.value)).json()
            courseData = await (await fetch(dominio + 'apis/course-data/' + idCourse.innerText)).json()
            if (findImage == null) {
                uippTitle.innerText = 'Debe ingrear una foto de perfil'
                uipp.style.display = 'block'
            }else{                
                window.location.href = courseData.url + '?usp=pp_url&entry.' + courseData.dni_entry_id + '=' + dni.value
            }            
        }
    })
    
    acceptWithEnter(dni,entryDataAccept)

    //upload image accept
    uippAccept.addEventListener("click",async(e)=>{

        e.preventDefault()

        const file = image.files[0]

        if (!file) {
            uippError.innerText = 'Debe ingresar una imagen'
            uippError.style.display = 'block'
            
        }else{
            const fileName = file.name
            const fileExtension = fileName.split('.').pop()
            
            if (fileExtension != 'jpg' && fileExtension != 'png') {
                uippError.innerText = 'Las extensiones permitidas son ".jpg" y ".png"'
                uippError.style.display = 'block'
            }else{
                const formData = new FormData()
                formData.append('image', file)
                formData.append('dni', dni.value)
                formData.append('idCourse', idCourse.innerText)                
                    
                const response = await fetch(dominio + 'apis/upload-image/' + dni.value, {
                    method: 'POST',
                    body: formData
                })

                window.location.href = courseData.url + '?usp=pp_url&entry.' + courseData.dni_entry_id + '=' + dni.value
                
            }
        }
        
    })

})