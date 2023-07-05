$(()=>{
    $('.invite').on('click',event=>{
        event.preventDefault()
        const s = $('#username').val()
        const d = new Date();
        const id = d.valueOf()+s;
        const url = "http://localhost:8888/register/"+id
        alert(url)
      })
})
