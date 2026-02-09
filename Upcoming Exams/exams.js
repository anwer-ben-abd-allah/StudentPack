// exams.js

// DATE CIBLE : Jeudi 6 Mars 2026 à 08:30
// Format : Date(Année, Mois[0-11], Jour, Heure, Minute)
// Rappel : Mars = 2 (Jan=0, Fév=1, Mar=2)
const examDate = new Date(2026, 2, 6, 8, 30, 0).getTime(); 

const x = setInterval(function() {
    const now = new Date().getTime();
    const distance = examDate - now;

    // Calculs
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Affichage
    document.getElementById("days").innerHTML = days;
    document.getElementById("hours").innerHTML = ("0" + hours).slice(-2);
    document.getElementById("minutes").innerHTML = ("0" + minutes).slice(-2);
    document.getElementById("seconds").innerHTML = ("0" + seconds).slice(-2);

    // Fin du compteur
    if (distance < 0) {
        clearInterval(x);
        document.getElementById("days").innerHTML = "00";
        document.getElementById("hours").innerHTML = "00";
        document.getElementById("minutes").innerHTML = "00";
        document.getElementById("seconds").innerHTML = "00";
        
        document.querySelector(".urgent-box").classList.add("finished");
        document.getElementById("exam-subject").innerHTML = "EXAMEN EN COURS";
    }
}, 1000);