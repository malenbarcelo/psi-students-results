import { dominio } from "./dominio.js"

window.addEventListener('load',async()=>{

    const divStudentData = document.getElementById('studentData')
    const student = document.getElementById('selectStudent')
    const company = document.getElementById('userLoggedCompany').innerText
    const titleCoursesDone = document.getElementById('titleCoursesDone')

    const tableInnerHTMLFirstLine = '<table class="table1"><tr><th class="tableTitle1">Fecha</th><th class="tableTitle1">Nota</th></tr>'
    const tableInnerHTMLLastLine = '<table>'

    student.addEventListener("change",async(e)=>{

        const dni = student.value

        if (dni != 'default') {
            titleCoursesDone.classList.remove('notVisible')
        }else{
            titleCoursesDone.classList.add('notVisible')
        }

        const studentData = await (await fetch(dominio + 'apis/student-data/' + company + '/' + dni)).json()

        divStudentData.innerHTML = ''

        for (let i = 0; i < studentData.length; i++) {
            const title = studentData[i].form_name
            divStudentData.innerHTML += '<div class="div31 title1 title4">' + title + '</div>'

            let tableInnerHTMLMidLine = ''

            for (let j = 0; j < studentData[i].data.length; j++) {
                if (studentData[i].data[j].grade < 0.78) {
                    var classGrade = 'span2'
                }else{
                    var classGrade = 'span1'
                }
                tableInnerHTMLMidLine += '<tr><td class="td1">' + studentData[i].data[j].dateString + '</td><td class="td1 ' + classGrade + '">' + studentData[i].data[j].grade * 100 + '%</td></tr>'
            }

            divStudentData.innerHTML += tableInnerHTMLFirstLine + tableInnerHTMLMidLine + tableInnerHTMLLastLine
        }
    })
})