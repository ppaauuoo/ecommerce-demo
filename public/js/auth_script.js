$(()=> {
  $('#passwordCheck').on('input', ()=> {
    var passwordCheckValue = $('#passwordCheck').val();
    var passwordValue = $('#password').val();
    if (passwordCheckValue !== passwordValue) {
      $('#passwordCheck').get(0).setCustomValidity('a');
    } else {
      $('#passwordCheck').get(0).setCustomValidity('');
    }
  });

  $('#citizen').on('input', ()=> {
    var citizenValue = $('#citizen').val();
    var validNum = citizenValue[12]
    citizenValue = citizenValue.slice(0,12)
    citizenValue = reverse(citizenValue)
    var total=0
    for(var i=0;i<12;i++){
      total+=parseInt(citizenValue[i])*(i+2)
    }
    total%=11
    total=11-total
    if(total>=10){
      total-=10
    }
    if (validNum != total) {
      $('#citizen').get(0).setCustomValidity('a');
    } else {
      $('#citizen').get(0).setCustomValidity('');
    }
  });

  $('#cityfloatingSelectGrid').on('input', ()=> {
    var selected = $('#cityfloatingSelectGrid').val();
    $("#districtfloatingSelectGrid optgroup").show()
    $("#districtfloatingSelectGrid  optgroup").not(this[id=selected]).hide()
  });

  $('#districtfloatingSelectGrid').on('input', ()=> {
    var selected = $('#districtfloatingSelectGrid').val();
    $("#subdistrictfloatingSelectGrid optgroup").show()
    $("#subdistrictfloatingSelectGrid  optgroup").not(this[id=selected]).hide()
  });

  $('#cityfloatingSelectGrid').on('input', ()=> {
    var selected = $('#cityfloatingSelectGrid').val();
    $("#postCodefloatingSelectGrid optgroup").show()
    $("#postCodefloatingSelectGrid  optgroup").not(this[id=selected]).hide()
  });

  
});





function reverse(s){
  return s.split("").reverse().join("");
}


// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
    'use strict'
        // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')
    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
      form.addEventListener('submit', event => {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }
        form.classList.add('was-validated')
      }, false)
    })
  })()