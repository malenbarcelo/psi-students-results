import {dateToString} from "../generalFunctions.js"
import srg from "./globals.js"

async function printTableSR(dataToPrint) {

    studentsResultsLoader.style.display = 'block'
    studentsResultsBody.innerHTML = ''
    let counter = 0

    let html = ''

    dataToPrint.forEach(element => {

        const rowClass = counter % 2 == 0 ? 'tBody1 tBodyEven' : 'tBody1 tBodyOdd'

        let notPassedAssociations = 0
        element.associatedResults.forEach(ar => {
            if (ar.data == 'noInfo' || ar.passed == 0) {
                notPassedAssociations += 1
            }
        })
        
        const color = element.passed == 0 ? 'redColor' : (notPassedAssociations > 0 ? 'yellowColor' : 'greenColor')
        const camera = element.student_image.length != 0 ? '' : '<i class="fa-solid fa-camera errorIcon" id="image_' + element.id + '"></i>'
        const checkIcon = (camera == '' && color == 'greenColor') ? '<input type="checkbox" name="' + element.id + '" id="check_' + element.id + '" class="checkbox1">' : ''

        //complete downloadAlloweded
        if (camera == '' && color == 'greenColor') {
            srg.downloadAlloweded.push(element.id)
        }

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
                <th class="${rowClass}">${element.last_name + ', ' + element.first_name}</th>
                <th class="${rowClass}">${element.email}</th>
                <th class="${rowClass + ' ' + color}">${(element.grade * 100).toFixed(2) + '%'}</th>
                <th class="${rowClass}"><i class="fa-solid fa-circle-info allowedIcon" id="info_${element.id}"></i></th>
                <th class="${rowClass}">${observations}</th>
        `

        if (srg.courseData.includes_certificate == 1) {
            html += `
                <th class="${rowClass}">${ camera }</th>
                <th class="${rowClass}">${ checkIcon }</th>
            </tr>
            `
        }else{
            html += `
                </tr>
            `
        }

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
            arppMainTitle.innerHTML = element.last_name + ', ' + element.first_name
            if (element.associatedResults.length == 0) {
                arppNoAssociatedForms.style.display = 'flex'
                arppTable.style.display = 'none'
            }else{
                console.log(element)
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

export {printTableSR}