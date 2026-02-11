  //get the notes
   let notes = JSON.parse(localStorage.getItem('myAppNotes')) || [];
    //get and cean the notes list
    const list = document.getElementById('notes-list');
    list.innerHTML = '';
    //loop through the notes
    function renderNotes() {
        list.innerHTML = ''; // Clear the old list
        
        // FIX 2: forEach uses parentheses ( )
        notes.forEach(function(note) {
            const noteItem = document.createElement('div');
            noteItem.className = 'note-item';
            noteItem.innerText = note.title;
            list.appendChild(noteItem); 
        });
        renderNotes();
    }
        // add event listner
    const svbtn=document.getElementById('btn-save');
    svbtn.addEventListener('click',function(){
      const title = document.getElementById('note-title');
      const body = document.getElementById('note-body');
      if(title.value ===''){
        alert('Please enter a title');
        return;
      }
      const note={
        title:title.value,
        body:body.value
      }
      notes.push(note);
      localStorage.setItem('myAppNotes',JSON.stringify(notes));
      title.value='';
      body.value='';
      renderNotes();


    })