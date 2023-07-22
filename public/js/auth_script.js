$(() => {
  $("#passwordCheck").on("input", () => {
    var passwordCheckValue = $("#passwordCheck").val();
    var passwordValue = $("#password").val();
    if (passwordCheckValue !== passwordValue) {
      $("#passwordCheck").get(0).setCustomValidity("a");
    } else {
      $("#passwordCheck").get(0).setCustomValidity("");
    }
  });

  $("#citizen").on("input", () => {
    var citizenValue = $("#citizen").val();
    var validNum = citizenValue[12];
    citizenValue = citizenValue.slice(0, 12);
    citizenValue = reverse(citizenValue);
    var total = 0;
    for (var i = 0; i < 12; i++) {
      total += parseInt(citizenValue[i]) * (i + 2);
    }
    total %= 11;
    total = 11 - total;
    if (total >= 10) {
      total -= 10;
    }
    if (validNum != total) {
      $("#citizen").get(0).setCustomValidity("a");
    } else {
      $("#citizen").get(0).setCustomValidity("");
    }
  });
});

function reverse(s) {
  return s.split("").reverse().join("");
}

// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  "use strict";
  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = $(".needs-validation");
  // Loop over them and prevent submission
  forms.each((index, form) => {
    $(form).on(
      "submit",
      (event) => {

        if ($(form).find('#confirm').is(':focus')) {
          const test = grecaptcha.getResponse()
          if(test){
            $('#userResponse').val(test)
            return;
          }
          Swal.fire({
            title: "กรุณายืนยันตัวตน",
            icon: "error",
            heightAuto: false,
          });
        }
        event.preventDefault();
        
        if (!form.checkValidity()) {
          event.stopPropagation();
        }else{
          $("#usernameConfirm").text($("#usernamefloatingInput").val());
          $("#passwordConfirm").text($("#password").val());
          $("#exampleModal").modal("show");
        }     
        $(form).addClass("was-validated");
      }
    );
  });
})();
