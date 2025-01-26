import g from "./globals.js"
import { dominio } from "../dominio.js"

async function getData() {

    //get students
    let filters = `order_element=${g.filters.order.element}&order_type=${g.filters.order.type}`
    filters += g.filters.page == '' ? '' : `&page=${g.filters.page}`
    filters += g.filters.size == '' ? '' : `&size=${g.filters.size}`
    filters += g.filters.company == '' ? '' : `&company=${g.filters.company}`
    filters += g.filters.dni == '' ? '' : `&dni=${g.filters.dni}`
    filters += g.filters.last_name == '' ? '' : `&last_name=${g.filters.last_name}`
    filters += g.filters.first_name == '' ? '' : `&first_name=${g.filters.first_name}`
    filters += g.filters.email == '' ? '' : `&email=${g.filters.email}`
    
    const students = await (await fetch(`${dominio}apis/get/students?${filters}`)).json()
    
    g.students = students.rows
    g.pages = students.pages

    //complete page number    
    pageNumber.innerText = 'Hoja ' + (g.filters == 0 ? 0 : g.filters.page) + ' de ' + g.pages

}

function changePagesStyles() {    
    
    //next page
    if (g.filters.page == g.pages) {
        nextPage.style.color = 'grey'
        nextPage.style.cursor = 'auto'
    }else{
        nextPage.style.color = 'black'
        nextPage.style.cursor = 'pointer'
    }

    //previous page
    if (g.filters.page == 1) {
        previousPage.style.color = 'grey'
        previousPage.style.cursor = 'auto'
    }else{
        previousPage.style.color = 'black'
        previousPage.style.cursor = 'pointer'
    }
    
}

export { getData, changePagesStyles }