// -----------------------------DATABASE-----------------------------------

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import { getDatabase, ref, set, get, child, onValue } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-database.js";


const firebaseConfig = {
databaseURL: "https://openbox-forum-default-rtdb.asia-southeast1.firebasedatabase.app/",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

function getNewId(){
    let keyRef =  ref(database, "questions/");
    onValue(keyRef, (snapshot) =>{
        const data = snapshot.val();
        console.log(data);
    })
}

function fetchForum(){
    let keyRef = ref(database, "questions/");
    onValue(keyRef, (snapshot) =>{
        let data = snapshot.val();
        Object.keys(data).forEach((id) => {
            const title = data[id]["title"];
            const desc = data[id]["description"];
            console.log(title);
            createForumCard(id, title, desc);
        })
    })
}


function createForumCard(id, title, description) {
    // Create the div element for the forum card
    const forumCard = document.createElement('div');
    forumCard.classList.add('forum-card'); // Add class 'forum-card'
    forumCard.id = id; // Set the id of the forum card

    // Create the title element
    const forumTitle = document.createElement('h3');
    forumTitle.textContent = title; // Set the title text

    // Create the description element
    const forumDescription = document.createElement('p');
    forumDescription.textContent = description; // Set the description text

    // Append the title and description to the forum card
    forumCard.appendChild(forumTitle);
    forumCard.appendChild(forumDescription);

    // Find the parent element (forum-flex) and append the new forum card
    const forumFlex = document.querySelector('.forum-flex');
    forumFlex.appendChild(forumCard);

    forumCard.addEventListener("click", ()=>{
        gotToForum(id);
    })
}

function gotToForum(id){
    window.location.href = `table.html?id=${id}`;
}
fetchForum();



// --------------------------------TABLE PAGE-----------------------------------

const tableFlex = document.querySelector(".table-flex");

if(tableFlex){
    const urlParams = new URLSearchParams(document.location.search);
    const id = urlParams.get('id');
    let keyRef = ref(database, `answers/${id}`);
    onValue(keyRef, (snapshot) =>{
        let data = snapshot.val();
        if(!data){
            const btn = document.querySelector("#downloadTable-button");
            btn.style.display = "none";
            // Create the h1 element
            const noResponseHeader = document.createElement('h1');

            // Set the text content
            noResponseHeader.textContent = 'No response :(';

            // Select the div with class 'table-flex'
            const container = document.querySelector('.table-flex');

            // Append the h1 element to the container
            container.appendChild(noResponseHeader);
            return;
        }
        console.log(JSON.stringify(data));
        createTable(data);
    })
}

function createTable(data) {
    const container = document.querySelector(".table-flex"); // Select the div with class 'table-flex'

    // Create the table
    const table = document.createElement("table");

    // Create table header
    const header = table.createTHead();
    const headerRow = header.insertRow();

    // Extract keys for the header
    const keys = Object.keys(data[0]);
    keys.forEach(key => {
        const th = document.createElement("th");
        th.textContent = key;
        headerRow.appendChild(th);
    });

    // Create table rows from the data
    const tbody = table.createTBody();
    data.forEach(item => {
        const row = tbody.insertRow();
        keys.forEach(key => {
            const cell = row.insertCell();
            cell.textContent = item[key];
        });
    });

    // Append the table to the div
    container.appendChild(table);
}

const downloadButton = document.querySelector("#downloadTable-button");

if(downloadButton){
    downloadButton.addEventListener("click", ()=>{
        downloadCSV();
    })
}

function downloadCSV() {
    const table = document.querySelector("table");  // Get the table element
    let csv = [];
    const rows = table.querySelectorAll("tr");

    // Loop through all table rows and extract text content
    rows.forEach(row => {
        const cells = row.querySelectorAll("th, td");
        const rowData = [];
        cells.forEach(cell => {
            rowData.push(cell.textContent.replace(/,/g, "")); // Remove commas to avoid CSV issues
        });
        csv.push(rowData.join(",")); // Join each row's cells with commas
    });

    // Create a downloadable CSV file
    const csvFile = new Blob([csv.join("\n")], { type: "text/csv" });

    // Create a download link and trigger it
    const link = document.createElement("a");
    link.href = URL.createObjectURL(csvFile);
    link.download = "table_data.csv";
    link.click();
}
