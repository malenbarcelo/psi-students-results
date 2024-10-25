import { dominio } from "./dominio.js"

export async function getData(course,company,filter,order,dateFrom,dateUntil,certificate,companyToFilter) {

    let tableDate = ''
    let tableCompany = ''
    let tableDni = ''
    let tableName = ''
    let tableEmail = ''
    let tableGrade = ''
    let tableSelect = ''
    let tableRows = ''
    
    var data = []   
    
    if (filter == 'passed') {
        data = await (await fetch(dominio + 'apis/students-results-passed/' + company + '/' + course)).json()
    }
    if (filter == 'notPassed') {
        data = await (await fetch(dominio + 'apis/students-results-not-passed/' + company + '/' + course)).json()
    }
    if(filter == 'allData'){
        data = await (await fetch(dominio + 'apis/students-results/' + company + '/' + course)).json()
    }

    if (companyToFilter != 'allCompanies') {
        data = data.filter(companyData => companyData.company == companyToFilter)
    }

    if (order == 'orderDateDesc') {
        data = data.sort((a, b) => new Date(b.date) - new Date(a.date))
    }

    if (order == 'orderDateAsc') {
        data = data.sort((a, b) => new Date(a.date) - new Date(b.date))
    }

    if (order == 'orderNameAsc') {
        data.sort((a, b) => a.last_name.localeCompare(b.last_name))
    }

    if (order == 'orderNameDesc') {
        data.sort((a, b) => b.last_name.localeCompare(a.last_name))
    }

    data = data.filter(item => new Date(item.date).getTime() >= dateFrom && new Date(item.date).getTime() <= dateUntil)

    

    /*console.log(data)
    console.log(dateFrom)
    console.log(new Date(data[0].date).getTime())
    console.log(dateUntil)
    console.log(new Date(data[0].date).getTime() >= dateFrom && new Date(data[0].date).getTime() <= dateUntil)*/
    
    //define the table lines
    for (let i = 0; i < data.length; i++) {

        var notPassed = 0
        const passGrade = parseFloat(data[i].pass_grade)/100
        const rowClass = i % 2 == 0 ? 'srTd2' : 'srTd1'

        for (let j = 0; j < data[i].associatedForms.length; j++) {
            if (data[i].associatedForms[j].grade < passGrade || data[i].associatedForms[j].grade == 'NA') {
                notPassed += 1
            }
        }

        let gradeClass = ''
        let checkIcon = '<td class=" ' + rowClass + ' td3"></td>'

        if (data[i].grade >= passGrade && notPassed == 0) {
            gradeClass = 'span1'
            checkIcon = '<td class="' + rowClass + ' td3"><input type="checkbox" name="' + data[i].id + '" class="checkbox1"></td>'
        }else{
            if (data[i].grade >= passGrade && notPassed > 0) {
                gradeClass = 'span4'
            }else{
                gradeClass = 'span2'
            }
        }

        tableDate = '<td class="' + rowClass + '">' + data[i].dateString + '</td>'
        tableCompany = '<td class="' + rowClass + '">' + data[i].company + '</td>'
        tableDni = '<td class="' + rowClass + '">' + data[i].dni + '</td>'
        tableName = '</td><td class="' + rowClass + '">' + data[i].last_name + ', ' + data[i].first_name + '</td>'
        tableEmail = '<td class="' + rowClass + ' td4">' + data[i].email + '</td>'
        tableGrade = '<td class="' + rowClass + ' ' + gradeClass + '">' + data[i].grade * 100 + '%</td>'
        tableSelect = certificate == true ? checkIcon : ''
        
        tableRows += '<tr>' + tableDate + tableCompany + tableDni + tableName + tableEmail + tableGrade + tableSelect + '</tr>'
    }
        
    return tableRows
}
