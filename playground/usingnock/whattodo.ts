import express from "express"
const app = express();
import fetch from "node-fetch";

app.get("/whattodo", async (req, res) => {
    const whatToDo = await fetch("https://www.boredapi.com/api/activity").then(r => r.json())
    res.json(whatToDo)
})

app.get("/nameinfo/:name", async (req, res) => {
    const name = req.params.name;
    const promises = [
        fetch(`https://api.genderize.io?name=${name}`).then(r => r.json()),
        fetch(`https://api.nationalize.io?name=${name}`).then(r => r.json()),
        fetch(`https://api.agify.io?name=${name}`).then(r => r.json())
    ]
    const person = await Promise.all(promises);
    const response = { gender: person[0].gender, country: person[1].country[0].country_id, age: person[2].age }
    res.json(response);
})


export default app
