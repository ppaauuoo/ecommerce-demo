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
              class="btn btn-warning btn-sm confirm"
              data-id="` +
        element.orderId +
        `"
        >
        หลักฐานการชำระเงิน
      </button>
      
          </td>
              <td>
                ` +
            element.orderId +
            `
              </td>
              <td>` +
            element.status +
            `
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
        url: "/admin/ordersdata",
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
  
    $(document).on("click", ".confirm", (event) => {
      var button = event.target;
      var dataId = $(button).data("id");
  
      $("#dynamic_modal_title").text("Confirm Data");
  
      $("#action_modal").modal("show");
      
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
  