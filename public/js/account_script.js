$(()=>{
    $('.invite').on('click',event=>{
        event.preventDefault()
        const s = $('#username').val()
        const d = new Date();
        const id = d.valueOf()+s;
        const url = "https://z199024-2q20f.ps01.zwhhosting.com/register/"+id
        Swal.fire({
          title: 'ลิ้งค์เชิญของคุณ',
          text: url,
          icon: 'info',
          heightAuto: false,
          })
      })
})
