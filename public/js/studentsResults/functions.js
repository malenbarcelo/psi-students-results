import srg from "./globals.js"

function applyFilters() {

    srg.studentsResultsFiltered = srg.studentsResults

    //company
    const filterCompany = document.getElementById('filterCompany')
    if (filterCompany) {
        srg.studentsResultsFiltered = filterCompany.value == '' ? srg.studentsResultsFiltered : srg.studentsResultsFiltered.filter(sr => sr.company == filterCompany.value)
    }

    //result
    srg.studentsResultsFiltered = filterResult.value == '' ? srg.studentsResultsFiltered : srg.studentsResultsFiltered.filter(sr => sr.passed == filterResult.value)
    
    //dni
    srg.studentsResultsFiltered = filterDni.value == '' ? srg.studentsResultsFiltered : srg.studentsResultsFiltered.filter(sr => sr.dni == filterDni.value)

    //name
    srg.studentsResultsFiltered = filterName.value == '' ? srg.studentsResultsFiltered : srg.studentsResultsFiltered.filter(sr => (sr.last_name + ', ' + sr.first_name).trim() == filterName.value)

    //dateFrom
    srg.studentsResultsFiltered = filterFrom.value == '' ? srg.studentsResultsFiltered : srg.studentsResultsFiltered.filter(sr => (new Date(sr.date)).toISOString().split('T')[0] >= filterFrom.value)
    
    //dateUntil
    srg.studentsResultsFiltered = filterUntil.value == '' ? srg.studentsResultsFiltered : srg.studentsResultsFiltered.filter(sr => (new Date(sr.date)).toISOString().split('T')[0] <= filterUntil.value)
    

    //uncheck
    thCheck.checked = false
    srg.downloadSelected = []
    srg.downloadAlloweded.forEach(element => {
        const check = document.getElementById('check_' + element)
        if (check) {
            check.checked = false
        }
        
    })
}


export {applyFilters}