const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
})

load_data = (num) => {
    $.ajax({
      url: "/admin/ordersdata",
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
              onclick="action_modal.showModal()"
              data-id="${element.orderId}"
              ${element.status === 'การชำระเงินถูกยืนยัน' ? 'class="btn btn-success btn-sm confirm" inert' : element.status === 'ยังไม่ได้ส่งหลักฐานการชำระเงิน' ? 'class="btn btn-error btn-sm confirm" inert' : 'class="btn btn-warning btn-sm confirm"'}>

              

        หลักฐานการชำระเงิน
      </button>
      
          </td>
              <td>
            ${element.status}
              </td>
              <td>
            ${element.total} บาท
              </td>
              <td>
              ${element.totalQuantity}
                </td>
                <td>
                ${element.orderId}
                  </td>
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
      $(".page-link").removeClass("btn-active");
      $(this).addClass("btn-active");
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
        url: "/admin/ordersdata",
        method: "POST",
        data: $("#form").serialize(),
        dataType: "JSON",
        beforeSend: function () {
          $("#action_button").attr("disabled", "disabled");
        },
        success: function (data) {
          $("#action_button").attr("disabled", false);
  
          Toast.fire({
            icon: 'success',
            title: data.message
          })
  
          $("#action_modal").modal("hide");
          load_data(0);
  
        },
      });
    });
  
    $(document).on("click", ".confirm", (event) => {
      var button = event.target;
      var dataId = $(button).data("id");
      
      console.log('clicked!')
      $("#dynamic_modal_title").text("Confirm Data");
  
      
      $.ajax({
        url: "/admin/ordersdata",
        method: "POST",
        data: { orderId: dataId, action: "fetch_single" },
        dataType: "JSON",
        success: (data) => {
          $(".receipt").html("<img style='width:500px; margin:auto;' src="+data.receipts+"></img>");
          $("#orderId").val(data.orderId)
        },
      });
    });
  
    load_data($('#currentPage').val())
    
  });
  