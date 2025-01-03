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

function applyAssociatedResultsFilters() {

    srg.associatedFormsResultsFiltered = srg.associatedFormsResults

    //form
    srg.associatedFormsResultsFiltered = afrppForm.value == '' ? srg.associatedFormsResultsFiltered : srg.associatedFormsResultsFiltered.filter(ar => ar.form_name == afrppForm.value)
    
    //company
    const afrppCompany = document.getElementById('afrppCompany')
    if (afrppCompany) {
        srg.associatedFormsResultsFiltered = afrppCompany.value == '' ? srg.associatedFormsResultsFiltered : srg.associatedFormsResultsFiltered.filter(ar => ar.company == afrppCompany.value)
    }

    //dni
    srg.associatedFormsResultsFiltered = afrppDni.value == '' ? srg.associatedFormsResultsFiltered : srg.associatedFormsResultsFiltered.filter(ar => ar.dni == afrppDni.value)
    
    //result
    srg.associatedFormsResultsFiltered = afrppResult.value == '' ? srg.associatedFormsResultsFiltered : srg.associatedFormsResultsFiltered.filter(sr => sr.results[0].passed == afrppResult.value)
    
    //name
    srg.associatedFormsResultsFiltered = afrppName.value == '' ? srg.associatedFormsResultsFiltered: srg.associatedFormsResultsFiltered.filter(sr => (sr.results[0].last_name + ', ' + sr.results[0].first_name).trim() == afrppName.value)
    
}


export {applyFilters, applyAssociatedResultsFilters}