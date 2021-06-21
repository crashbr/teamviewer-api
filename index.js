require('dotenv').config()
const axios = require('axios')
const token = process.env.API_TOKEN
const moment = require('moment')
const headers = {headers: {Authorization: `Bearer ${token}`}}
const urlTeamViewer = "https://webapi.teamviewer.com/api/v1"
const input = require('readline-sync')

async function listGroups(){
    let urlGroups = urlTeamViewer + "/groups"
    let getGroupList = await axios.get(urlGroups,headers)
    groupNames = getGroupList.data.groups.map((item) => {
        console.log("Nome: ",item.name, "ID: ",item.id)
    })
}

async function deleteHosts(url,array){

    for(let i = 0; i < array.length; i++){
        let deleteUrl = url + array[i]
        await axios.delete(deleteUrl,headers)
        console.log(`Device ${array[i]} deleted, ${deleteUrl}`)
    }
}

async function deleteComputersUsingId () {
    console.log('Loading groups list')
    await listGroups()
    let groupToDelete = input.question('Enter the group id to delete the hosts: ')
    let urlDevices = urlTeamViewer + "/devices/"
    const computerList = await axios.get(urlDevices,headers)
    
    let deleteArray = []
    computerList.data.devices.map((item) => {
        if(item.groupid === groupToDelete ){
            deleteArray.push(item.device_id)
        }
    })

    let confirmation = input.question(`Found ${deleteArray.length} in the list. Confirm deletion? (Y/N): `).toLocaleLowerCase()
    if(confirmation === 'y'){
        deleteHosts(urlDevices,deleteArray) 
    } else {
        console.log('Operation canceled')
    }

}

async function deleteComputersByOfflineTime(){
    let hostsToDelete = input.question('Enter the time in days to filter the hosts: ')
    let urlDevices = urlTeamViewer + "/devices/"
    const computerList = await axios.get(urlDevices,headers)

    let deleteArray = []
    computerList.data.devices.map((item) => {
        if(item.last_seen != undefined){
            if (Math.floor((moment().diff(item.last_seen)) / 8.64e7) > hostsToDelete){
                deleteArray.push(item.device_id)
                console.log("Nome: ", item.alias," | ","Offline: ", Math.floor((moment().diff(item.last_seen)) / 8.64e7) + " Days")
            }
        }
    })

    let confirmation = input.question(`Found ${deleteArray.length} in the list. Confirm deletion? (Y/N): `).toLocaleLowerCase()
    if(confirmation === 'y'){
        deleteHosts(urlDevices,deleteArray)    
    } else {
        console.log('Operation canceled')
    }
}


console.log(`
    1 - Deletar computadores em um Grupo
    2 - Deletar de acordo com o tempo off-line
`)
let menu = input.question('Escolha uma opção: ')

switch (menu) {
    case '1':
        deleteComputersUsingId()
        break;

    case '2':
        deleteComputersByOfflineTime()
        break;

    default:
        console.log("Encerrando")
        break;
}
