import g from "./globals.js"
import { dominio } from "./dominio.js"

function closePopupsEventListeners(closePopups) {
    closePopups.forEach(element => {
        element.addEventListener("click", async() => {
            let popupToClose = document.getElementById(element.id.replace('Close',''))
            popupToClose = document.getElementById(popupToClose.id.replace('Cancel',''))
            popupToClose.style.display = 'none'
        })
    })
}

function isInvalid(inputs) {
    inputs.forEach(input => {
        const label = document.getElementById(input.id + 'Label')
        const error = document.getElementById(input.id + 'Error')
        input.classList.add('invalidInput')
        if (label) {
            label.classList.add('invalidLabel')
        }
        if (error) {
            error.style.display = 'block'
        }
        
    })    
}

function isInvalidOk(inputs,errorText) {
    inputs.forEach(input => {
        const label = document.getElementById(input.id + 'Label')
        const error = document.getElementById(input.id + 'Error')
        input.classList.add('invalidInput')
        if (label) {
            label.classList.add('invalidLabel')
        }
        if (error) {
            error.innerText = errorText
            error.style.display = 'block'
        }        
    })    
}

function isValid(inputs) {
    inputs.forEach(input => {
        const label = document.getElementById(input.id + 'Label')
        const error = document.getElementById(input.id + 'Error')
        input.classList.remove('invalidInput')
        if (label) {
            label.classList.remove('invalidLabel')
        }
        
        if (error) {
            error.style.display = 'none'
        }
    })    
}

function acceptWithEnter(input,button) {
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            button.click()
        }
    })
}

function dateToString(date) {

    const dateWithoutTime = date.split('T')[0]
    
    const dateAsArray = dateWithoutTime.split('-')

    const year = dateAsArray[0]
    const month = dateAsArray[1]
    const day = dateAsArray[2]
    
    const stringDate = day + '/' + month + '/' + year

    return stringDate    
}

function clearInputs(inputs) {
    inputs.forEach(input => {
        if (input) {
            input.value = ''
        }
    })
}

function showTableInfo(tableIcons,top,width) {
    tableIcons.forEach(element => {
        const info = document.getElementById(element.icon.id.replace('Icon','Info'))
        element.icon.addEventListener("mouseover", async(e) => {
            info.style.top = top + 'px'
            info.style.right = element.right
            
            info.style.width = width + 'px'
            info.style.display = 'block'
        })
        element.icon.addEventListener("mouseout", async(e) => {
            info.style.display = 'none'
        })
    })
}

async function applyPredictElement(elementsToPredict) {

    for (let i = 0; i < elementsToPredict.length; i++) {
        
        const input = elementsToPredict[i].input
        const list = elementsToPredict[i].list
        const apiUrl = elementsToPredict[i].apiUrl
        const name = elementsToPredict[i].name
        const elementName = elementsToPredict[i].elementName

        input.addEventListener("input", async(e) => {
            predictElements(input,list,apiUrl,name,elementName)
        })

        input.addEventListener("keydown", async(e) => {
            selectFocusedElement(e,input,list,elementName)
        })
    }
}

async function predictElements(input,list,apiUrl,dataToPrint,elementName) {
    if (input.value.length >= 3) {

        let id = 0
        
        const string = input.value.toLowerCase()
        g.predictedElements = await (await fetch(dominio + apiUrl + string)).json()

        list.innerHTML = ''

        g.predictedElements.forEach(element => {
            list.innerHTML += '<li class="liPredictedElements" id="' + elementName + '_'+ id +'">' + element[dataToPrint] + '</li>'
            id += 1
        })

        g.focusedElement = -1

        if (g.predictedElements.length > 0) {
            list.style.display = 'block'
            
            for (let i = 0; i < g.predictedElements.length; i++) {

                const element = document.getElementById(elementName + '_' + i)
                
                element.addEventListener("mouseover", async() => {

                    //unfocus all elements
                    for (let j = 0; j < g.predictedElements.length; j++) {
                        const element = document.getElementById(elementName + '_' + j)
                        if (j == i) {
                            element.classList.add('predictedElementFocused')
                        }else{
                            element.classList.remove('predictedElementFocused')
                        }                            
                    }
                })
                
                element.addEventListener("click", async() => {
                    input.value = element.innerText
                    const event = new Event('change')
                    input.dispatchEvent(event)
                    list.style.display = 'none'
                })
            }
        }

    }else{
        list.style.display = 'none'
        list.innerHTML = ''
    }
}

function selectWithClick(e,dataToSelect) {
    let clickPredictedElement = false
    let inputToClick
    dataToSelect.forEach(element => {
        const input = element.input
        const name = element.name        
        const findeElement = g.predictedElements.filter(p => p[name] == e.target.innerText)
        if (findeElement.length > 0) {
            input.value = e.target.innerText
            clickPredictedElement = true
            inputToClick = input
        }
    })
    return {clickPredictedElement,inputToClick}
}

function selectFocusedElement(e,input,list,elementName) {
    if (e.key === 'ArrowDown' && g.predictedElements.length > 0) {
            
        g.focusedElement = (g.focusedElement == g.predictedElements.length-1) ? g.focusedElement : (g.focusedElement + 1)            
        
        g.elementToFocus = document.getElementById(elementName + '_' + g.focusedElement)            
        g.elementToFocus.classList.add('predictedElementFocused')
        g.elementToFocus.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        })

        if (g.focusedElement > 0) {
            g.elementToUnfocus = document.getElementById(elementName + '_' + (g.focusedElement-1))
            g.elementToUnfocus.classList.remove('predictedElementFocused')                
        }

    }else if(e.key === 'ArrowUp'){

        g.focusedElement = (g.focusedElement == 0) ? g.focusedElement : (g.focusedElement - 1)

        g.elementToFocus = document.getElementById(elementName + '_' + g.focusedElement)            
        g.elementToFocus.classList.add('predictedElementFocused')
        g.elementToFocus.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        })

        if (g.focusedElement != -1) {
            g.elementToUnfocus = document.getElementById(elementName + '_' + (g.focusedElement + 1))
            g.elementToUnfocus.classList.remove('predictedElementFocused')                
        }
        
    }else if(e.key === 'Enter'){

        if (list.style.display == 'block') {
            if (g.focusedElement == -1) {
                input.value = ''
            }else{
                input.value = g.elementToFocus.innerText
            }
            
            list.style.display = 'none'
        }

    }else if(e.key === 'Escape'){
        g.focusedElement = -1
        input.value = ''
        list.style.display = 'none'
    }
}

function showOkPopup(popupToShow) {

    popupToShow.style.display = 'block'

    //hide okPopup after one second
    setTimeout(function() {
        popupToShow.style.display = 'none'
    }, 2000)
    
}

function showToolkit(tableIcons,top,width) {
    tableIcons.forEach(element => {
        const info = document.getElementById(element.icon.id.replace('Icon','Info'))
        element.icon.addEventListener("mouseover", async(e) => {
            info.style.top = top + 'px'
            info.style.right = element.right
            
            info.style.width = width + 'px'
            info.style.display = 'block'
        })
        element.icon.addEventListener("mouseout", async(e) => {
            info.style.display = 'none'
        })
    })
}

function closePopups(popups) {
    popups.forEach(popup => {
        const closeIcon = document.getElementById(popup.id + 'Close')
        const cancelIcon = document.getElementById(popup.id + 'Cancel')
        if (closeIcon) {
            closeIcon.addEventListener("click", async() => {
                
                popup.style.display = 'none'
            })
        }
        if (cancelIcon) {
            cancelIcon.addEventListener("click", async() => {
                popup.style.display = 'none'
            })
        }
    })
}

function closeWithEscape(popups) {
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const displayedPopups = popups.filter(p => p.style.display == 'block' || p.classList.contains('slideIn'))
            if (displayedPopups.length > 0) {
                if (displayedPopups[0].style.display == 'block') {
                    displayedPopups[0].style.display = 'none'
                }else{
                    displayedPopups[0].classList.remove('slideIn')
                }
            }
        }
    })
}

function showResultPopup(popupToShow) {

    popupToShow.classList.add('okSlideIn')

    //hide okPopup after one second
    setTimeout(function() {
        popupToShow.classList.remove('okSlideIn')
    }, 2000)    
}

function showAndHideArrows(element, orderElements) {

    const type = element.id.includes('ASC') ? 'ASC' : 'DESC'
    const elementToShowId = element.id.includes('ASC') ? element.id.replace('ASC','DESC') : element.id.replace('DESC','ASC')
    const elementToShow = orderElements.filter( e => e.id == elementToShowId)[0]
    element.style.display = 'none'
    elementToShow.style.display = 'block'
    const elementName = element.id.replace('_ASC','').replace('_DESC','')

    orderElements.forEach(oe => {
        const oeName = oe.id.replace('_ASC','').replace('_DESC','')
        if (oeName != elementName) {
            if (oe.id.includes('_ASC')) {
                oe.style.display = 'block'
            }else{
                oe.style.display = 'none'
            }
        }
    })

    return type

}


export {closePopupsEventListeners,isInvalid,isValid, acceptWithEnter,dateToString, clearInputs, showTableInfo, predictElements,selectFocusedElement, showOkPopup, applyPredictElement, showToolkit, closePopups, closeWithEscape, isInvalidOk, showResultPopup, showAndHideArrows}