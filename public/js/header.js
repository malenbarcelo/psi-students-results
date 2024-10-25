import { dominio } from "./dominio.js"

window.addEventListener('load',async()=>{

    const menuMobile = document.getElementById('menuMobile')
    const burgerMenu = document.getElementById('burgerMenu')

    if (burgerMenu) {
        burgerMenu.addEventListener("click",async(e)=>{
            menuMobile.classList.toggle('notVisible')
        })
    }

    
})