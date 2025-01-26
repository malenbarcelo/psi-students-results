import g from "./globals.js"
import { printTable } from "./printTable.js"
import { getData, changePagesStyles } from "./functions.js"
import { showToolkit, clearInputs, applyPredictElement, closePopups, closeWithEscape, showAndHideArrows } from "../generalFunctions.js"

//popups event listeners
import { esppEventListeners} from "./studentsESPP.js"

window.addEventListener('load',async()=>{

    loader.style.display = 'block'
    
    //table info events listeners
    showToolkit(g.tableIcons,165,150)

    //get data
    g.filters.page = 1
    g.filters.size = 16
    previousPage.style.color = 'grey'
    await getData()

    //print table
    printTable()

    //popups event listeners
    esppEventListeners()

    //close popups
    closePopups(g.popups)

    //close with escape
    closeWithEscape(g.popups)

    //filters event listeners
    const filters = [company,dni,lastName,firstName,email]

    for (const filter of filters) {

        filter.addEventListener("change", async () => {

            loader.style.display = 'block'

            g.filters.company = company.value
            g.filters.dni = dni.value
            g.filters.last_name = lastName.value
            g.filters.first_name = firstName.value
            g.filters.email = email.value
            g.filters.page = 1

            await getData()
            printTable()
            changePagesStyles()

            loader.style.display = 'none'
        })
    }

    //unfilter event listener
    unfilter.addEventListener("click", async() => {
        
        loader.style.display = 'block'

        g.filters.page = 1

        //clear inputs
        clearInputs(filters)

        //clear filters in globals
        g.filters.company = ''
        g.filters.dni = ''
        g.filters.last_name = ''
        g.filters.first_name = ''
        g.filters.email = ''

        await getData()
        printTable()
        changePagesStyles()

        loader.style.display = 'none'
    })

    //order data
    for (const element of g.elementsToOrder) {

        element.addEventListener("click", async () => {

            loader.style.display = 'block'

            const type = showAndHideArrows(element, g.elementsToOrder)

            g.filters.order.element = element.id.replace('_ASC','').replace('_DESC','')
            g.filters.order.type = type

            await getData()
            printTable()

            loader.style.display = 'none'

        })
    }

    //change page
    nextPage.addEventListener('click',async()=>{

        if (g.filters.page < g.pages) {

            loader.style.display = 'block'
            
            g.filters.page = parseInt(g.filters.page) + 1

            //get data
            await getData()
            
            //print table
            printTable()

            //change styles
            changePagesStyles()

            loader.style.display = 'none'
        }
    })

    previousPage.addEventListener('click',async()=>{
        if (g.filters.page > 1) {

            loader.style.display = 'block'
            g.filters.page = g.filters.page - 1
            
            //get data
            await getData()
            
            //print table
            printTable()

            //change styles
            changePagesStyles()

            loader.style.display = 'none'
        }
    })

    loader.style.display = 'none'

    
})