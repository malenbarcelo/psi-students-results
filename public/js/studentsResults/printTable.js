import {dateToString} from "../generalFunctions.js"
import srg from "./globals.js"

async function printTableSR(dataToPrint) {

    studentsResultsLoader.style.display = 'block'
    studentsResultsBody.innerHTML = ''
    let counter = 0

    let html = ''

    dataToPrint.forEach(element => {

        const rowClass = counter % 2 == 0 ? 'tBody3 tBodyEven' : 'tBody3 tBodyOdd'
        const studentData = element.student_data.filter( sd => sd.company == element.company)[0]

        // let notPassedAssociations = 0
        // element.associatedResults.forEach(ar => {
        //     if (ar.data == 'noInfo' || ar.passed == 0) {
        //         notPassedAssociations += 1
        //     }
        // })
        
        //const color = element.passed == 0 ? 'redColor' : (notPassedAssociations > 0 ? 'yellowColor' : 'greenColor')
        const color = element.passed == 0 ? 'redColor' : (element.notPassedAssociations > 0 ? 'yellowColor' : 'greenColor')
        const camera = element.student_image.length != 0 ? '<i class="fa-solid fa-camera okIcon" id="image_' + element.id + '"></i>' : '<i class="fa-solid fa-camera errorIcon" id="image_' + element.id + '"></i>'
        
        const checkIcon = (element.student_image.length != 0 && color == 'greenColor') ? '<input type="checkbox" name="' + element.id + '" id="check_' + element.id + '" class="checkbox1">' : ''

        //complete downloadAlloweded
        if (camera == '' && color == 'greenColor') {
            srg.downloadAlloweded.push(element.id)
        }

        //get expiration color
        let expirationColor = ''
        if (element.validity != 0 && color == 'greenColor') {
            expirationColor = element.daysToExpiration < 30 ? 'redColor' : element.daysToExpiration < 60 ? 'yellowColor' : 'greenColor'            
        }
        const daysToExpiration = element.daysToExpiration <= 0 ? 'vencido' : (parseInt(element.daysToExpiration) + ' días')

        //complete observations
        let observations = ''
        if (element.observations != "N/A" && element.observations != null && element.observations != '') {
            const line1 = '<div class="srObsDiv" id="srObsDiv_' + element.id + '">'
            const line2 = '<i class="fa-regular fa-comment-dots allowedIcon" id="obs_' + element.id + '"></i>'
            const line3 = '<div class="srObs" id="srObs_' + element.id + '"><div class="popupIcons"><div class="srObsIcon1"><i class="fa-regular fa-comment-dots"></i></div><div class="srObsIcon2" id="close_' + element.id + '"><i class="fa-solid fa-square-xmark popupCloseIcon"></i></div></div>'
            const line4 = '<div class="srObsTitle" id="obppMainTitle">OBSERVACIONES</div>'
            const line5 = '<div id="srObsText">' + element.observations + '</div>'
            const line10 = '</div></div>'
            const obsDiv = line1 + line2 + line3 + line4 + line5 + line10
            observations = obsDiv
        }

        html += `
            <tr>
                <th class="${rowClass}">${element.company}</th>
                <th class="${rowClass}">${dateToString(element.date)}</th>
                <th class="${rowClass}">${element.dni}</th>
                <th class="${rowClass}">${studentData.last_name + ', ' + studentData.first_name}</th>
                <th class="${rowClass}">${studentData.email}</th>
                <th class="${rowClass + ' ' + color}">${(element.grade * 100).toFixed(2) + '%'}</th>
                <th class="${rowClass}">${element.validity == 0 ? '-' : element.validity}</th>
                <th class="${rowClass + ' ' + expirationColor}">${(element.validity == 0 || color != 'greenColor') ? '-' : dateToString(element.expirationDate) + '<br>' + daysToExpiration}</th>
                <th class="${rowClass}"><i class="fa-solid fa-circle-info allowedIcon" id="info_${element.id}"></i></th>
                <th class="${rowClass}">${observations}</th>
        `

        if (srg.courseData.includes_certificate == 1 && srg.idUserCategory != 4) {
            html += `
                <th class="${rowClass}">${ camera }</th>
            `
        }

        if (srg.courseData.includes_certificate == 1) {
            html += `
                <th class="${rowClass}">${ checkIcon }</th>
            `
        }
        
        html += `
                </tr>
            `

        

        counter += 1
    })

    studentsResultsBody.innerHTML += html

    srEventListeners(dataToPrint)

    studentsResultsLoader.style.display = 'none'
    
}

function srEventListeners(dataToPrint) {

    dataToPrint.forEach(element => {

        const info = document.getElementById('info_' + element.id)
        const obs = document.getElementById('obs_' + element.id)
        const srObs = document.getElementById('srObs_' + element.id)
        const close = document.getElementById('close_' + element.id)
        const check = document.getElementById('check_' + element.id)
        const image = document.getElementById('image_' + element.id)

        //associated forms info
        info.addEventListener('click',async()=>{
            const studentData = element.student_data.filter( sd => sd.company == element.company)[0]

            arppMainTitle.innerHTML = studentData.last_name + ', ' + studentData.first_name
            if (element.associatedResults.length == 0) {
                arppNoAssociatedForms.style.display = 'flex'
                arppTable.style.display = 'none'
            }else{
                arppNoAssociatedForms.style.display = 'none'
                printAssociatedResults(element)
                arppTable.style.display = 'block'
            }
            arpp.style.display = 'block'
        })

        //observations
        if (obs) {
            obs.addEventListener('click',async()=>{
                srObs.style.display = 'block'
                dataToPrint.forEach(e => {
                    if (e.id != element.id) {
                        const srObs = document.getElementById('srObs_' + e.id)
                        if (srObs) {
                            srObs.style.display = 'none'
                        }
                    }
                })
            })
        }

        //upload image
        if (image) {
            image.addEventListener('click',async()=>{
                srg.studentDniToUpload = element.dni
                image.value = ''
                usippError.style.display = 'none'
                usippTitle.innerText = element.last_name + ', ' + element.first_name
                usipp.style.display = 'block'
            })
        }

        //close observations
        if (close) {
            close.addEventListener('click',async()=>{
                srObs.style.display = 'none'
            })
        }

        if (check) {
            check.addEventListener('click',async()=>{
                if (check.checked) {
                    srg.downloadSelected.push(element.id)
                    if (srg.downloadAlloweded.length == srg.downloadSelected.length) {
                        thCheck.checked = true
                    }   
                }else{
                    srg.downloadSelected = srg.downloadSelected.filter(ds => ds != element.id)
                    thCheck.checked = false
                }
            })
        }
    })
}

async function printAssociatedResults(dataToPrint) {

    arppBody.innerHTML = ''
    let counter = 0

    let html = ''

    dataToPrint.associatedCourses.forEach(c => {

        const rowClass = counter % 2 == 0 ? 'tBody1 tBodyEven' : 'tBody1 tBodyOdd'
        dataToPrint.associatedResults = dataToPrint.associatedResults.filter(ar => ar != null)
        const findResults = dataToPrint.associatedResults.filter( ar => ar.form_name == c.course_name)
        
        if (findResults.length > 0) {
            const color = findResults[0].passed == 0 ? 'redColor' : 'greenColor'
            const observations = (findResults[0].observations == null || findResults[0].observations == 'N/A') ? '' : findResults[0].observations
            html += `
            <tr>
                <th class="${rowClass}">${findResults[0].form_name}</th>
                <th class="${rowClass}">${dateToString(findResults[0].date)}</th>
                <th class="${rowClass + ' ' + color}">${findResults[0].grade * 100 + '%'}</th>
                <th class="${rowClass}">${observations}</th>
            </tr>
        `   
        }else{
            html += `
            <tr>
                <th class="${rowClass}">${c.course_name}</th>
                <th class="${rowClass}">--</th>
                <th class="${rowClass}">--</th>
                <th class="${rowClass}">Examen no rendido</th>
            </tr>
        `   

        }

        
        counter += 1
    })

    arppBody.innerHTML += html
    
}

async function printAssociatedFormsData() {

    afrppBody.innerHTML = ''
    const dataToPrint = srg.associatedFormsResultsFiltered
    let counter = 0

    let html = ''

    dataToPrint.forEach(element => {

        const rowClass = counter % 2 == 0 ? 'tBody1 tBodyEven' : 'tBody1 tBodyOdd'
        const color = element.results[0].passed == 0 ? 'redColor' : 'greenColor'
        const date = element.results[0].date.split(' ')[0]
        const day = date.split('-')[2]
        const month = date.split('-')[1]
        const year = date.split('-')[0]
        const dateString = String(day).padStart(2,'0') + '/' + String(month).padStart(2,'0') + '/' + year
        const studentData = element.results[0].student_data.filter(sd => sd.company == element.company)[0]
        
        
        html += `
            <tr>
                <th class="${rowClass}">${dateToString(element.results[0].date)}</th>
                <th class="${rowClass}">${element.form_name}</th>
                <th class="${rowClass}">${element.company}</th>
                <th class="${rowClass}">${element.dni}</th>
                <th class="${rowClass}">${studentData.last_name + ', ' + studentData.first_name}</th>
                <th class="${rowClass + ' ' + color}">${parseFloat(element.results[0].grade,2) * 100 + '%'}</th>
                <th class="${rowClass}">${element.results[0].days_to_expiration == -9999 ? '-' : dateToString(element.results[0].expiration_date)}</th>                
        `
        counter += 1

    })

    afrppBody.innerHTML += html
    
}



export {printTableSR, printAssociatedFormsData}