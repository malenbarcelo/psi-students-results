import { dominio } from "../dominio.js"
import srg from "./globals.js"
import {printTableSR} from "./printTable.js"
import {applyFilters} from "./functions.js"
import {clearInputs,closePopupsEventListeners,showTableInfo, predictElements, selectFocusedElement} from "../generalFunctions.js"

//popups event listeners
import {usippEventListeners} from "./studentsUSIPP.js"

window.addEventListener('load',async()=>{

    studentsResultsLoader.style.display = 'block'

    srg.courseName = course.innerText
    srg.courseId = courseId.innerText
    srg.companyName = companyName.innerText
    srg.idUserCategory = idUserCategory.innerText

    //get data
    srg.courseData = await (await fetch(dominio + 'apis/course-data/' + srg.courseId)).json()

    //hide certificates if applies
    if (srg.courseData.includes_certificate == 0) {
        srBoxDownload.style.display = 'none'
        thCamera.classList.add('notVisible')
        checkIcon.classList.add('notVisible')       
    }else{
        srBoxDownload.style.display = 'block'
        srMainFilters.classList.remove('mbxl')
        thCamera.classList.remove('notVisible')
        checkIcon.classList.remove('notVisible')
    }

    srg.studentsResults = await (await fetch(dominio + 'apis/students-results/' + srg.companyName + '/' + srg.courseName)).json()

    srg.studentsResultsFiltered = srg.studentsResults

    printTableSR(srg.studentsResultsFiltered)

    //add popups event listeners
    usippEventListeners()

    //filters
    const filterCompany = document.getElementById('filterCompany')
    const filters = [filterCompany,filterResult,filterDni,filterFrom,filterUntil,filterName]
    filters.forEach(filter => {
        if(filter){
            filter.addEventListener("change", async() => {
                applyFilters()
                printTableSR(srg.studentsResultsFiltered)
            })
        }
    })

    //unFilter
    unfilter.addEventListener("click", async() => {
        clearInputs([filterCompany,filterResult,filterDni,filterFrom,filterUntil,filterName])
        srg.studentsResultsFiltered = srg.studentsResults        
        printTableSR(srg.studentsResultsFiltered)
        thCheck.checked = false
        printCertificates.checked = false
        printCredentials.checked = false
    })

    //close popups
    const closePopups = [arppClose,arppCancel,usippClose]
    closePopupsEventListeners(closePopups)

    //table info events listeners
    const tableIcons = [
        {
            icon:infoIcon,
            right: srg.courseData.includes_certificate == 1 ? '9%' : '7.5%'
        },
        {
            icon:obsIcon,
            right:srg.courseData.includes_certificate == 1 ? '6.5%' : '4.5%'
        },
        {
            icon:imageIcon,
            right:'4%'
        },
        {
            icon:checkIcon,
            right:'1%'
        }
    ]

    showTableInfo(tableIcons,202,150)

    //filter name predict elements
    filterName.addEventListener("input", async(e) => {
        const input = filterName
        const list = ulFilterName
        const apiUrl = 'apis/students/predict-full-names/' + srg.courseData.course_name + '/'
        const name = 'full_name'
        const elementName = 'name'
        predictElements(input,list,apiUrl,name,elementName)
    })

    filterName.addEventListener("keydown", async(e) => {
        const input = filterName
        const list = ulFilterName
        const elementName = 'name'
        selectFocusedElement(e,input,list,elementName)
    })

    //sort name
    nameUp.addEventListener("click", async() => {
        nameUp.classList.add('notVisible')
        nameDown.classList.remove('notVisible')
        srg.studentsResultsFiltered = srg.studentsResultsFiltered.sort((a, b) => a.last_name.localeCompare(b.last_name))
        printTableSR(srg.studentsResultsFiltered)        
    })
    nameDown.addEventListener("click", async() => {
        nameUp.classList.remove('notVisible')
        nameDown.classList.add('notVisible')
        srg.studentsResultsFiltered = srg.studentsResultsFiltered.sort((a, b) => b.last_name.localeCompare(a.last_name))
        printTableSR(srg.studentsResultsFiltered)        
    })

    //sort date
    dateUp.addEventListener("click", async() => {
        dateUp.classList.add('notVisible')
        dateDown.classList.remove('notVisible')
        srg.studentsResultsFiltered = srg.studentsResultsFiltered.sort((a, b) => new Date(a.date) - new Date(b.date))
        printTableSR(srg.studentsResultsFiltered)        
    })
    dateDown.addEventListener("click", async() => {
        dateUp.classList.remove('notVisible')
        dateDown.classList.add('notVisible')
        srg.studentsResultsFiltered = srg.studentsResultsFiltered.sort((a, b) => new Date(b.date) - new Date(a.date))
        printTableSR(srg.studentsResultsFiltered)        
    })


    //select all elements
    thCheck.addEventListener("click", async() => {
        if (thCheck.checked) {
            srg.downloadSelected = srg.downloadAlloweded
            srg.downloadAlloweded.forEach(element => {
                const check = document.getElementById('check_' + element)
                if (check) {
                    check.checked = true
                }
            })
        }else{
            srg.downloadSelected = []
            srg.downloadAlloweded.forEach(element => {
                const check = document.getElementById('check_' + element)
                if (check) {
                    check.checked = false
                }
                
            })
        }
    })

    //select documentsToPrint
    printCertificates.addEventListener("click", async() => {
        if (printCertificates.checked) {
            srg.documentsToPrint.push('certificates')
        }else{
            srg.documentsToPrint = srg.documentsToPrint.filter(dtp => dtp != 'certificates')
        }
    })

    printCredentials.addEventListener("click", async() => {
        if (printCredentials.checked) {
            srg.documentsToPrint.push('credentials')
        }else{
            srg.documentsToPrint = srg.documentsToPrint.filter(dtp => dtp != 'credentials')
        }
    })


    //download
    srDownload.addEventListener("click", async(e) => {

        e.preventDefault()

        let errors = 0
        
        if (srg.downloadSelected.length == 0 || (printCertificates.checked == false && printCredentials.checked == false)) {
            errors +=1
            srError.style.display = 'flex'
        }else{
            srError.style.display = 'none'
            printForm.submit()

            
            
        }
    })

})