$(() => {
  $("#searchbar").on("input", function () {
    var value = $(this).val().toLowerCase();
    $("#dataTable tr").filter(function () {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
    });
  });

  load_data = () => {
    $.ajax({
      url: "/admin",
      method: "POST",
      data: { action: "fetch" },
      dataType: "JSON",
      success: function (data) {
        var html = "";
        data.forEach((element) => {
          html +=
            `
            <tr>
              <td>
                ` +
            element.username +
            `
              </td>
              <td>` +
            element.fullName +
            `</td>
              <td>
                ` +
            element.address.address +
            ` / ` +
            element.address.subdistrict +
            `
                / ` +
            element.address.district +
            ` / ` +
            element.address.city +
            ` /
                ` +
            element.address.postCode +
            `
              </td>
              <td>
                ` +
            element.bank.bank +
            ` / ` +
            element.bank.bookBank +
            ` /
                ` +
            element.bank.bookBankNumber +
            ` /
                ` +
            element.bank.bookBankBranch +
            `
              </td>
              <td>` +
            element.userWallet.money +
            `</td>
              <td>` +
            element.userWallet.point +
            `</td>
              <td>
                <button
                  type="button"
                  class="btn btn-warning btn-sm edit"
                  data-id="` +
            element._id +
            `"
                >
                  Edit
                </button> 
              </td>
            </tr>
            `;
        });
        $("#dataTable").html(html);
      },
    });
  };

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

        load_data();

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

    $("#action").val("Edit");

    $("#action_modal").modal("show");

    $.ajax({
      url: "/admin",
      method: "POST",
      data: { id: dataId, action: "fetch_single" },
      dataType: "JSON",
      success: (data) => {
        $("#fullNamefloatingInput").val(data.fullName);
        $("#addressfloatingInput").val(data.address.address);
        $("#districtfloatingSelectGrid").val(data.address.district);
        $("#subdistrictfloatingSelectGrid").val(data.address.subdistrict);
        $("#cityfloatingSelectGrid").val(data.address.city);
        $("#postCodefloatingSelectGrid").val(data.address.postCode);
        $("#citizen").val(data.citizen);
        $("#phoneNumber").val("0" + data.phoneNumber);
        $("#bankfloatingSelectGrid").val(data.bank.bank);
        $("#bookBank").val(data.bank.bookBank);
        $("#bookBankBranch").val(data.bank.bookBankBranch);
        $("#bookBankNumber").val(data.bank.bookBankNumber);
        $("#id").val(data._id);
      },
    });
  });
});
