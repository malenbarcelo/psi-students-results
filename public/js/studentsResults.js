import { dominio } from "./dominio.js"
import { getData } from "./getData.js"

window.addEventListener('load',async()=>{

    const company = document.getElementById('userLoggedCompany').innerText
    const course = document.getElementById('course').innerText
    const tableRows = document.getElementById('tableRows')
    let filter = 'allData'
    let order = 'noOrder'
    const viewAllData = document.getElementById('viewAllData')
    const viewPassed = document.getElementById('viewPassed')
    const viewNotPassed = document.getElementById('viewNotPassed')
    const tableTitle = document.getElementById('tableTitle')
    const downloadSelected = document.getElementById('downloadSelected')
    const orderDateAsc = document.getElementById('orderDateAsc')
    const orderDateDesc = document.getElementById('orderDateDesc')
    const orderNameAsc = document.getElementById('orderNameAsc')
    const orderNameDesc = document.getElementById('orderNameDesc')
    const dateFilter = document.getElementById('dateFilter')
    const divDateFilter = document.getElementById('divDateFilter')
    const acceptBtn = document.getElementById('acceptBtn')
    const srCancelFilterBtn = document.getElementById('srCancelFilterBtn')
    const divError = document.getElementById('divError')
    const formTitle = document.getElementById('formTitle')
    const selectAll = document.getElementById('selectAll')
    const certificates = document.getElementById('divCertificates')
    const credentials = document.getElementById('divCredentials')
    const error1 = document.getElementById('error1')
    const error2 = document.getElementById('error2')
    const thSelectAll = document.getElementById('thSelectAll')
    const srSelectCompany = document.getElementById('srSelectCompany')
    let companyToFilter = 'allCompanies'
    let dateUntil = new Date().getTime() //today as timestamp
    let dateFrom = dateUntil - (365 * 24 * 60 * 60 * 1000) //remove 90 days in millisecs

    //define if corresponds to download certificate
    const certificate = !thSelectAll.classList.contains('notVisible')

    //get last 90 days to filter data
    //dateUntil = new Date().getTime() //today as timestamp
    //dateFrom = dateUntil - (365 * 24 * 60 * 60 * 1000) //remove 90 days in millisecs

    tableRows.innerHTML = await getData(course,company,filter,order,dateFrom,dateUntil,certificate,companyToFilter)
    
    //Add events listeners

    srSelectCompany.addEventListener("change",async(e)=>{
        
        companyToFilter = srSelectCompany.value
        
        tableRows.innerHTML = await getData(course,company,filter,order,dateFrom,dateUntil,certificate,companyToFilter)

    })

    viewPassed.addEventListener("click",async(e)=>{
        
        //tableTitle.innerText = 'Aprobados'
        viewAllData.classList.remove('underlined')
        viewPassed.classList.add('underlined')
        viewNotPassed.classList.remove('underlined')
        downloadSelected.classList.remove('notVisible')
        credentials.classList.remove('notVisible')
        certificates.classList.remove('notVisible')
        certificates.classList.remove('inInvalid')
        filter = 'passed'
        order = 'noOrder'

        tableRows.innerHTML = await getData(course,company,filter,order,dateFrom,dateUntil,certificate,companyToFilter)

    })

    viewNotPassed.addEventListener("click",async(e)=>{
        console.log('hola')
        //tableTitle.innerText = 'Desprobados'
        viewAllData.classList.remove('underlined')
        viewPassed.classList.remove('underlined')
        viewNotPassed.classList.add('underlined')
        downloadSelected.classList.add('notVisible')
        credentials.classList.add('notVisible')
        certificates.classList.add('notVisible')
        //tableTitle.classList.add('enabled')
        filter = 'notPassed'
        order = 'noOrder'

        tableRows.innerHTML = await getData(course,company,filter,order,dateFrom,dateUntil,certificate,companyToFilter)

    })
    viewAllData.addEventListener("click",async(e)=>{
        //tableTitle.innerText = 'Todos los resultados'
        viewAllData.classList.add('underlined')
        viewPassed.classList.remove('underlined')
        viewNotPassed.classList.remove('underlined')
        downloadSelected.classList.remove('notVisible')
        credentials.classList.remove('notVisible')
        filter = 'allData'
        order = 'noOrder'

        tableRows.innerHTML = await getData(course,company,filter,order,dateFrom,dateUntil,certificate,companyToFilter)
    })
    orderDateAsc.addEventListener("click",async(e)=>{
        order = 'orderDateAsc'
        orderDateAsc.classList.add('notVisible')
        orderDateDesc.classList.remove('notVisible')
        tableRows.innerHTML = await getData(course,company,filter,order,dateFrom,dateUntil,certificate,companyToFilter)
    })
    orderDateDesc.addEventListener("click",async(e)=>{
        order = 'orderDateDesc'
        orderDateAsc.classList.remove('notVisible')
        orderDateDesc.classList.add('notVisible')
        tableRows.innerHTML = await getData(course,company,filter,order,dateFrom,dateUntil,certificate,companyToFilter)
    })
    orderNameAsc.addEventListener("click",async(e)=>{
        order = 'orderNameAsc'
        orderNameAsc.classList.add('notVisible')
        orderNameDesc.classList.remove('notVisible')
        tableRows.innerHTML = await getData(course,company,filter,order,dateFrom,dateUntil,certificate,companyToFilter)
    })
    orderNameDesc.addEventListener("click",async(e)=>{
        order = 'orderNameDesc'
        orderNameAsc.classList.remove('notVisible')
        orderNameDesc.classList.add('notVisible')
        tableRows.innerHTML = await getData(course,company,filter,order,dateFrom,dateUntil,certificate,companyToFilter)
    })
    selectAll.addEventListener("click",async(e)=>{
        const checkboxes = document.querySelectorAll('.checkbox1')
        checkboxes.forEach(checkbox => {
            if (selectAll.checked == true) {
                checkbox.checked = true
            }else{
                checkbox.checked = false
            }
            
          })
    })

    if (dateFilter != null) {
        dateFilter.addEventListener("click",async(e)=>{
            divDateFilter.classList.toggle('notVisible')
        })
    }

    if (downloadSelected != null) {
        downloadSelected.addEventListener("click",async(e)=>{
        
            credentials.classList.remove('isInvalid')
            certificates.classList.remove('isInvalid')
            error1.classList.remove('visible')
            error2.classList.remove('visible')
            error1.classList.add('notVisible')
            error2.classList.add('notVisible')
            thSelectAll.classList.remove('isInvalid')
        })
    }

    srCancelFilterBtn.addEventListener("click",async(e)=>{

        srCancelFilterBtn.style.display = 'none'
        acceptBtn.style.display = 'flex'
        document.getElementById('dateFrom').value = ''
        document.getElementById('dateUntil').value = ''
        formTitle.innerHTML = 'RESULTADOS DEL FORMULARIO (ÚLTIMO AÑO)'

        //get last 90 days to filter data
        dateUntil = new Date().getTime() //today as timestamp
        dateFrom = dateUntil - (365 * 24 * 60 * 60 * 1000) //remove 90 days in millisecs

        tableRows.innerHTML = await getData(course,company,filter,order,dateFrom,dateUntil,certificate,companyToFilter)

    })

    if (acceptBtn != null) {

        acceptBtn.addEventListener("click",async(e)=>{

            var dateFromFiltered = document.getElementById('dateFrom')
            var dateUntilFiltered = document.getElementById('dateUntil')
            
            if (dateFromFiltered.value == '' || dateUntilFiltered.value == 'Invalid Date') {
                divError.innerHTML = '<b>Debe completar las fechas</b>'
            }else{
                if (dateFromFiltered.value > dateUntilFiltered.value) {
                    divError.innerHTML = '<b>La fecha "Desde" debe ser menor o igual a la fecha "Hasta"</b>'
                }else{
    
                    divError.innerHTML = ''
                    srCancelFilterBtn.style.display = 'flex'
                    acceptBtn.style.display = 'none'
    
                    const dateFromArray = dateFromFiltered.value.split('-')
                    const dateUntilArray = dateUntilFiltered.value.split('-')
    
                    const dateFromString = dateFromArray[2] + '/' + dateFromArray[1] + '/' + dateFromArray[0]
                    const dateUntilString = dateUntilArray[2] + '/' + dateUntilArray[1] + '/' + dateUntilArray[0]

                    formTitle.innerHTML = 'RESULTADOS DEL FORMULARIO (' + dateFromString + ' - ' + dateUntilString + ')'
    
                    var dateFromAsDate =  new Date(dateFromArray[0],dateFromArray[1]-1,dateFromArray[2])
                    var dateUntilAsDate =  new Date(dateUntilArray[0],dateUntilArray[1]-1,dateUntilArray[2])

                    dateUntilAsDate.setHours(23, 59, 59, 999)
                    
                    dateFrom = new Date(dateFromAsDate).getTime()
                    dateUntil = new Date(dateUntilAsDate).getTime()
    
                    tableRows.innerHTML = await getData(course,company,filter,order,dateFrom,dateUntil,certificate,companyToFilter)
                }
            }
        })
    }
    
    
})