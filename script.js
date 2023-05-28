$(document).ready(function() {
    $("#btnConCuenta").click(function() {
      redirectToOpciones(true);
    });
  
    $("#btnSinCuenta").click(function() {
      redirectToOpciones(false);
    });
  });
  
  function redirectToOpciones(cuenta) {
    var form = $('<form action="banindex.html" method="get">' +
      '<input type="hidden" name="cuenta" value="' + cuenta + '">' +
      '</form>');
    $('body').append(form);
    form.submit();
  }
  