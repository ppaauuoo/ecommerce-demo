load_data = (num) => {
  $.ajax({
    url: "/admin",
    method: "POST",
    data: { page: num,action: "fetch" },
    dataType: "JSON",
    success: function (data) {
      var html = "";
      data.forEach((element) => {
        html +=
          `
          <tr>
          <td>
          <button
            type="button"
            class="btn btn-warning btn-sm edit"
            data-id="` +
      element.username +
      `"
      >
      แก้ไข
    </button>
    <button
    type="button"
    class="btn btn-danger btn-sm repass"
    data-id="`+element.username+`"
  >
    รีเซ็ตรหัสผ่าน
  </button>
        </td>
            <td>
              ` +
          element.username +
          `
            </td>
            <td>` +
          element.firstName +
          ` -
              ` +
          element.lastName +
          `
            </td>
            <td>
              ` +
          element.address +
          ` / ` +
          element.subdistrict +
          `
              / ` +
          element.district +
          ` / ` +
          element.city +
          ` /
              ` +
          element.postCode +
          `
            </td>
            <td>
              ` +
          element.bank +
          ` / ` +
          element.bookBank +
          ` /
              ` +
          element.bookBankNumber +
          ` /
              ` +
          element.bookBankBranch +
          `
            </td>
            <td>` +
          element.money +
          `</td>
            <td>` +
          element.point +
          `</td>

          </tr>
          `;
      });
      $("#dataTable").html(html);
    },
  });
};



$(() => {
  $(".page-link").on('click', function(event) {
    event.preventDefault()
    $(".page-link").removeAttr("tabindex disabled");
    $(this).attr({
      "tabindex": "-1",
      "disabled": "true"
    });
    if($(this).text()=='...'){
      load_data(-1)
      return
    }
    $('#currentPage').val($(this).text()-1)
    load_data($('#currentPage').val())
  });

  $("#searchbar").on("input", function () {
    var value = $(this).val().toLowerCase();
    $("#dataTable tr").filter(function () {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
    });
  });



  $("#form").on("submit", function (event) {
    event.preventDefault();
    $.ajax({
      url: "/admin",
      method: "POST",
      data: $("#form").serialize(),
      dataType: "JSON",
      beforeSend: function () {
        $("#action_button").attr("disabled", "disabled");
      },
      success: function (data) {
        $("#action_button").attr("disabled", false);

        $("#message").html(
          '<div class="alert alert-success">' + data.message + "</div>"
        );

        $("#action_modal").modal("hide");
        load_data(0);

        setTimeout(function () {
          $("#message").html("");
        }, 5000);
      },
    });
  });

  $(document).on("click", ".edit", (event) => {
    var button = event.target;
    var dataId = $(button).data("id");

    $("#dynamic_modal_title").text("Edit Data");

    $("#action_modal").modal("show");
    
    $.ajax({
      url: "/admin",
      method: "POST",
      data: { id: dataId, action: "fetch_single" },
      dataType: "JSON",
      success: (data) => {
        
        $("#firstNamefloatingInput").val(data.firstName);
        $("#lastNamefloatingInput").val(data.lastName);
        $("#addressfloatingInput").val(data.address);
        $("#districtfloatingSelectGrid").val(data.district);
        $("#subdistrictfloatingSelectGrid").val(data.subdistrict);
        $("#cityfloatingSelectGrid").val(data.city);
        $("#postCodefloatingSelectGrid").val(data.postCode);
        $("#citizen").val(data.citizen);
        $("#phoneNumber").val("0" + data.phoneNumber);
        $("#bankfloatingSelectGrid").val(data.bank);
        $("#bookBank").val(data.bookBank);
        $("#bookBankBranch").val(data.bookBankBranch);
        $("#bookBankNumber").val(data.bookBankNumber);
        $("#username").val(data.username);
      },
    });
  });

  $(document).on("click", ".repass", (event) => {
    var button = event.target;
    var dataId = $(button).data("id");

    const newpass = prompt("กรุณาใส่รหัสผ่านใหม่:");
    if(!newpass){return}
    const passCon = prompt("กรุณาใส่รหัสผ่านใหม่อีกครั้ง :");
    if(newpass!=passCon){return}
    if(confirm('ยืนยันการเปลี่ยนรหัสผ่านหรือไม่?'))
    $.ajax({
      url: "/admin",
      method: "POST",
      data: { username: dataId,password: newpass, action: "Password" },
      dataType: "JSON",
      success: (data) => {
        $("#message").html(
          '<div class="alert alert-success">' + data.message + "</div>"
        );
        setTimeout(function () {
          $("#message").html("");
        }, 5000);
      },
    });
  });
  load_data($('#currentPage').val())
  
});
