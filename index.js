const sensors = [
    {id : "TEMP", type : "Temperature", value : 22.5, status: "active"},
    {id : "POLL_01", type : "Pollution", value : 85, status: "active"},
    {id : "HUM_01", type : "Humidity", value : 60, status: "inactive"},
]
sensors.forEach(sensor => {
    console.log(`Capteur ${sensor.id} : ${sensor.status}`);
});
const criticalAlerts = sensors.filter(sensor => (sensor.value > 80 && sensor.type === "Pollution") || (sensor.status =="faulty"));
criticalAlerts.forEach(sensor => {
    console.log(`Capteur ${sensor.id} : ${sensor.status}`);
});