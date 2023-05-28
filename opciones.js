const segundosEntreModales = 60;
const tiempoEntreModales = segundosEntreModales * 1000;

var cuenta = getParameterByName("cuenta");
// var mapaConsultado = getParameterByName("mapaConsultado");
$(document).ready(function () {
  cuenta = cuenta === "true"; // Convertir a tipo booleano

  if (cuenta) {
    showButtons(true);
  } else {
    showButtons(false);
  }

  setTimeout(function () {
    showConfirmationModal();
  }, tiempoEntreModales);

  // Agregar controlador de eventos para el botón "Aperturar nueva cuenta"
  $(document).on("click", ".circular-button", function () {
    if ($(this).text() === "Cambiar un cheque") {
      $("#buttonsContainer").empty();
      var buttonsContainer = $("#buttonsContainer");
      buttonsContainer.append(
        '<div class="circular-button">Obtener número en la fila (5 min de espera)</div>'
      );
      buttonsContainer.append('<div class="circular-button">Sacar cita</div>');
    }
    if ($(this).text() === "Obtener número en la fila (5 min de espera)") {
      var tituloGigante = $("#tituloGigante");
      tituloGigante.css("font-size", "-=10px");
      tituloGigante.text(
        "Número de turno: 59. Diríjase a donde indique el mapa:"
      );

      $("#buttonsContainer").empty();
      var buttonsContainer = $("#buttonsContainer");
      buttonsContainer.append('<div><img src="mapaSillas.png"></div>');

      setTimeout(function () {
        redirectToIndex(true, cuenta);
      }, 10000);
    }
    if ($(this).text() === "Sacar cita") {
      Swal.fire({
        icon: "info",
        title: "Actualmente no hay citas",
        text: "Por el momento no hay fechas para citas",
        confirmButtonText: "Aceptar",
        customClass: {
          confirmButton: "swal-confirm-button-class",
        },
      }).then(function (result) {
        if (result.isConfirmed) {
        }
      });
    }
    if ($(this).text() === "Aperturar nueva cuenta") {
      var tituloGigante = $("#tituloGigante");
      tituloGigante.css("font-size", "-=10px");
      tituloGigante.text("Diríjase a donde indique el mapa:");

      $("#buttonsContainer").empty();
      var buttonsContainer = $("#buttonsContainer");
      buttonsContainer.append('<div><img src="mapaEscritorio.png"></div>');

      setTimeout(function () {
        redirectToIndex(true, cuenta);
      }, 10000);
    }
  });
});

function getParameterByName(name) {
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(window.location.href);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function showButtons(hasAccount) {
  var buttonsContainer = $("#buttonsContainer");

  if (hasAccount) {
    buttonsContainer.append(
      '<div class="circular-button">Cambiar un cheque</div>'
    );
    buttonsContainer.append(
      '<div class="circular-button">Seguros</div>'
    );
    buttonsContainer.append(
      '<div class="circular-button">Créditos</div>'
    );
    // buttonsContainer.append(
    //   '<div class="circular-button">Obtener número en la fila</div>'
    // );
    // buttonsContainer.append('<div class="circular-button">Sacar cita</div>');
  } else {
    buttonsContainer.append(
      '<div class="circular-button">Aperturar nueva cuenta</div>'
    );
    // $("#myImage").attr("src", "mapa.jpg");
  }
}

function showConfirmationModal() {
  let timerInterval;

  Swal.fire({
    title: "¿Deseas finalizar la sesión?",
    showCancelButton: true,
    confirmButtonText: "Sí, terminar",
    cancelButtonText: "Seguir viendo",
    timer: 10000,
    timerProgressBar: true,
    allowOutsideClick: false,
    allowEscapeKey: false,
    allowEnterKey: false,
    willOpen: function () {
      Swal.showLoading();
      timerInterval = setInterval(function () {
        const content = Swal.getContent();
        if (content) {
          const progressBar = content.querySelector(".swal2-progress-bar");
          if (progressBar) {
            progressBar.style.width =
              Swal.getTimerLeft() / Swal.getTimerProgressBarSteps() + "%";
          }
        }
      }, 100);
    },
    customClass: {
      confirmButton: "swal-confirm-button-class",
    },
  }).then(function (result) {
    if (result.isConfirmed) {
      redirectToIndex(true, cuenta);
    } else {
      setTimeout(function () {
        showConfirmationModal();
      }, tiempoEntreModales);
    }
  });
}

function redirectToIndex(mapaConsultado, cuenta) {
  var form = $(
    '<form action="banindex.html" method="get">' +
      '<input type="hidden" name="mapaConsultado" value="' +
      mapaConsultado +
      '">' +
      '<input type="hidden" name="cuenta" value="' +
      cuenta +
      '">' +
      "</form>"
  );
  $("body").append(form);
  form.submit();
}
