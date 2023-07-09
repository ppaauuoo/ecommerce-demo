load_data = (num) => {
    $.ajax({
      url: "/admin/tree",
      method: "POST",
      data: { page: num, action: "fetch" },
      dataType: "JSON",
      success: function (data) {
        
        var html = "";
        data.forEach((e) => {
          html += `<div class="col-md-3 col-sm-4 col-xs-6 col-12">
  <div class="container dashboarditems " style="text-align: center;">
    <a href="/user/${e.username}">
      <i class="fa-solid fa-person fa-7x" style="color: red"></i>
      <h1
        style="
          font-family: 'Roboto', sans-serif;
          font-size: 25px;
          font-weight: 400;
          line-height: 30px;
        "
      >
        ${e.username}
      </h1>
    </a>
  </div>
</div>
`;
        });
        $("#tree").html(html);
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
      $(".dashboarditems").filter(function () {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
      });
    });

    load_data(0)
})